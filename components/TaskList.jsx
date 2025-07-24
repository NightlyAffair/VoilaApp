import {Text, StyleSheet, View, Alert, TouchableOpacity, Dimensions} from "react-native";
import {useCallback, useEffect, useMemo, useState, useRef} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import TaskButton from "./TaskButton";
import CategoryButton from "./CategoryButton";
import EditTaskModal from "./EditTaskModal";
import { Plus } from 'lucide-react-native';
import Animated, {Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";
import {Gesture, GestureDetector} from "react-native-gesture-handler";

export default function TaskList() {
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [dragState, setDragState] = useState({isDragging: false, targetCategoryId: null});
    const [categoryLayouts, setCategoryLayouts] = useState({});
    const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
    const [editTaskObject, setEditTaskObject] = useState({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = JSON.parse(await AsyncStorage.getItem("data"));
                setCategories(data.categories);
                setAllTasks(data.tasks);
                setCurrentCategory(data.categories[0]);
            } catch (error) {
                console.error("Error loading data:", error);
            }
        };

        loadData();
    }, []);

    const tasks = useMemo(() => {
        if (!currentCategory) return [];
        return allTasks.filter(task => task.categoryId === currentCategory.id);
    }, [currentCategory?.id, allTasks]);

    const updateCategoryName = useCallback((categoryObject, newName) => {
        const newCategories = categories.map(category => {
            if (category.id === categoryObject.id) {
                return { ...category, name: newName };
            }
            return category;
        });

        setCategories(newCategories);
        AsyncStorage.setItem("data", JSON.stringify({
            categories: newCategories,
            tasks: allTasks
        }));

        if (currentCategory?.id === categoryObject.id) {
            setCurrentCategory({ ...categoryObject, name: newName });
        }
    }, [categories, allTasks, currentCategory]);

    const navigateToCategory = useCallback((item) => {
        setCurrentCategory(item);
    }, []);

    const isSelected = useCallback((categoryName) => {
        return currentCategory?.name === categoryName;
    }, [currentCategory]);

    const reorderCategories = useCallback((fromIndex, toIndex) => {
        const newCategories = [...categories];
        const [movedCategory] = newCategories.splice(fromIndex, 1);
        newCategories.splice(toIndex, 0, movedCategory);

        setCategories(newCategories);
        AsyncStorage.setItem("data", JSON.stringify({
            categories: newCategories,
            tasks: allTasks
        }));
    }, [categories, allTasks]);

    const handleDoubleTap = useCallback((item) => {
        if (item.name === "ToDo" || item.name === "Completed") {
            Alert.alert("Unable to change the name of this category");
            return;
        }
        Alert.prompt(
            "Edit Category",
            "Enter new category name:",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Save",
                    onPress: (newName) => {
                        if (newName && newName.trim()) {
                            updateCategoryName(item, newName);
                        }
                    }
                }
            ],
            "plain-text",
            item.name
        );
    }, [updateCategoryName]);


    const handleCategoryLayout = useCallback((categoryId, layout) => {
        console.log('Storing layout for category:', categoryId, layout);
        setCategoryLayouts(prev => ({
            ...prev,
            [categoryId]: layout
        }));
    }, []);

    const handleDragStateChange = useCallback((isDragging, targetCategoryId) => {
        setDragState({ isDragging , targetCategoryId });
    }, [])

    const changeTaskCategory = useCallback((taskObject, targetCategoryId) => {
        const newTasks = allTasks.map(task => {
            if(task.id === taskObject.id) {
                return {... taskObject, categoryId: targetCategoryId };
            } else {
                return task;
            }
        });

        setAllTasks(newTasks);

        AsyncStorage.setItem("data", JSON.stringify({
            categories: categories,
            tasks: newTasks,
        }))
    },[allTasks, categories]);

    //Puts the task in completed when checkbox is ticked
    const handleCheckboxCheck = useCallback((taskObject) => {
        const category = categories.find(category => category.name === "Completed");
        const newTask = {... taskObject, checked: true };
        if (category) {
            changeTaskCategory(newTask, category.id);
        }
    }, [categories, changeTaskCategory]); // Add dependencies

    const handleCheckboxUncheck = useCallback((taskObject) => {
        const category = categories.find(category => category.name === "ToDo");
        const newTask = {... taskObject, checked: false };
        if (category) {
            changeTaskCategory(newTask, category.id);
        }
    },[categories, changeTaskCategory])

    const onDeleteTask = useCallback((taskObject) => {
        const newTasks = allTasks.filter(task => task.id !== taskObject.id);
        setAllTasks(newTasks);
        AsyncStorage.setItem("data", JSON.stringify({
            categories:categories,
            tasks: newTasks
        }))
    }, [allTasks, categories])

    const onSaveTask = useCallback((taskObject) => {
        let taskFound = false;
        const newTasks = allTasks.map(
            task => {
                if(task.id === taskObject.id) {
                    taskFound = true;
                    return taskObject;
                }
                return task;
            }
        )
        if (!taskFound) {
            newTasks.unshift(taskObject);
        }
        setAllTasks(newTasks);
        AsyncStorage.setItem("data", JSON.stringify({
            categories:categories,
            tasks: newTasks
        }))
    }, [allTasks, categories])

    const generateShortId = () => {
        return 'xxxx-xxxx-xxxx'.replace(/[x]/g, function() {
            return (Math.random() * 16 | 0).toString(16);
        });
    };

    const newTaskObject = () => {
        //Create a null task
        return ({
            id: generateShortId(),
            title: null,
            description: null,
            dateTime: null,
            categoryId: "c1",
            checked: false,
            reminderTime: null
        })
    }

    const translateX  = useSharedValue(0);

    const { width: screenWidth } = Dimensions.get('window');

    const animatedStyle = useAnimatedStyle(() => ({
        flex: 1,
        width: '100%',
        transform : [{translateX: translateX.value}]
    }))

// Simple approach - just change category immediately
    const swipeGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
        })
        .onEnd((event) => {
            const currentIndex = categories.findIndex((cat) => cat.id === currentCategory.id);
            const threshold = 30;

            if (Math.abs(event.translationX) > threshold) {
                let nextIndex;

                if (event.translationX < 0 && currentIndex < categories.length - 1) {
                    // Swiping left - go to next category
                    nextIndex = currentIndex + 1;
                    runOnJS(navigateToCategory)(categories[nextIndex]);
                    console.log(currentIndex);
                } else if (event.translationX > 0 && currentIndex > 0) {
                    // Swiping right - go to previous category
                    nextIndex = currentIndex - 1;
                    runOnJS(navigateToCategory)(categories[nextIndex]);
                }
            }

            // Always reset position
            translateX.value = withTiming(0, { duration: 300 });
        });

    return (
        <View style={styles.container}>
            <View style={styles.categories}>
                {categories.map((categoryObject, index) => (
                    <CategoryButton
                        key={`category-${categoryObject.id}`}
                        categoryObject={categoryObject}
                        index={index}
                        isSelected={isSelected(categoryObject.name)}
                        onTap={navigateToCategory}
                        onDoubleTap={handleDoubleTap}
                        onReorder={reorderCategories}
                        totalCategories={categories.length}
                        isDropTarget={dragState.targetCategoryId === categoryObject.id}
                        onLayout={handleCategoryLayout}
                    />
                ))}
            </View>

            <GestureDetector gesture={swipeGesture}>
                <Animated.View style={[animatedStyle]}>
                    <View style={styles.tasks}>
                        {tasks.map((item, index) => (
                            <TaskButton
                                key={`task-${item.id || index}`}
                                taskObject={item}
                                onTap={() =>{
                                    setEditTaskModalVisible(true);
                                    setEditTaskObject(item);
                                }}
                                onDrop={changeTaskCategory}
                                onDragStateChange={handleDragStateChange}
                                categoryLayouts={categoryLayouts}
                                handleCheckboxCheck={handleCheckboxCheck}
                                handleCheckboxUncheck={handleCheckboxUncheck}
                                onDeleteTask={onDeleteTask}
                            />
                        ))}
                    </View>
                </Animated.View>
            </GestureDetector>
            <TouchableOpacity onPress={() => {
                setEditTaskModalVisible(true);
                setEditTaskObject(newTaskObject());
            }} style={styles.addButton}>
                <Plus size={20} color={"white"}/>
            </TouchableOpacity>
            <EditTaskModal
                visibility={editTaskModalVisible}
                taskObject={editTaskObject}
                onClose={() => setEditTaskModalVisible(false)}
                onSaveTask={onSaveTask}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    categories: {
        flexDirection: "row",
        paddingLeft: 20,
    },
    tasks: {
        flexDirection: "column",
        marginTop: 15,
        alignSelf: "center",
        width: "90%",
    },
    addButton: {
        backgroundColor: "purple",
        height: 60,  // Made it bigger for better touch target
        width: 60,
        borderRadius: 30,  // Half of width/height for perfect circle
        alignItems: "center",
        justifyContent: "center",
        position: 'absolute',  // Position absolutely
        bottom: 40,            // Distance from bottom
        alignSelf: 'flex-start',   // Center horizontally
        right: 40,

        // 3D floating effect
        elevation: 8,           // Android shadow
        shadowColor: '#000',    // iOS shadow
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,

        // Optional: Add a subtle gradient effect with a border
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    }
})
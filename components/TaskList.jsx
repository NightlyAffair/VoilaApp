import {Text, StyleSheet, View, Alert} from "react-native";
import {useCallback, useEffect, useMemo, useState, useRef} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import TaskButton from "./TaskButton";
import CategoryButton from "./CategoryButton";

export default function TaskList() {
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [dragState, setDragState] = useState({isDragging: false, targetCategoryId: null});
    const [categoryLayouts, setCategoryLayouts] = useState({});

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
            tasks: allTasks
        }))
    })

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
            <View style={styles.tasks}>
                {tasks.map((item, index) => (
                    <TaskButton
                        key={`task-${item.id || index}`}
                        taskObject={item}
                        onTap={(task) => console.log('Task tapped:', task.title)}
                        onDrop={changeTaskCategory}
                        onDragStateChange={handleDragStateChange}
                        categoryLayouts={categoryLayouts}
                        handleCheckboxCheck={handleCheckboxCheck}
                        handleCheckboxUncheck={handleCheckboxUncheck}
                        onDeleteTask={onDeleteTask}
                    />
                ))}
            </View>
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
    }
})
import {Text, StyleSheet, View, Alert} from "react-native";
import {useCallback, useEffect, useMemo, useState, useRef} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Task from "./Task";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';

// Separate component for animated category button
const CategoryButton = ({ categoryObject, index, isSelected, onTap, onDoubleTap, onReorder, totalCategories }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value }
        ],
        zIndex: scale.value > 1 ? 999 : 0,
    }));

    const singleTap = Gesture.Tap()
        .numberOfTaps(1)
        .onEnd(() => {
            runOnJS(onTap)(categoryObject);
        });

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            runOnJS(onDoubleTap)(categoryObject);
        });

    const longPress = Gesture.Pan()
        .onStart(() => {
            scale.value = withSpring(1.1);
        })
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd((event) => {
            const buttonWidth = 80;
            const newIndex = Math.round((event.absoluteX - 20) / buttonWidth);
            const clampedIndex = Math.max(0, Math.min(totalCategories - 1, newIndex));

            if (clampedIndex !== index) {
                runOnJS(onReorder)(index, clampedIndex);
            }

            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            scale.value = withSpring(1);
        });

    const tapGestures = Gesture.Exclusive(doubleTap, singleTap);
    const combinedGesture = Gesture.Simultaneous(longPress, tapGestures);

    return (
        <GestureDetector gesture={combinedGesture}>
            <Animated.View style={[
                styles.categoryButtons,
                isSelected ? styles.selectedButton : styles.unselectedButton,
                animatedStyle
            ]}>
                <Text style={[
                    isSelected ? styles.selectedText : styles.unselectedText
                ]}>
                    {categoryObject.name}
                </Text>
            </Animated.View>
        </GestureDetector>
    );
};

export default function TaskList() {
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [tasks, setTasks] = useState([]);

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

    useEffect(() => {
        if (currentCategory) {
            setTasks(allTasks.filter(task => task.categoryId === currentCategory.id));
        }
    }, [currentCategory, allTasks]);

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
                    />
                ))}
            </View>
            <View style={styles.tasks}>
                {tasks.map((item, index) => (
                    <Task task={item} key={`task-${index}`} />
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
    categoryButtons: {
        paddingVertical: 4,
        paddingHorizontal: 7,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        borderWidth: 1,
    },
    selectedButton: {
        backgroundColor: '#310069'
    },
    unselectedButton: {
        backgroundColor: 'white'
    },
    selectedText: {
        color: "white",
        fontWeight: "bold",
    },
    unselectedText: {
        color: "black",
        fontWeight: "bold",
    },
    tasks: {
        flexDirection: "column",
        marginTop: 15,
        alignSelf: "center",
        width: "90%",
    }
})
import {Text, StyleSheet, View, Alert} from "react-native";
import {useCallback, useEffect, useMemo, useState} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Task from "./Task";
import {Gesture, GestureDetector} from "react-native-gesture-handler";



export default function TaskList() {

    //Set to do as the default current category
    const [currentCategory, setCurrentCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [tasks, setTasks] = useState([]);

    //Load all categories on start
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

        loadData(); // Call the async function
    }, []);

    //Load tasks based on current category
    useEffect(() => {
        setTasks(allTasks.filter(task => task.categoryId === currentCategory.id));
    },[currentCategory]);

    //Handle renaming of category
    const updateCategoryName = useCallback((item, newName) => {
        const newCategories = [];
        categories.map((category) => {
            if(category === item) {
                newCategories.push(newName);
            } else {
                newCategories.push(category);
            }
        })
        AsyncStorage.setItem("categories", JSON.stringify(newCategories));
        setCategories(newCategories);
    },[]);

    //Change in category
    const navigateToCategory = useCallback((item) => {
        setCurrentCategory(item);
    },[]);

    //Currently selected Category
    const isSelected = useCallback((category) => {
        return currentCategory.name === category;
    },[currentCategory]);

    //Handles tapping, double tap and long press of categories
    const createGestures = useCallback((item) => {
        const singleTap = Gesture.Tap()
            .numberOfTaps(1)
            .onEnd(() => {
                navigateToCategory(item);
            });

        const doubleTap = Gesture.Tap()
            .numberOfTaps(2)
            .onEnd(() => {
                if (item === "ToDo" || item ==="Completed") {
                    Alert.alert(
                        "Unable to change the name of this category"
                    )
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
                                    // Update your category here
                                    updateCategoryName(item, newName);
                                }
                            }
                        }
                    ],
                    "plain-text",
                    item // Current category name as default
                );
            });

        // Combine gestures - double tap takes priority
        return Gesture.Exclusive(doubleTap, singleTap);
    }, [navigateToCategory]);

    const categoryButtons = useMemo(() => {
        return categories.map((categoryObject, index) => {
            const item = categoryObject.name;
            const combinedGesture = createGestures(categoryObject);

            return (
                <GestureDetector gesture={combinedGesture} key={`category-${index}`}>
                    <View style={[
                        styles.categoryButtons,
                        isSelected(item) ? styles.selectedButton : styles.unselectedButton
                    ]}>
                        <Text style={[
                            isSelected(item) ? styles.selectedText : styles.unselectedText
                        ]}>
                            {item}
                        </Text>
                    </View>
                </GestureDetector>
            );
        });
    }, [categories, currentCategory, createGestures, isSelected]);

    return(
        <View style={styles.container}>
            <View style={styles.categories}>
                {categoryButtons}
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
        paddingVertical: 4,           // Top/bottom padding
        paddingHorizontal: 7,         // Left/right padding
        borderRadius: 8,               // Rounded corners
        alignItems: 'center',          // Center text horizontally
        justifyContent: 'center',      // Center text vertically
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
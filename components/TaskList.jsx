import {Text, StyleSheet, TouchableOpacity, View} from "react-native";
import {useCallback, useEffect, useMemo, useState} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Task from "./Task";
import {Gesture, GestureDetector} from "react-native-gesture-handler";


export default function TaskList() {

    //Set to do as the default current category
    const [currentCategory, setCurrentCategory] = useState("ToDo");
    const [categories, setCategories] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    //Load all categories on start
    useEffect(() => {
        const loadCategories= async () => {
            const saved = JSON.parse(await AsyncStorage.getItem("categories"));
            if(saved) {
                setCategories(saved.categories);
            }
        }

        loadCategories();
    }, [])



    //Load task for current category
    useEffect(() => {
        const loadTasks = async () => {
            const allTasks = JSON.parse(await AsyncStorage.getItem("tasks"));
            if(allTasks && allTasks[currentCategory]) {
                setTasks(allTasks[currentCategory]);
            } else {
                setTasks([]);
            }
        }

        loadTasks()
    },[currentCategory]);

    console.log(tasks.length);

    const navigateToCategory = useCallback((item) => {
        setCurrentCategory(item);
    },[]);

    const isSelected = useCallback((category) => {
        return currentCategory === category;
    },[currentCategory]);

    const createGestures = useCallback((item) => {
        const singleTap = Gesture.Tap()
            .numberOfTaps(1)
            .onEnd(() => {
                navigateToCategory(item);
            });

        const doubleTap = Gesture.Tap()
            .numberOfTaps(2)
            .onEnd(() => {
                setModalVisible(true);
            });

        // Combine gestures - double tap takes priority
        return Gesture.Race(doubleTap, singleTap);
    }, [navigateToCategory]);

    const categoryButtons = useMemo(() => {
        return categories.map((item, index) => {
            const combinedGesture = createGestures(item);

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
import {Text, TouchableOpacity, View} from "react-native";
import {useEffect, useState} from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Task from "./Task";


export default function TaskList() {

    //Set to do as the default current category
    const [currentCategory, setCurrentCategory] = useState("ToDo");
    const [categories, setCategories] = useState([]);
    const [tasks, setTasks] = useState([]);

    //Load all categories on start
    useEffect(() => {
        const loadCategories= async () => {
            const saved = await AsyncStorage.getItem("categories");
            if(saved) {
                setCategories(saved);
            }
        }
    }, [])



    //Load task for current category
    useEffect(() => {
        const loadTasks = async () => {
            const saved = await AsyncStorage.getItem("tasks");
            if(saved) {
                setTasks(saved);
            } else {
                setTasks([]);
            }
        }
    },[currentCategory]);

    const navigateToCategory = (item) => {
        setCurrentCategory(item);
    }

    return(
        <View style={styles.container}>
            <View style={styles.categories}>
                {categories.map((item, index) => (
                    <TouchableOpacity style = {styles.categoryButtons}  onPress={() => {navigateToCategory(item)}}>
                        {item};
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.tasks}>
                {tasks.map((item, index) => (
                    Task(item)
                ))}
            </View>
        </View>
    );
}
import AsyncStorage from "@react-native-async-storage/async-storage";

function LoadDefault() {
    const categories = {
        categories: ["ToDo", "Work", "School", "Completed"]
    }

    const tasks = {
        "ToDo": [
            {
                title : "Learn to use voila",
                description : "Learn to use voila",
                date: new Date(),
                time: "18:00:00"
            },
            {
                title : "Enable Shortcuts",
                description : "Learn to use voila",
                date: new Date(),
                time: "18:00:00"
            }
        ]
    }

    AsyncStorage.setItem("categories", JSON.stringify(categories))
    AsyncStorage.setItem("tasks", JSON.stringify(tasks));

}

export default LoadDefault;
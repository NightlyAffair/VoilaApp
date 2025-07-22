import AsyncStorage from "@react-native-async-storage/async-storage";

function LoadDefault() {

    const data = {
        categories: [
            {id: "c1", name: "ToDo", order: 0},
            {id: "c2", name: "Work", order: 0},
            {id: "c3", name: "School", order: 0},
            {id: "c4", name: "Completed", order: 0},
        ],
        tasks : [
            {   id:'t1',
                title : "Learn to use voila",
                description : "Learn to use voila",
                date: new Date(),
                time: "18:00:00",
                categoryId: "c1",
                checked: false,
                reminderTime: "17:00:00",
            },
            {   id:'t2',
                title : "Enable Shortcuts",
                description : "Learn to use voila",
                date: new Date(),
                time: "18:00:00",
                categoryId: "c1",
                checked: false,
                reminderTime: "18:00:00",
            }
        ]

    }

    AsyncStorage.setItem("data", JSON.stringify(data))
}

export default LoadDefault;
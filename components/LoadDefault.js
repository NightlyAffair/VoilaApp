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
                dateTime: new Date(),
                categoryId: "c1",
                checked: false,
                reminderTime: "null",
            },
            {   id:'t2',
                title : "Enable Shortcuts",
                description : "Learn to use voila",
                dateTime: new Date(),
                categoryId: "c1",
                checked: false,
                reminderTime: null,
            },
            {   id:'t3',
                title : "Enable null support",
                description : null,
                dateTime: null,
                categoryId: "c1",
                checked: false,
                reminderTime: null,
            },
            {   id:'t4',
                title : "Enable Shortcuts",
                description : "Learn to use voila",
                dateTime: new Date(),
                categoryId: "c1",
                checked: false,
                reminderTime: null,
            },
            {   id:'t5',
                title : "Enable Shortcuts",
                description : "Learn to use voila",
                dateTime: null,
                categoryId: "c1",
                checked: false,
                reminderTime: null,
            },
            {   id:'t6',
                title : "Enable null support",
                description : null,
                dateTime: null,
                categoryId: "c1",
                checked: false,
                reminderTime: null,
            },
        ]

    }

    AsyncStorage.setItem("data", JSON.stringify(data))
}

export default LoadDefault;
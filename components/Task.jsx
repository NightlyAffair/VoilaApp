import {TouchableOpacity, View} from "react-native";
import Checkbox from 'expo-checkbox';
import {useEffect, useState} from "react";

export default function Task(task) {
    const [isChecked, setChecked] = useState(false);
    const [title, setTitle] = useState();
    const [description, setDescription] = useState();
    const [date, setDate] = useState();
    const [time, setTime] = useState();

    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description);
        setDate(task.date);
        setTime(task.time);
    },[task])

    return (
        <View style={styles.container}>
            <Checkbox
                style={styles.checkbox}
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? '#4630EB' : undefined}
            />
            <View style={{}}
        </View>
    )
}

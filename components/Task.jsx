import {TouchableOpacity, Text, StyleSheet, View} from "react-native";
import Checkbox from 'expo-checkbox';
import {useEffect, useState} from "react";
import checkbox from "expo-checkbox/src/Checkbox";

export default function Task( {task} ) {
    const [isChecked, setChecked] = useState(false);
    const [title, setTitle] = useState();
    const [description, setDescription] = useState();
    const [date, setDate] = useState();
    const [time, setTime] = useState();

    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description);
        setDate(new Date(task.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }));
        const [hours, minutes] = task.time.split(':');
        const hour12 = ((parseInt(hours) + 11) % 12) + 1;
        const ampm = parseInt(hours) >= 12 ? 'pm' : 'am';
        setTime(`${hour12}:${minutes}${ampm}`);
    },[task])





    return (
        <View style={styles.container}>
            <Checkbox
                style={styles.checkbox}
                value={isChecked}
                onValueChange={setChecked}
                color={isChecked ? '#4630EB' : undefined}
            />
            <View style={styles.task}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.deadline}>
                    <Text style={styles.dateTime}>{date} | {time}</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderWidth: 1,
        width: '100%',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 8,
        marginVertical: 5,
    },

    checkbox: {
        marginHorizontal: 13,
    },

    task: {
        flexDirection: 'column',
    },

    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: "#3b3934",
    },

    deadline: {
        flexDirection: 'row',
    },

    dateTime: {
        fontSize: 10,
    },


})

import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import { Ionicons } from '@expo/vector-icons';


export default function Header() {

    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = today.toLocaleDateString('en-US', { month: 'long' });
    const year = today.getFullYear();
    const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });


    return (
        <View style={styles.container}>
            <Text style={styles.text}>Today's Voila</Text>
            <View style={styles.right}>
                <View style = {styles.date}>
                    <Text>{day}/{month}/{year}</Text>
                    <Text>{dayName}</Text>
                </View>
                <TouchableOpacity onPress={() => {handleSettingsPress}}>
                    <Ionicons name="settings" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding:20,
    },
    date: {
        alignItems: 'center',
        paddingRight:20
    },
    right: {
        flexDirection: 'row',
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
    }
})
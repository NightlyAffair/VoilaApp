import {Text, StyleSheet, View, Alert, TouchableOpacity, Dimensions, Button} from "react-native";
import {useLayoutEffect} from "react";
import scheduleNotification from "../components/NotificationHandler";

export default function SettingsScreen({navigation, route})
{
    const { hasNotificationPermission } = route.params;

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false
        });
    }, [navigation]);

    const testNotificationNow = async () => {
        const testTime = new Date();
        testTime.setSeconds(testTime.getSeconds() + 5);

        const id = await scheduleNotification(
            "Test from Settings 🧪",
            "Your notifications are working!",
            testTime,
            "t1"
        );

    };

    return(
        <View style={styles.container}>
            <Text>Notification Permission: {hasNotificationPermission ? 'Granted' : 'Denied'}</Text>
            <Button onPress={() => testNotificationNow()} title={"test"}></Button>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
})
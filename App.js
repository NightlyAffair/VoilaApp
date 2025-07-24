import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { useEffect, useState } from "react";
import LoadDefault from "./components/LoadDefault";
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

//Configure how notifications should be displayed
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export default function App() {
    const Stack = createStackNavigator();
    const [firstStartup, setFirstStartup] = useState(true);
    const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

    useEffect(() => {
        setupNotifications();
        setupNotificationCategories();
    }, []);

    const setupNotifications = async () => {
        // Check if we already asked for permissions
        const hasAskedBefore = await AsyncStorage.getItem('hasAskedNotificationPermission');

        if (!hasAskedBefore) {
            // First time - request permissions
            const { status } = await Notifications.requestPermissionsAsync();

            // Save that we've asked
            await AsyncStorage.setItem('hasAskedNotificationPermission', 'true');

            if (status === 'granted') {
                setHasNotificationPermission(true);
                await AsyncStorage.setItem('notificationPermissionGranted', 'true');
            }
        } else {
            // Check current permission status
            const { status } = await Notifications.getPermissionsAsync();
            setHasNotificationPermission(status === 'granted');
        }
    };

    const setupNotificationCategories = async () => {
        // Set up task reminder category ONCE
        await Notifications.setNotificationCategoryAsync('task_reminder', [
            {
                identifier: 'complete',
                buttonTitle: '✅ Complete',
                options: {opensAppToForeground: true},
            },
            {
                identifier: 'snooze',
                buttonTitle: '⏰ Snooze',
                options: {opensAppToForeground: true},
            },
        ]);
    }


    if(firstStartup) {
        setFirstStartup(false);
        LoadDefault();
    }
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name = 'Home' component={HomeScreen} />
                <Stack.Screen name = 'Settings' component={SettingsScreen}  initialParams={{ hasNotificationPermission: hasNotificationPermission }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
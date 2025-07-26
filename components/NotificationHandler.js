import * as Notifications from 'expo-notifications';

const scheduleNotification = async (title, body, triggerTime) => {
    try {


        // Check if we have permission first
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            console.log('No notification permission');
            return null;
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                categoryIdentifier: 'task_reminder'
            },
            trigger: {
                date: new Date(triggerTime), // Date object
            },
        });

        console.log('Scheduled notification with ID:', notificationId);
        return notificationId;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
    }
};

export default scheduleNotification;


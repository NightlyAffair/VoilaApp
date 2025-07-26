import * as Notifications from 'expo-notifications';

const scheduleNotification = async (title, body, triggerTime) => {
    try {
        // Check if we have permission first
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
            console.log('No notification permission');
            return null;
        }

        // Check if the trigger time is in the past
        const now = new Date();
        const scheduledTime = new Date(triggerTime);

        if (scheduledTime <= now) {
            console.log('Notification time is in the past, not scheduling');
            return null;
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
                categoryIdentifier: 'task_reminder'
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: scheduledTime
            },
        });

        console.log('Scheduled notification with ID:', notificationId);
        console.log('Scheduled for:', scheduledTime.toString());
        return notificationId;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        return null;
    }
};

export default scheduleNotification;


import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {useCallback, useEffect, useState} from "react";
import {StyleSheet, Text, View} from "react-native";
import Checkbox from "expo-checkbox";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    runOnJS,
    withSpring
} from 'react-native-reanimated';


export default function TaskButton ({taskObject, onTap, onDrop, onDragStateChange, categoryLayouts}) {
    const [isChecked, setChecked] = useState(false);
    const [title, setTitle] = useState();
    const [description, setDescription] = useState();
    const [date, setDate] = useState();
    const [time, setTime] = useState();

    useEffect(() => {
        setTitle(taskObject.title);
        setDescription(taskObject.description);
        setDate(new Date(taskObject.date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }));
        const [hours, minutes] = taskObject.time.split(':');
        const hour12 = ((parseInt(hours) + 11) % 12) + 1;
        const ampm = parseInt(hours) >= 12 ? 'pm' : 'am';
        setTime(`${hour12}:${minutes}${ampm}`);
    },[taskObject])


    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const isDragging = useSharedValue(false);

    //Animated hook allows for animations
    const animatedStyle = useAnimatedStyle(() => ({
        //transform allows for the updates to be done on the UI thread rather than on the JS bridge
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],

        //To keep the task with higher scale in this case the selected task at the top over other tasks when dragging
        zIndex: isDragging.value ? 999 : 0,
        opacity: isDragging.value ? 0.8 : 1,
    }));


    const findDropTarget = useCallback((absoluteX, absoluteY) => {
        'worklet';

        // Pre-calculate these values once
        const containerPaddingLeft = 20;
        const containerPaddingTop = 90;
        const tolerance = 30;

        for(const [categoryId, layout] of Object.entries(categoryLayouts || {})) {
            const {x, y, width, height} = layout;

            // Use pre-calculated values
            const adjustedX = x + containerPaddingLeft;
            const adjustedY = y + containerPaddingTop;

            if(
                absoluteX >= adjustedX &&
                absoluteX <= adjustedX + width &&
                absoluteY >= adjustedY &&
                absoluteY <= adjustedY + height + tolerance
            ) {
                return categoryId;
            }
        }

        return null;
    }, [categoryLayouts]);

    const singleTap = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
        runOnJS(onTap)(taskObject);
    })

    const longPress = Gesture.Pan()
        .onStart(() => {
            isDragging.value = true;
            scale.value = 1.1;
        })
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;

            // Update drop target highlight in real-time
            const currentTarget = findDropTarget(event.absoluteX, event.absoluteY);

            if (onDragStateChange) {
                runOnJS(onDragStateChange)(true, currentTarget);
            }
        })
        .onEnd((event) => {
            const dropTargetId = findDropTarget(event.absoluteX, event.absoluteY);

            // Clear drag state and highlighting
            if (onDragStateChange) {
                runOnJS(onDragStateChange)(false, null);
            }

            if (dropTargetId && dropTargetId !== taskObject.categoryId) {
                // Animate to the target category position
                const targetLayout = categoryLayouts[dropTargetId];
                if (targetLayout) {
                    // Calculate the offset needed to reach the target
                    const targetOffsetX = targetLayout.x - event.absoluteX + event.translationX;
                    const targetOffsetY = targetLayout.y - event.absoluteY + event.translationY;

                    // Animate to target position
                    translateX.value = withSpring(targetOffsetX, {
                        damping: 15,
                        stiffness: 150,
                    }, () => {
                        // After animation completes, handle the drop
                        runOnJS(onDrop)(taskObject, dropTargetId);

                        // Then reset position
                        translateX.value = withSpring(0);
                        translateY.value = withSpring(0);
                        scale.value = withSpring(1);
                        isDragging.value = false;
                    });

                    translateY.value = withSpring(targetOffsetY, {
                        damping: 15,
                        stiffness: 150,
                    });

                    // Scale down slightly during the "fly to target" animation
                    scale.value = withSpring(0.9);
                }
            } else {
                // No valid drop target - reset position immediately
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                scale.value = withSpring(1);
                isDragging.value = false;
            }
        });

    const combinedGesture = Gesture.Exclusive(longPress, singleTap)

    return (
        <GestureDetector gesture={combinedGesture} >
            <Animated.View style={[styles.container, animatedStyle]}>
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
            </Animated.View>
        </GestureDetector>
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

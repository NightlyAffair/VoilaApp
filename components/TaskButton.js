import {Gesture, GestureDetector} from "react-native-gesture-handler";
import {useCallback, useEffect, useState} from "react";
import {Dimensions, StyleSheet, Text, View} from "react-native";
import Checkbox from "expo-checkbox";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    runOnJS,
    withSpring,
    withTiming,
    Easing,
} from 'react-native-reanimated';


export default function TaskButton ({taskObject, onTap, onDrop, onDragStateChange, categoryLayouts, handleCheckboxCheck, handleCheckboxUncheck, onDeleteTask}) {
    const [isChecked, setChecked] = useState(false);
    const [title, setTitle] = useState(null);
    const [description, setDescription] = useState(null);
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);

    useEffect(() => {
        setTitle(taskObject.title);
        setDescription(taskObject.description);
        if (taskObject.dateTime) {
            const dateTime = new Date(taskObject.dateTime);

            if (!isNaN(dateTime.getTime())) {
                setDate(dateTime.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                }));

                setTime(dateTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }));
            }
        }
    setChecked(taskObject.checked);
    },[taskObject])


    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const swipeX = useSharedValue(0);
    const scale = useSharedValue(1);
    const isDragging = useSharedValue(false);
    const opacity = useSharedValue(1);
    const { width: screenWidth } = Dimensions.get('window');

    //Animated hook allows for animations
    const animatedStyle = useAnimatedStyle(() => ({
        //transform allows for the updates to be done on the UI thread rather than on the JS bridge
        transform: [
            { translateX: translateX.value },
            { translateX: swipeX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],

        //To keep the task with higher scale in this case the selected task at the top over other tasks when dragging
        zIndex: isDragging.value ? 999 : 0,
        opacity: isDragging.value ? 0.8 : opacity.value,
    }));

    // Pre-calculate these values once
    const containerPaddingLeft = 20;
    const containerPaddingTop = 90;
    const tolerance = 30;

    const findDropTarget = useCallback((absoluteX, absoluteY) => {
        'worklet';

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

    const longPressGesture = Gesture.LongPress()
        .minDuration(500)  // Adjust duration as needed (500ms)
        .onStart(() => {
            'worklet';
            isDragging.value = true;
            scale.value = 1.1;
        })
        .onEnd(() => {
            'worklet';
        // Long press ends here, drag can now take over
    });


    const swipeAndDragGesture = Gesture.Pan()
        .onUpdate((event) => {
            'worklet';

            if(isDragging.value) { //Dragging
                translateX.value = event.translationX;
                translateY.value = event.translationY;
                // Update drop target highlight in real-time
                const currentTarget = findDropTarget(event.absoluteX, event.absoluteY);

                if (onDragStateChange) {
                    runOnJS(onDragStateChange)(true, currentTarget);
                }
            } else { //Swiping
                translateY.value = 0;
                // Only allow horizontal swipes
                if (Math.abs(event.translationY) > 30) {
                    return;
                }

                swipeX.value = event.translationX;
                const progress = Math.min(Math.abs(event.translationX) / (screenWidth / 2), 1);
                opacity.value = 1 - progress * 0.5;
            }
        })
        .onEnd((event) => {
            'worklet';
            if(isDragging.value) { //Dragging
                const dropTargetId = findDropTarget(event.absoluteX, event.absoluteY);

                // Clear drag state and highlighting
                if (onDragStateChange) {
                    runOnJS(onDragStateChange)(false, null);
                }

                if (dropTargetId && dropTargetId !== taskObject.categoryId) {
                    // Animate to the target category position
                    const targetLayout = categoryLayouts[dropTargetId];
                    if (targetLayout) {
                        const {x, y, width, height} = targetLayout;
                        const adjustedX = x + containerPaddingLeft;
                        const adjustedY = y + containerPaddingTop;

                        const targetX = adjustedX + width / 2;
                        const targetY = adjustedY + (height + tolerance / 2);

                        // Calculate the offset needed to reach the target
                        const targetOffsetX = targetX - event.absoluteX + event.translationX;
                        const targetOffsetY = targetY - event.absoluteY + event.translationY;

                        // Animate to target position
                        translateX.value = withTiming(targetOffsetX, {
                            duration: 500, // Adjust duration as needed
                            easing: Easing.linear,
                        }, () => {
                            // After animation completes, handle the drop
                            runOnJS(onDrop)(taskObject, dropTargetId);

                            // Then reset position
                            translateX.value = withTiming(0, { duration: 300 });
                            translateY.value = withTiming(0, { duration: 300 });
                            scale.value = withTiming(1, { duration: 300 });
                            isDragging.value = false;
                        });

                        translateY.value = withTiming(targetOffsetY, {
                            duration: 500,
                            easing: Easing.linear,
                        });

                        // Animate the scale instead of setting it to 0 directly
                        scale.value = withTiming(0, {
                            duration: 500,
                            easing: Easing.linear,
                        });
                    }
                } else {
                    // No valid drop target - reset position immediately
                    translateX.value = withSpring(0);
                    translateY.value = withSpring(0);
                    scale.value = withSpring(1);
                    isDragging.value = false;
                }
            } else { //Swiping
                const threshold = 70; //Minimum swipe distance to delete

                if(Math.abs(event.translationX) > threshold) {
                    swipeX.value = withTiming(event.translationX > 0 ? screenWidth : -screenWidth ,{
                        duration: 300,
                        easing: Easing.linear,
                    });
                    opacity.value = withTiming(0, {
                        duration: 200,
                    }, () => {
                        // Call delete function after animation
                        runOnJS(onDeleteTask)(taskObject);
                    });
                } else {
                    // Animate back to original position
                    swipeX.value = withTiming(0, { duration: 300 });
                    opacity.value = withTiming(1, {
                        duration: 300,
                    });
                }
            }
        })


    const combinedGesture = Gesture.Exclusive(
        Gesture.Simultaneous(longPressGesture, swipeAndDragGesture),
        singleTap
    );



    const dateTimeDisplay = useCallback(() => {
        if(!date && !time) {
            return "";
        } else {

            return `${date} | ${time}`;
        }
    }, [date, time]);
    

    return (
        <GestureDetector gesture={combinedGesture} >
            <Animated.View style={[styles.container, animatedStyle]}>
                <Checkbox
                    style={styles.checkbox}
                    value={isChecked}
                    onValueChange={(checked) => {
                        setChecked(checked)
                        checked ?  handleCheckboxCheck(taskObject): handleCheckboxUncheck(taskObject)
                    }}
                    color={isChecked ? '#4630EB' : undefined}
                />
                <View style={styles.task}>
                    <Text style={styles.title}>{title}</Text>
                    {
                        (dateTimeDisplay() !== "") &&
                        <View style={styles.deadline}>
                            <Text style={styles.dateTime}>{dateTimeDisplay()}</Text>
                        </View>
                    }
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
        height: 50
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




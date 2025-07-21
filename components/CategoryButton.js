import {Text, StyleSheet} from "react-native";
import {Gesture, GestureDetector} from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';

export default function CategoryButton({categoryObject, index, isSelected, onTap, onDoubleTap, onReorder, totalCategories, onLayout, isDropTarget= false}) {
        const translateX = useSharedValue(0);
        const translateY = useSharedValue(0);
        const scale = useSharedValue(1);


        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: scale.value }
            ],
            zIndex: scale.value > 1 ? 999 : 0,
            backgroundColor: isDropTarget ? '#8B5CF6' : (isSelected ? '#310069' : 'white'),
        }));

        const singleTap = Gesture.Tap()
            .numberOfTaps(1)
            .onEnd(() => {
                runOnJS(onTap)(categoryObject);
            });

        const doubleTap = Gesture.Tap()
            .numberOfTaps(2)
            .onEnd(() => {
                runOnJS(onDoubleTap)(categoryObject);
            });

        const longPress = Gesture.Pan()
            .onStart(() => {
                scale.value = 1.1;
            })
            .onUpdate((event) => {
                translateX.value = event.translationX;
                translateY.value = event.translationY;
            })
            .onEnd((event) => {
                const buttonWidth = 80;
                const newIndex = Math.round((event.absoluteX - 20) / buttonWidth);
                const clampedIndex = Math.max(0, Math.min(totalCategories - 1, newIndex));

                if (clampedIndex !== index) {
                    runOnJS(onReorder)(index, clampedIndex);
                }

                translateX.value = 0
                translateY.value = 0
                scale.value = 1;
            });

        const tapGestures = Gesture.Exclusive(doubleTap, singleTap);
        const combinedGesture = Gesture.Simultaneous(longPress, tapGestures);

    return (
        <GestureDetector gesture={combinedGesture}>
            <Animated.View style={[
                styles.categoryButtons,
                isSelected ? styles.selectedButton : styles.unselectedButton,
                animatedStyle
            ]}
                           onLayout={(event) => {
                               const { x, y, width, height } = event.nativeEvent.layout;
                               onLayout?.(categoryObject.id, { x, y, width, height });
                           }}
            >
                <Text style={[
                    isSelected ? styles.selectedText : styles.unselectedText
                ]}>
                    {categoryObject.name}
                </Text>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    categoryButtons: {
        paddingVertical: 4,
        paddingHorizontal: 7,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        borderWidth: 1,
    },
    selectedButton: {
        backgroundColor: '#310069'
    },
    unselectedButton: {
        backgroundColor: 'white'
    },
    selectedText: {
        color: "white",
        fontWeight: "bold",
    },
    unselectedText: {
        color: "black",
        fontWeight: "bold",
    },
})
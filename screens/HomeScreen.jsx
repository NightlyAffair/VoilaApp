import {SafeAreaView, View, StyleSheet, ImageBackground} from "react-native";
import Header from "../components/Header";
import TaskList from "../components/TaskList";
import {useLayoutEffect} from "react";

export default function HomeScreen({navigation}) {
    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: false
        });
    }, [navigation]);

    return (
        <ImageBackground
            style={styles.backgroundImage}
            source={require('../assets/VoilaLogo.png')}
            imageStyle={styles.imageStyle}
        >
            <View style={styles.container}>
                <SafeAreaView style={styles.safeView} />
                <Header />
                <TaskList />
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    backgroundImage: {
        height: '100%',
        backgroundColor: '#fff',
    },
    safeView: {
        marginTop: 30,
        backgroundColor: "#fff",
    },
    container: {
        height: "100%",
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
    },
    imageStyle: {
        resizeMode: "cover",
        transform: [{scale: 0.8}],
        top: 50,
        right: -250,
    }
})
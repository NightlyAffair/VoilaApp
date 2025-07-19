import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import {useState} from "react";
import LoadDefault from "./components/LoadDefault";

export default function App() {
  const Stack = createStackNavigator();
  const [firstStartup, setFirstStartup] = useState(true);

  if(firstStartup) {
      setFirstStartup(false);
      LoadDefault();
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name = 'Home' component={HomeScreen} />
        <Stack.Screen name = 'Settings' component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}


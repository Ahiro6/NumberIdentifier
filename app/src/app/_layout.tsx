import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function RootLayout() {
  return <GestureHandlerRootView style={{ flex: 1 }}>
    <Stack>
      <Stack.Screen name="index"
        options={{
          headerShown: true,
          title: 'Number Identifier',
          headerStyle: {
            backgroundColor: '#7C0902',
            // color: 'white',
          },
          headerTintColor: 'white'
        }} />
    </Stack>
  </GestureHandlerRootView>

}

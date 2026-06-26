import WebNumCanvas from "@/components/WebNumCanvas";
import { Text, View, StyleSheet } from "react-native";

const Main = () => {
  return (
    <View style={style.main}>
        <WebNumCanvas/>
    </View>
  )
}

const style = StyleSheet.create({
    main: {
        backgroundColor: '#3B3C36',
        borderRadius: 20
    }
})

export default Main
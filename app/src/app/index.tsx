import { Text, View, StyleSheet } from "react-native";
import Main from "@/tabs/Main";

export default function Index() {
  return (
    <View style={styles.container}>
      <Main/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#242124'
  },
});

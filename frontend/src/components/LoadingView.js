import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

/*
  Reusable loading state.

  This component gives clear feedback while the app restores a
  session or waits for backend data, preventing empty or confusing
  screens during API requests.
*/
export default function LoadingView({ message = "Loading..." }) {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" />
            <Text style={styles.text}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    /*
      Flexible container allows this component to be used both as
      a full-screen loading state and inside smaller screen sections.
    */
    container: {
        flex: 1,
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
    },

    text: {
        marginTop: 12,
        color: "#4b5563",
        fontWeight: "700",
        textAlign: "center",
    },
});
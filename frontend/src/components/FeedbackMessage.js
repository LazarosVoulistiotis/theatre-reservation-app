import { StyleSheet, Text } from "react-native";

/*
  Reusable feedback message.

  It provides consistent success, error and information messages
  after user actions such as register, login, search or reservation
  submission.
*/
export default function FeedbackMessage({ message, type = "error" }) {
    if (!message) {
        return null;
    }

    return (
        <Text
            style={[
                styles.message,
                type === "success" && styles.success,
                type === "info" && styles.info,
            ]}
            accessibilityRole="alert"
        >
            {message}
        </Text>
    );
}

const styles = StyleSheet.create({
    /*
      Default style is error because failed requests and validation
      messages are the most common feedback cases.
    */
    message: {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        padding: 12,
        borderRadius: 10,
        marginVertical: 8,
        fontWeight: "700",
        lineHeight: 20,
    },

    success: {
        backgroundColor: "#dcfce7",
        color: "#166534",
    },

    info: {
        backgroundColor: "#dbeafe",
        color: "#1e40af",
    },
});
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

/*
  Reusable application button.

  This component keeps button styling consistent across the app
  and supports loading/disabled states for better user feedback
  during API requests.
*/
export default function AppButton({
                                      title,
                                      onPress,
                                      disabled = false,
                                      loading = false,
                                      variant = "primary",
                                  }) {
    const isDisabled = disabled || loading;

    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                variant === "secondary" && styles.secondaryButton,
                variant === "danger" && styles.dangerButton,
                isDisabled && styles.disabledButton,
                pressed && !isDisabled && styles.pressedButton,
            ]}
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled, busy: loading }}
            hitSlop={6}
        >
            {loading ? (
                <ActivityIndicator color="#ffffff" />
            ) : (
                <Text style={styles.text}>{title}</Text>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    /*
      Primary button style used for the main action of each screen,
      such as login, register, search or confirm reservation.
    */
    button: {
        backgroundColor: "#1f2937",
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 6,
        minHeight: 50,
    },

    /*
      Secondary buttons are used for alternative actions,
      for example navigation or clearing search filters.
    */
    secondaryButton: {
        backgroundColor: "#4b5563",
    },

    /*
      Danger buttons are reserved for destructive actions,
      such as logout or reservation cancellation.
    */
    dangerButton: {
        backgroundColor: "#b91c1c",
    },

    /*
      Disabled state prevents repeated submissions while an API
      request is running and visually communicates that the action
      is temporarily unavailable.
    */
    disabledButton: {
        opacity: 0.6,
    },

    pressedButton: {
        opacity: 0.85,
    },

    text: {
        color: "#ffffff",
        fontWeight: "800",
        fontSize: 16,
    },
});
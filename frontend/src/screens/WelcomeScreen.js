import {
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import AppButton from "../components/AppButton";

/*
  WelcomeScreen is the public landing screen of the app.

  It briefly explains the system purpose and guides the user to account
  creation or login. This creates a clear entry point for the mobile
  theatre reservation workflow.
*/
export default function WelcomeScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.badge}>CN6035 Distributed Mobile App</Text>

                <Text style={styles.title}>Theatre Reservation App</Text>

                <Text style={styles.subtitle}>
                    Browse theatre performances, view available showtimes, select
                    specific seats, and manage your reservations securely from your
                    mobile device.
                </Text>

                <View style={styles.featureBox}>
                    <Text style={styles.featureText}>✓ JWT-based authentication</Text>
                    <Text style={styles.featureText}>✓ Real-time seat availability flow</Text>
                    <Text style={styles.featureText}>✓ Mobile booking and reservation management</Text>
                </View>

                <View style={styles.actions}>
                    <AppButton
                        title="Create Account"
                        onPress={() => navigation.navigate("Register")}
                    />

                    <AppButton
                        title="Login"
                        variant="secondary"
                        onPress={() => navigation.navigate("Login")}
                    />
                </View>

                <Text style={styles.footer}>
                    React Native · Node.js · MariaDB
                </Text>
            </View>
        </SafeAreaView>
    );
}

const cardShadow = Platform.select({
    web: {
        boxShadow: "0px 14px 32px rgba(15, 23, 42, 0.12)",
    },
    default: {
        shadowColor: "#000000",
        shadowOpacity: 0.12,
        shadowRadius: 14,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        elevation: 5,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        padding: 24,
    },

    card: {
        width: "100%",
        maxWidth: 720,
        alignSelf: "center",
        backgroundColor: "#ffffff",
        borderRadius: 26,
        padding: 28,
        ...cardShadow,
    },

    badge: {
        alignSelf: "flex-start",
        backgroundColor: "#e0f2fe",
        color: "#075985",
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: "900",
        marginBottom: 16,
    },

    title: {
        fontSize: 34,
        fontWeight: "900",
        color: "#111827",
        marginBottom: 12,
    },

    subtitle: {
        fontSize: 16,
        lineHeight: 24,
        color: "#4b5563",
        marginBottom: 20,
    },

    featureBox: {
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },

    featureText: {
        fontSize: 14,
        color: "#374151",
        fontWeight: "700",
        marginBottom: 7,
    },

    actions: {
        gap: 10,
        marginTop: 4,
    },

    footer: {
        marginTop: 22,
        textAlign: "center",
        color: "#6b7280",
        fontWeight: "800",
    },
});
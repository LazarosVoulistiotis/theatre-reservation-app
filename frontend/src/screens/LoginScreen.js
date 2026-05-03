import { useEffect, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import FeedbackMessage from "../components/FeedbackMessage";
import { useAuth } from "../context/AuthContext";

/*
  LoginScreen handles user authentication.

  The screen validates the user's email/password input, calls the
  AuthContext login action, and displays clear success/error feedback.
  After a successful login, RootNavigator automatically switches to
  the protected application flow because the authentication state changes.
*/
export default function LoginScreen({ route }) {
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    /*
      If RegisterScreen redirects here after account creation, it passes
      the registered email so the login form is partially pre-filled.
    */
    useEffect(() => {
        if (route.params?.email) {
            setEmail(route.params.email);
        }
    }, [route.params?.email]);

    /*
      Performs lightweight frontend validation before sending the request.
      Backend validation still remains the source of truth for security.
    */
    async function handleLogin() {
        setFeedback(null);

        if (!email.trim() || !password.trim()) {
            setFeedback({
                type: "error",
                message: "Email and password are required.",
            });
            return;
        }

        setLoading(true);

        const result = await login({
            email: email.trim(),
            password,
        });

        setLoading(false);

        if (!result.success) {
            setFeedback({
                type: "error",
                message: result.message,
            });
            return;
        }

        setFeedback({
            type: "success",
            message: "Login successful.",
        });
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.card}>
                    <Text style={styles.badge}>Secure Access</Text>

                    <Text style={styles.title}>Welcome back</Text>

                    <Text style={styles.subtitle}>
                        Login securely to continue browsing theatre shows, selecting
                        seats and managing your reservations.
                    </Text>

                    <FeedbackMessage
                        message={feedback?.message}
                        type={feedback?.type}
                    />

                    <AppInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter your email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <AppInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        secureTextEntry
                    />

                    <AppButton
                        title={loading ? "Logging in..." : "Login"}
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                    />

                    <View style={styles.securityBox}>
                        <Text style={styles.securityText}>
                            JWT authentication protects reservation-related requests
                            after login.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f4f6",
    },

    content: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
    },

    card: {
        width: "100%",
        maxWidth: 640,
        alignSelf: "center",
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 26,
        ...Platform.select({
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
        }),
    },

    badge: {
        alignSelf: "flex-start",
        backgroundColor: "#dcfce7",
        color: "#166534",
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: "800",
        marginBottom: 16,
    },

    title: {
        fontSize: 30,
        fontWeight: "900",
        color: "#111827",
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 16,
        color: "#4b5563",
        marginBottom: 18,
        lineHeight: 24,
    },

    securityBox: {
        backgroundColor: "#f9fafb",
        borderRadius: 14,
        padding: 14,
        marginTop: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },

    securityText: {
        color: "#6b7280",
        fontSize: 13,
        lineHeight: 19,
        textAlign: "center",
        fontWeight: "700",
    },
});
import { useState } from "react";
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
  RegisterScreen handles new user account creation.

  It validates required fields, sends the registration request through
  AuthContext, and provides clear feedback for success or failure.
*/
export default function RegisterScreen({ navigation }) {
    const { register } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState(null);

    /*
      Handles account creation.

      The frontend prevents empty submissions for better UX, while the
      backend remains responsible for password hashing, duplicate email
      checks and database persistence.
    */
    async function handleRegister() {
        setFeedback(null);

        if (!name.trim() || !email.trim() || !password.trim()) {
            setFeedback({
                type: "error",
                message: "Name, email and password are required.",
            });
            return;
        }

        setLoading(true);

        const result = await register({
            name: name.trim(),
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
            message: "Account created successfully. You can now log in.",
        });

        /*
          Redirects the user to LoginScreen with the registered email
          already filled in for a smoother authentication flow.
        */
        setTimeout(() => {
            navigation.navigate("Login", { email: email.trim() });
        }, 800);
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
                    <Text style={styles.badge}>New Account</Text>

                    <Text style={styles.title}>Create your account</Text>

                    <Text style={styles.subtitle}>
                        Register to book specific theatre seats and manage your
                        reservation history through the mobile application.
                    </Text>

                    <FeedbackMessage
                        message={feedback?.message}
                        type={feedback?.type}
                    />

                    <AppInput
                        label="Full name"
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        autoCapitalize="words"
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
                        title={loading ? "Creating Account..." : "Register"}
                        onPress={handleRegister}
                        loading={loading}
                        disabled={loading}
                    />

                    <View style={styles.securityBox}>
                        <Text style={styles.securityText}>
                            Passwords are hashed by the backend before being stored
                            in MariaDB.
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
        backgroundColor: "#e0f2fe",
        color: "#075985",
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
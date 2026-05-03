import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";

import LoadingView from "../components/LoadingView";
import { useAuth } from "../context/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import MyReservationsScreen from "../screens/MyReservationsScreen";
import RegisterScreen from "../screens/RegisterScreen";
import SeatSelectionScreen from "../screens/SeatSelectionScreen";
import ShowDetailsScreen from "../screens/ShowDetailsScreen";
import ShowsScreen from "../screens/ShowsScreen";
import WelcomeScreen from "../screens/WelcomeScreen";

const Stack = createNativeStackNavigator();

/*
  RootNavigator controls the main navigation flow of the app.

  It separates the application into:
  1. Unauthenticated flow: Welcome, Register and Login.
  2. Authenticated flow: protected theatre reservation screens.

  This structure prevents unauthenticated users from accessing show details,
  seat selection, reservation creation and reservation history.
*/
export default function RootNavigator() {
    const { authLoading, isAuthenticated } = useAuth();

    /*
      While the app restores the saved JWT session, show a loading state
      instead of briefly rendering the wrong navigation stack.
    */
    if (authLoading) {
        return (
            <View style={styles.loadingContainer}>
                <LoadingView message="Restoring secure session..." />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "#ffffff",
                    },
                    headerTitleStyle: {
                        fontWeight: "800",
                        color: "#111827",
                    },
                    headerTintColor: "#111827",
                    contentStyle: {
                        backgroundColor: "#f3f4f6",
                    },
                }}
            >
                {isAuthenticated ? (
                    /*
                      Authenticated stack.

                      These screens are available only after successful login,
                      when the JWT token exists in the authentication state.
                    */
                    <>
                        <Stack.Screen
                            name="Shows"
                            component={ShowsScreen}
                            options={{
                                title: "Theatre Shows",
                            }}
                        />

                        <Stack.Screen
                            name="ShowDetails"
                            component={ShowDetailsScreen}
                            options={{
                                title: "Show Details",
                            }}
                        />

                        <Stack.Screen
                            name="SeatSelection"
                            component={SeatSelectionScreen}
                            options={{
                                title: "Seat Selection",
                            }}
                        />

                        <Stack.Screen
                            name="MyReservations"
                            component={MyReservationsScreen}
                            options={{
                                title: "My Reservations",
                            }}
                        />
                    </>
                ) : (
                    /*
                      Unauthenticated stack.

                      These screens allow the user to create an account or
                      authenticate with the backend.
                    */
                    <>
                        <Stack.Screen
                            name="Welcome"
                            component={WelcomeScreen}
                            options={{
                                headerShown: false,
                            }}
                        />

                        <Stack.Screen
                            name="Register"
                            component={RegisterScreen}
                            options={{
                                title: "Create Account",
                            }}
                        />

                        <Stack.Screen
                            name="Login"
                            component={LoginScreen}
                            options={{
                                title: "Login",
                            }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
    },
});
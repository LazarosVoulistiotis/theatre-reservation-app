import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation/RootNavigator";

/*
  Main application entry point.

  The AuthProvider exposes authentication state and actions
  to the entire application, while RootNavigator controls the
  screen flow based on whether the user is authenticated.
*/
export default function App() {
    return (
        <AuthProvider>
            <StatusBar style="dark" />
            <RootNavigator />
        </AuthProvider>
    );
}
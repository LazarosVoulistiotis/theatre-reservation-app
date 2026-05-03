import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import api, {
    clearAuthSession,
    getApiError,
    getStoredToken,
    getStoredUser,
    saveAuthSession,
} from "../services/api";

const AuthContext = createContext(null);

/*
  AuthProvider centralises authentication state for the app.

  It keeps the JWT token and logged-in user in memory, restores
  them from secure storage when the app starts, and exposes
  register, login and logout actions to all screens.
*/
export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    /*
      Restores a previously saved session.

      This supports automatic login after the app is reopened,
      which improves user experience and demonstrates secure
      session persistence.
    */
    const restoreSession = useCallback(async () => {
        try {
            const storedToken = await getStoredToken();
            const storedUser = await getStoredUser();

            if (storedToken) {
                setToken(storedToken);
                setUser(storedUser);
            }
        } catch {
            /*
              If session restoration fails, the app safely falls back
              to the unauthenticated flow instead of crashing.
            */
            await clearAuthSession();
            setToken(null);
            setUser(null);
        } finally {
            setAuthLoading(false);
        }
    }, []);

    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    /*
      Sends registration data to the backend.

      The function returns a consistent result object so that
      the RegisterScreen can easily show success or error feedback.
    */
    const register = useCallback(async ({ name, email, password }) => {
        try {
            const response = await api.post("/register", {
                name,
                email,
                password,
            });

            return {
                success: true,
                message: response.data.message || "Registration successful.",
                user: response.data.user,
            };
        } catch (error) {
            return {
                success: false,
                message: getApiError(error),
            };
        }
    }, []);

    /*
      Authenticates the user through the backend.

      On successful login, the JWT token and user details are saved
      to storage and also kept in React state for immediate navigation.
    */
    const login = useCallback(async ({ email, password }) => {
        try {
            const response = await api.post("/login", {
                email,
                password,
            });

            const nextToken = response.data.token;
            const nextUser = response.data.user;

            if (!nextToken) {
                return {
                    success: false,
                    message: "Login failed: authentication token was not returned.",
                };
            }

            await saveAuthSession(nextToken, nextUser);

            setToken(nextToken);
            setUser(nextUser);

            return {
                success: true,
                message: response.data.message || "Login successful.",
            };
        } catch (error) {
            return {
                success: false,
                message: getApiError(error),
            };
        }
    }, []);

    /*
      Clears the local session and returns the user to the
      unauthenticated navigation flow.
    */
    const logout = useCallback(async () => {
        await clearAuthSession();
        setToken(null);
        setUser(null);
    }, []);

    /*
      Memoised context value prevents unnecessary re-renders
      and keeps authentication access consistent across screens.
    */
    const value = useMemo(
        () => ({
            token,
            user,
            authLoading,
            isAuthenticated: Boolean(token),
            register,
            login,
            logout,
        }),
        [token, user, authLoading, register, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/*
  Custom hook for accessing authentication state.

  The guard helps detect incorrect usage early, for example
  if a screen tries to use authentication outside AuthProvider.
*/
export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside an AuthProvider.");
    }

    return context;
}
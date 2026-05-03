import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "theatre_reservation_token";
const USER_KEY = "theatre_reservation_user";

/*
  Backend URL configuration.

  Web runs in the browser on the same machine as the backend,
  so it can use localhost.

  Expo Go on a physical device must use the computer's local IP,
  because localhost would refer to the phone itself.

  Android Emulator alternative:
  http://10.0.2.2:5000
*/
const API_BASE_URL =
    Platform.OS === "web"
        ? "http://localhost:5000"
        : "http://192.168.1.3:5000";

/*
  Axios instance used by the whole frontend.

  Keeping API configuration in one file avoids duplicated URLs,
  duplicated headers and inconsistent error handling across screens.
*/
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

/*
  Reads a value from the correct storage mechanism.

  SecureStore is used on mobile devices for safer token persistence.
  localStorage is used only for web testing because SecureStore is
  primarily designed for native environments.
*/
async function getStoredItem(key) {
    if (Platform.OS === "web") {
        return window.localStorage.getItem(key);
    }

    return SecureStore.getItemAsync(key);
}

/*
  Saves a value using the correct platform storage.
*/
async function setStoredItem(key, value) {
    if (Platform.OS === "web") {
        window.localStorage.setItem(key, value);
        return;
    }

    await SecureStore.setItemAsync(key, value);
}

/*
  Deletes a value from the correct platform storage.
*/
async function deleteStoredItem(key) {
    if (Platform.OS === "web") {
        window.localStorage.removeItem(key);
        return;
    }

    await SecureStore.deleteItemAsync(key);
}

/*
  Request interceptor.

  Before each backend request, the saved JWT token is retrieved
  and automatically attached as an Authorization header.

  This keeps protected requests clean in the screens, because
  screens do not need to manually handle JWT headers.
*/
api.interceptors.request.use(async (config) => {
    const token = await getStoredItem(TOKEN_KEY);

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

/*
  Saves the authenticated session after successful login.
*/
export async function saveAuthSession(token, user) {
    await setStoredItem(TOKEN_KEY, token);
    await setStoredItem(USER_KEY, JSON.stringify(user || null));
}

/*
  Returns the stored JWT token, if one exists.
*/
export async function getStoredToken() {
    return getStoredItem(TOKEN_KEY);
}

/*
  Returns the stored user object.

  If parsing fails, null is returned to keep the app stable.
*/
export async function getStoredUser() {
    try {
        const userJson = await getStoredItem(USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    } catch {
        return null;
    }
}

/*
  Clears authentication data during logout or failed session restore.
*/
export async function clearAuthSession() {
    await deleteStoredItem(TOKEN_KEY);
    await deleteStoredItem(USER_KEY);
}

/*
  Extracts a clean user-facing error message from Axios errors.

  This supports the frontend feedback requirement by allowing
  screens to show meaningful error messages instead of raw errors.
*/
export function getApiError(error) {
    return (
        error.response?.data?.message ||
        error.message ||
        "Something went wrong. Please try again."
    );
}

export default api;
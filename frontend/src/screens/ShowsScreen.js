import { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    Platform,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import FeedbackMessage from "../components/FeedbackMessage";
import LoadingView from "../components/LoadingView";
import { useAuth } from "../context/AuthContext";
import api, { getApiError } from "../services/api";

/*
  ShowsScreen is the first protected screen after login.

  It loads theatre shows from the backend and supports search by:
  - show title,
  - location,
  - theatre name,
  - show date.

  This directly supports the assignment requirement for displaying available
  theatres/performances and searching by title, theatre or location.
*/
export default function ShowsScreen({ navigation }) {
    const { user, logout } = useAuth();

    const [shows, setShows] = useState([]);
    const [title, setTitle] = useState("");
    const [location, setLocation] = useState("");
    const [theatreName, setTheatreName] = useState("");
    const [date, setDate] = useState("");

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [feedback, setFeedback] = useState(null);

    /*
      Fetches shows from the backend.

      Only non-empty filters are sent as query parameters.
    */
    const fetchShows = useCallback(async () => {
        try {
            setFeedback(null);

            const params = {};

            if (title.trim()) {
                params.title = title.trim();
            }

            if (location.trim()) {
                params.location = location.trim();
            }

            if (theatreName.trim()) {
                params.theatreName = theatreName.trim();
            }

            if (date.trim()) {
                params.date = date.trim();
            }

            const response = await api.get("/shows", { params });

            const nextShows =
                response.data.shows ||
                response.data.data ||
                response.data ||
                [];

            setShows(Array.isArray(nextShows) ? nextShows : []);
        } catch (error) {
            setFeedback({
                type: "error",
                message: getApiError(error),
            });

            setShows([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [title, location, theatreName, date]);

    useEffect(() => {
        fetchShows();
    }, [fetchShows]);

    async function handleRefresh() {
        setRefreshing(true);
        await fetchShows();
    }

    function handleClearSearch() {
        setTitle("");
        setLocation("");
        setTheatreName("");
        setDate("");
    }

    function renderShow({ item }) {
        const showTitle = item.title || "Untitled show";

        const theatre =
            item.theatre_name ||
            item.theatreName ||
            item.name ||
            "Unknown theatre";

        const showLocation =
            item.location ||
            item.theatre_location ||
            item.theatreLocation ||
            item.city ||
            "Unknown location";

        const duration =
            item.duration_minutes ||
            item.durationMinutes ||
            item.duration ||
            "N/A";

        const ageRating =
            item.age_rating ||
            item.ageRating ||
            "N/A";

        return (
            <View style={styles.showCard}>
                <Text style={styles.showTitle}>{showTitle}</Text>

                <Text style={styles.showMeta}>
                    {theatre} · {showLocation}
                </Text>

                <View style={styles.detailsRow}>
                    <Text style={styles.detailPill}>{duration} min</Text>
                    <Text style={styles.detailPill}>Age {ageRating}</Text>
                </View>

                <Text style={styles.description} numberOfLines={3}>
                    {item.description || "No description available."}
                </Text>

                <AppButton
                    title="View Details"
                    onPress={() =>
                        navigation.navigate("ShowDetails", {
                            show: item,
                            showId: item.show_id || item.showId || item.id,
                        })
                    }
                />
            </View>
        );
    }

    if (loading) {
        return <LoadingView message="Loading theatre shows..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={shows}
                keyExtractor={(item, index) =>
                    String(item.show_id || item.showId || item.id || index)
                }
                renderItem={renderShow}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <View style={styles.topRow}>
                            <View style={styles.userBox}>
                                <Text style={styles.welcome}>Welcome,</Text>
                                <Text style={styles.userName}>{user?.name || "User"}</Text>
                            </View>

                            <View style={styles.headerActions}>
                                <AppButton
                                    title="My Reservations"
                                    variant="secondary"
                                    onPress={() => navigation.navigate("MyReservations")}
                                />

                                <AppButton
                                    title="Logout"
                                    variant="danger"
                                    onPress={logout}
                                />
                            </View>
                        </View>

                        <Text style={styles.title}>Theatre Shows</Text>

                        <Text style={styles.subtitle}>
                            Search available performances by title, theatre, location or
                            date and continue to showtimes and seat selection.
                        </Text>

                        <View style={styles.searchBox}>
                            <AppInput
                                label="Show title"
                                value={title}
                                onChangeText={setTitle}
                                placeholder="e.g. Hamlet"
                            />

                            <AppInput
                                label="Location"
                                value={location}
                                onChangeText={setLocation}
                                placeholder="e.g. Athens"
                            />

                            <AppInput
                                label="Theatre name"
                                value={theatreName}
                                onChangeText={setTheatreName}
                                placeholder="e.g. National Theatre"
                            />

                            <AppInput
                                label="Show date"
                                value={date}
                                onChangeText={setDate}
                                placeholder="YYYY-MM-DD, e.g. 2026-05-15"
                            />

                            <AppButton title="Search Shows" onPress={fetchShows} />

                            <AppButton
                                title="Clear Search"
                                variant="secondary"
                                onPress={handleClearSearch}
                            />
                        </View>

                        <FeedbackMessage
                            message={feedback?.message}
                            type={feedback?.type}
                        />

                        <Text style={styles.resultsCount}>
                            {shows.length} result{shows.length === 1 ? "" : "s"} found
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>No shows found</Text>
                        <Text style={styles.emptyText}>
                            Try changing the search filters or clearing the search fields.
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const cardShadow = Platform.select({
    web: {
        boxShadow: "0px 14px 32px rgba(15, 23, 42, 0.10)",
    },
    default: {
        shadowColor: "#000000",
        shadowOpacity: 0.1,
        shadowRadius: 14,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        elevation: 4,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f3f4f6",
    },

    listContent: {
        width: "100%",
        maxWidth: 860,
        alignSelf: "center",
        padding: 20,
        paddingBottom: 44,
    },

    header: {
        marginBottom: 14,
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 18,
    },

    userBox: {
        flex: 1,
    },

    headerActions: {
        gap: 8,
        minWidth: 170,
    },

    welcome: {
        color: "#6b7280",
        fontWeight: "800",
    },

    userName: {
        color: "#111827",
        fontSize: 19,
        fontWeight: "900",
    },

    title: {
        fontSize: 30,
        fontWeight: "900",
        color: "#111827",
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 16,
        lineHeight: 24,
        color: "#4b5563",
        marginBottom: 16,
    },

    searchBox: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 18,
        marginBottom: 16,
        ...cardShadow,
    },

    resultsCount: {
        color: "#374151",
        fontWeight: "900",
        marginBottom: 12,
    },

    showCard: {
        backgroundColor: "#ffffff",
        borderRadius: 22,
        padding: 20,
        marginBottom: 16,
        ...cardShadow,
    },

    showTitle: {
        fontSize: 21,
        fontWeight: "900",
        color: "#111827",
        marginBottom: 6,
    },

    showMeta: {
        color: "#4b5563",
        fontWeight: "800",
        marginBottom: 10,
    },

    detailsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 11,
    },

    detailPill: {
        backgroundColor: "#e0f2fe",
        color: "#075985",
        paddingVertical: 6,
        paddingHorizontal: 11,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: "900",
    },

    description: {
        color: "#4b5563",
        lineHeight: 22,
        marginBottom: 13,
    },

    emptyState: {
        backgroundColor: "#ffffff",
        borderRadius: 22,
        padding: 24,
        alignItems: "center",
        marginTop: 12,
        ...cardShadow,
    },

    emptyTitle: {
        fontSize: 19,
        fontWeight: "900",
        color: "#111827",
        marginBottom: 6,
    },

    emptyText: {
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 21,
    },
});
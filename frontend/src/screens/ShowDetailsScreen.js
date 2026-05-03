import { useCallback, useEffect, useState } from "react";
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import AppButton from "../components/AppButton";
import FeedbackMessage from "../components/FeedbackMessage";
import LoadingView from "../components/LoadingView";
import api, { getApiError } from "../services/api";
import {
    formatShowAgeRating,
    formatShowDuration,
    getShowDescription,
    getShowLocation,
    getShowTheatre,
    getShowTitle,
} from "../utils/showFormatters";

/*
  ShowDetailsScreen presents one selected theatre show.

  It displays:
  - main show information,
  - available showtimes preview,
  - hall and price information where available,
  - navigation to the complete seat selection and reservation flow.

  This directly supports the assignment requirement for:
  "Show details and availability: display available dates/times, hall,
  duration, price/category before reservation."
*/
export default function ShowDetailsScreen({ route, navigation }) {
    const show = route.params?.show || {};

    const showId =
        route.params?.showId ||
        show.show_id ||
        show.showId ||
        show.id;

    const [showtimes, setShowtimes] = useState([]);
    const [loadingShowtimes, setLoadingShowtimes] = useState(true);
    const [feedback, setFeedback] = useState(null);

    /*
      Loads available showtimes for the selected show.

      SeatSelectionScreen also loads showtimes, but this preview improves the
      details screen and makes availability visible earlier in the flow.
    */
    const fetchShowtimes = useCallback(async () => {
        if (!showId) {
            setFeedback({
                type: "error",
                message: "Show ID is missing. Please go back and select the show again.",
            });
            setLoadingShowtimes(false);
            return;
        }

        try {
            setFeedback(null);
            setLoadingShowtimes(true);

            const response = await api.get("/showtimes", {
                params: {
                    showId,
                },
            });

            const nextShowtimes =
                response.data.showtimes ||
                response.data.data ||
                response.data ||
                [];

            setShowtimes(Array.isArray(nextShowtimes) ? nextShowtimes : []);
        } catch (error) {
            setFeedback({
                type: "error",
                message: getApiError(error),
            });

            setShowtimes([]);
        } finally {
            setLoadingShowtimes(false);
        }
    }, [showId]);

    useEffect(() => {
        fetchShowtimes();
    }, [fetchShowtimes]);

    function handleContinue() {
        navigation.navigate("SeatSelection", {
            show,
            showId,
        });
    }

    function formatShowtimeDateTime(showtime) {
        const rawDate =
            showtime?.show_date ||
            showtime?.showDate ||
            showtime?.performance_date ||
            showtime?.performanceDate ||
            showtime?.date;

        const rawTime =
            showtime?.show_time ||
            showtime?.showTime ||
            showtime?.start_time ||
            showtime?.startTime ||
            showtime?.time;

        if (!rawDate && !rawTime) {
            return "Date/time TBC";
        }

        const date = rawDate ? new Date(rawDate) : null;

        const formattedDate =
            date && !Number.isNaN(date.getTime())
                ? date.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })
                : rawDate;

        const formattedTime = rawTime ? String(rawTime).slice(0, 5) : "Time TBC";

        return `${formattedDate} · ${formattedTime}`;
    }

    function formatHall(showtime) {
        return (
            showtime?.hall_name ||
            showtime?.hallName ||
            showtime?.hall ||
            "Hall information unavailable"
        );
    }

    function formatBasePrice(showtime) {
        const price = Number(
            showtime?.base_price ||
            showtime?.basePrice ||
            showtime?.price ||
            0
        );

        if (Number.isNaN(price) || price <= 0) {
            return "Price TBC";
        }

        return `From €${price.toFixed(2)}`;
    }

    function renderShowtimePreview(showtime, index) {
        const showtimeId =
            showtime?.showtime_id ||
            showtime?.showtimeId ||
            showtime?.id ||
            index;

        return (
            <View key={String(showtimeId)} style={styles.showtimeCard}>
                <Text style={styles.showtimeDate}>
                    {formatShowtimeDateTime(showtime)}
                </Text>

                <View style={styles.showtimeMetaRow}>
                    <Text style={styles.showtimePill}>
                        {formatHall(showtime)}
                    </Text>

                    <Text style={styles.showtimePill}>
                        {formatBasePrice(showtime)}
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.badge}>Show Details</Text>

                    <Text style={styles.title}>{getShowTitle(show)}</Text>

                    <Text style={styles.meta}>
                        {getShowTheatre(show)} · {getShowLocation(show)}
                    </Text>

                    <View style={styles.detailsRow}>
                        <Text style={styles.detailPill}>{formatShowDuration(show)}</Text>
                        <Text style={styles.detailPill}>{formatShowAgeRating(show)}</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Description</Text>

                    <Text style={styles.description}>
                        {getShowDescription(show)}
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Available showtimes</Text>

                    <Text style={styles.description}>
                        Preview available dates, times, halls and starting prices
                        before continuing to seat selection.
                    </Text>

                    {loadingShowtimes ? (
                        <LoadingView message="Loading available showtimes..." />
                    ) : showtimes.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyTitle}>
                                No showtimes available
                            </Text>

                            <Text style={styles.emptyText}>
                                There are currently no scheduled dates for this show.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.showtimeList}>
                            {showtimes.map(renderShowtimePreview)}
                        </View>
                    )}

                    <FeedbackMessage
                        message={feedback?.message}
                        type={feedback?.type}
                    />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Next booking step</Text>

                    <Text style={styles.description}>
                        Continue to select an available showtime, choose specific seats,
                        and create your theatre reservation.
                    </Text>

                    <View style={styles.infoBox}>
                        <Text style={styles.infoText}>
                            This step demonstrates the complete mobile reservation flow:
                            details, showtime selection, seat availability and booking.
                        </Text>
                    </View>

                    <AppButton
                        title="Continue to Seat Selection"
                        onPress={handleContinue}
                    />

                    <AppButton
                        title="Back to Shows"
                        variant="secondary"
                        onPress={() => navigation.goBack()}
                    />
                </View>
            </ScrollView>
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

    content: {
        width: "100%",
        maxWidth: 860,
        alignSelf: "center",
        padding: 20,
        paddingBottom: 44,
    },

    card: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 22,
        marginBottom: 16,
        ...cardShadow,
    },

    badge: {
        alignSelf: "flex-start",
        backgroundColor: "#e0f2fe",
        color: "#075985",
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 999,
        fontSize: 13,
        fontWeight: "800",
        marginBottom: 16,
    },

    title: {
        fontSize: 30,
        fontWeight: "900",
        color: "#111827",
        marginBottom: 8,
    },

    meta: {
        color: "#4b5563",
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 14,
    },

    detailsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 18,
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

    sectionTitle: {
        color: "#111827",
        fontSize: 20,
        fontWeight: "900",
        marginBottom: 9,
    },

    description: {
        color: "#4b5563",
        fontSize: 15,
        lineHeight: 23,
        marginBottom: 13,
    },

    showtimeList: {
        gap: 10,
    },

    showtimeCard: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 16,
        padding: 15,
        backgroundColor: "#f9fafb",
    },

    showtimeDate: {
        color: "#111827",
        fontSize: 15,
        fontWeight: "900",
        marginBottom: 10,
    },

    showtimeMetaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },

    showtimePill: {
        backgroundColor: "#e0f2fe",
        color: "#075985",
        paddingVertical: 6,
        paddingHorizontal: 11,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: "900",
    },

    emptyBox: {
        backgroundColor: "#f9fafb",
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },

    emptyTitle: {
        color: "#111827",
        fontSize: 16,
        fontWeight: "900",
        marginBottom: 6,
    },

    emptyText: {
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 21,
    },

    infoBox: {
        backgroundColor: "#dbeafe",
        borderRadius: 14,
        padding: 15,
        marginBottom: 14,
    },

    infoText: {
        color: "#1d4ed8",
        fontSize: 14,
        lineHeight: 21,
        fontWeight: "800",
    },
});
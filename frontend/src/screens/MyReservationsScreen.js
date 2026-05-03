import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Platform,
    RefreshControl,
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

/*
  MyReservationsScreen displays the authenticated user's reservation history.

  It supports:
  - JWT-protected loading from the backend,
  - separation of upcoming and past/cancelled reservations,
  - cancellation of future confirmed reservations,
  - navigation to SeatSelectionScreen in edit mode.

  This directly supports the assignment requirement:
  "User Profile: view reservation history and delete/modify future reservations."
*/
export default function MyReservationsScreen({ navigation }) {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);
    const [feedback, setFeedback] = useState(null);

    /*
      Loads reservation history for the authenticated user.
      The JWT token is attached automatically by the axios interceptor.
    */
    const fetchReservations = useCallback(async () => {
        try {
            setFeedback(null);

            const response = await api.get("/user/reservations");

            const nextReservations =
                response.data.reservations ||
                response.data.data ||
                response.data ||
                [];

            setReservations(Array.isArray(nextReservations) ? nextReservations : []);
        } catch (error) {
            setFeedback({
                type: "error",
                message: getApiError(error),
            });

            setReservations([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchReservations();
    }, [fetchReservations]);

    async function handleRefresh() {
        setRefreshing(true);
        await fetchReservations();
    }

    function getReservationId(reservation) {
        return (
            reservation?.reservation_id ||
            reservation?.reservationId ||
            reservation?.id
        );
    }

    function getStatus(reservation) {
        return String(reservation?.status || "unknown").toLowerCase();
    }

    function normalizeBoolean(value) {
        if (value === true || value === 1 || value === "1") {
            return true;
        }

        if (value === false || value === 0 || value === "0") {
            return false;
        }

        return Boolean(value);
    }

    function isFutureReservation(reservation) {
        if (reservation?.is_future !== undefined) {
            return normalizeBoolean(reservation.is_future);
        }

        if (reservation?.isFuture !== undefined) {
            return normalizeBoolean(reservation.isFuture);
        }

        const rawDateTime =
            reservation?.show_datetime ||
            reservation?.showDateTime ||
            reservation?.show_date ||
            reservation?.showDate;

        if (!rawDateTime) {
            return false;
        }

        return new Date(rawDateTime) > new Date();
    }

    function canManageReservation(reservation) {
        return (
            isFutureReservation(reservation) &&
            getStatus(reservation) === "confirmed"
        );
    }

    function getReservationTypeLabel(reservation) {
        const status = getStatus(reservation);

        if (status === "cancelled") {
            return "Cancelled reservation";
        }

        if (isFutureReservation(reservation)) {
            return "Upcoming reservation";
        }

        return "Past reservation";
    }

    function formatDateTime(reservation) {
        const rawDate =
            reservation?.show_date ||
            reservation?.showDate ||
            reservation?.show_datetime ||
            reservation?.showDateTime;

        const rawTime =
            reservation?.show_time ||
            reservation?.showTime ||
            "";

        if (!rawDate) {
            return "Date/time unavailable";
        }

        const date = new Date(rawDate);

        if (Number.isNaN(date.getTime())) {
            return `${rawDate}${rawTime ? ` · ${rawTime}` : ""}`;
        }

        const formattedDate = date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

        const formattedTime = rawTime ? String(rawTime).slice(0, 5) : "";

        return formattedTime
            ? `${formattedDate} · ${formattedTime}`
            : formattedDate;
    }

    function formatSeats(reservation) {
        const seats = reservation?.seats || [];

        if (!Array.isArray(seats) || seats.length === 0) {
            return "Seats unavailable";
        }

        return seats
            .map((seat) => {
                const row =
                    seat?.row_label ||
                    seat?.rowLabel ||
                    seat?.seat_row ||
                    seat?.seatRow ||
                    "";

                const number =
                    seat?.seat_number ||
                    seat?.seatNumber ||
                    seat?.number ||
                    "";

                if (row || number) {
                    return `${row}${number}`;
                }

                return `Seat ${seat?.seat_id || seat?.seatId || ""}`.trim();
            })
            .join(", ");
    }

    function formatPrice(reservation) {
        const price = Number(
            reservation?.total_price ||
            reservation?.totalPrice ||
            0
        );

        return `€${price.toFixed(2)}`;
    }

    /*
      Opens SeatSelectionScreen in edit mode.

      The reservation is passed forward so the edit screen can preselect
      the current showtime/seats and submit a PUT request.
    */
    function handleEditPress(reservation) {
        if (!canManageReservation(reservation)) {
            setFeedback({
                type: "error",
                message: "Only future confirmed reservations can be edited.",
            });
            return;
        }

        navigation.navigate("SeatSelection", {
            mode: "edit",
            reservation,
            reservationId: getReservationId(reservation),
            showId: reservation?.show_id || reservation?.showId,
            show: {
                show_id: reservation?.show_id || reservation?.showId,
                title: reservation?.title,
                description: reservation?.description,
                duration_minutes: reservation?.duration_minutes,
                age_rating: reservation?.age_rating,
                theatre_name: reservation?.theatre_name,
                location: reservation?.location,
            },
            currentShowtimeId:
                reservation?.showtime_id ||
                reservation?.showtimeId,
            currentSeatIds: Array.isArray(reservation?.seats)
                ? reservation.seats.map((seat) =>
                    seat?.seat_id || seat?.seatId || seat?.id
                )
                : [],
        });
    }

    /*
      Cancels a future confirmed reservation.

      The backend marks the reservation as cancelled instead of physically
      deleting it, preserving a useful booking history for the user.
    */
    async function cancelReservation(reservation) {
        const reservationId = getReservationId(reservation);

        if (!reservationId) {
            setFeedback({
                type: "error",
                message: "Reservation ID is missing.",
            });
            return;
        }

        try {
            setCancellingId(reservationId);
            setFeedback(null);

            await api.delete(`/reservations/${reservationId}`);

            setFeedback({
                type: "success",
                message: "Reservation cancelled successfully.",
            });

            await fetchReservations();
        } catch (error) {
            setFeedback({
                type: "error",
                message: getApiError(error),
            });
        } finally {
            setCancellingId(null);
        }
    }

    function handleCancelPress(reservation) {
        if (!canManageReservation(reservation)) {
            setFeedback({
                type: "error",
                message: "Only future confirmed reservations can be cancelled.",
            });
            return;
        }

        const reservationTitle = reservation?.title || "this reservation";

        if (Platform.OS === "web" && typeof window !== "undefined") {
            const confirmed = window.confirm(
                `Cancel ${reservationTitle}? This action will release the selected seats.`
            );

            if (confirmed) {
                cancelReservation(reservation);
            }

            return;
        }

        Alert.alert(
            "Cancel reservation",
            `Cancel ${reservationTitle}? This action will release the selected seats.`,
            [
                {
                    text: "Keep reservation",
                    style: "cancel",
                },
                {
                    text: "Cancel reservation",
                    style: "destructive",
                    onPress: () => cancelReservation(reservation),
                },
            ]
        );
    }

    function renderReservationCard(reservation) {
        const reservationId = getReservationId(reservation);
        const status = getStatus(reservation);
        const manageable = canManageReservation(reservation);
        const isCancelling = String(cancellingId) === String(reservationId);

        return (
            <View key={String(reservationId)} style={styles.reservationCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleBox}>
                        <Text style={styles.reservationTitle}>
                            {reservation?.title || "Untitled show"}
                        </Text>

                        <Text style={styles.reservationMeta}>
                            {reservation?.theatre_name ||
                                reservation?.theatreName ||
                                "Unknown theatre"}
                            {" · "}
                            {reservation?.location || "Unknown location"}
                        </Text>
                    </View>

                    <Text
                        style={[
                            styles.statusBadge,
                            status === "confirmed" && styles.confirmedBadge,
                            status === "cancelled" && styles.cancelledBadge,
                        ]}
                    >
                        {status.toUpperCase()}
                    </Text>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        Date/time:{" "}
                        <Text style={styles.infoStrong}>
                            {formatDateTime(reservation)}
                        </Text>
                    </Text>

                    <Text style={styles.infoText}>
                        Seats:{" "}
                        <Text style={styles.infoStrong}>
                            {formatSeats(reservation)}
                        </Text>
                    </Text>

                    <Text style={styles.infoText}>
                        Total price:{" "}
                        <Text style={styles.infoStrong}>
                            {formatPrice(reservation)}
                        </Text>
                    </Text>

                    <Text style={styles.infoText}>
                        Type:{" "}
                        <Text style={styles.infoStrong}>
                            {getReservationTypeLabel(reservation)}
                        </Text>
                    </Text>
                </View>

                {manageable ? (
                    <View style={styles.actions}>
                        <AppButton
                            title="Edit Reservation"
                            variant="secondary"
                            onPress={() => handleEditPress(reservation)}
                        />

                        <AppButton
                            title={
                                isCancelling
                                    ? "Cancelling..."
                                    : "Cancel Reservation"
                            }
                            variant="danger"
                            onPress={() => handleCancelPress(reservation)}
                            disabled={isCancelling}
                        />
                    </View>
                ) : (
                    <Text style={styles.disabledNote}>
                        Past or cancelled reservations cannot be modified.
                    </Text>
                )}
            </View>
        );
    }

    const upcomingReservations = reservations.filter(
        (reservation) =>
            isFutureReservation(reservation) &&
            getStatus(reservation) !== "cancelled"
    );

    const pastOrInactiveReservations = reservations.filter(
        (reservation) =>
            !isFutureReservation(reservation) ||
            getStatus(reservation) === "cancelled"
    );

    if (loading) {
        return <LoadingView message="Loading your reservations..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
            >
                <View style={styles.heroCard}>
                    <Text style={styles.badge}>User Profile</Text>

                    <Text style={styles.title}>My Reservations</Text>

                    <Text style={styles.subtitle}>
                        View your theatre booking history and manage future
                        reservations securely.
                    </Text>
                </View>

                <FeedbackMessage
                    message={feedback?.message}
                    type={feedback?.type}
                />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Upcoming reservations
                    </Text>

                    {upcomingReservations.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyTitle}>
                                No upcoming reservations
                            </Text>

                            <Text style={styles.emptyText}>
                                Create a new reservation from the theatre shows
                                screen.
                            </Text>

                            <AppButton
                                title="Browse Shows"
                                onPress={() => navigation.navigate("Shows")}
                            />
                        </View>
                    ) : (
                        upcomingReservations.map(renderReservationCard)
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Past / cancelled reservations
                    </Text>

                    {pastOrInactiveReservations.length === 0 ? (
                        <View style={styles.emptyBox}>
                            <Text style={styles.emptyTitle}>
                                No past reservations
                            </Text>

                            <Text style={styles.emptyText}>
                                Your completed or cancelled reservations will
                                appear here.
                            </Text>
                        </View>
                    ) : (
                        pastOrInactiveReservations.map(renderReservationCard)
                    )}
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

    heroCard: {
        backgroundColor: "#ffffff",
        borderRadius: 24,
        padding: 24,
        marginBottom: 18,
        ...cardShadow,
    },

    badge: {
        alignSelf: "flex-start",
        backgroundColor: "#e0f2fe",
        color: "#075985",
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 999,
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
        color: "#4b5563",
        fontSize: 16,
        lineHeight: 24,
    },

    section: {
        marginTop: 10,
    },

    sectionTitle: {
        fontSize: 23,
        fontWeight: "900",
        color: "#111827",
        marginBottom: 14,
    },

    reservationCard: {
        backgroundColor: "#ffffff",
        borderRadius: 22,
        padding: 20,
        marginBottom: 16,
        ...cardShadow,
    },

    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 14,
    },

    cardTitleBox: {
        flex: 1,
    },

    reservationTitle: {
        color: "#111827",
        fontSize: 21,
        fontWeight: "900",
        marginBottom: 4,
    },

    reservationMeta: {
        color: "#4b5563",
        fontWeight: "700",
        lineHeight: 20,
    },

    statusBadge: {
        paddingVertical: 7,
        paddingHorizontal: 12,
        borderRadius: 999,
        backgroundColor: "#e5e7eb",
        color: "#374151",
        fontSize: 11,
        fontWeight: "900",
    },

    confirmedBadge: {
        backgroundColor: "#dcfce7",
        color: "#166534",
    },

    cancelledBadge: {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
    },

    infoBox: {
        backgroundColor: "#f9fafb",
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#f3f4f6",
    },

    infoText: {
        color: "#4b5563",
        fontSize: 15,
        lineHeight: 25,
    },

    infoStrong: {
        color: "#111827",
        fontWeight: "900",
    },

    actions: {
        gap: 10,
    },

    disabledNote: {
        color: "#6b7280",
        fontWeight: "700",
        marginTop: 4,
    },

    emptyBox: {
        backgroundColor: "#ffffff",
        borderRadius: 22,
        padding: 22,
        marginBottom: 16,
        alignItems: "center",
        ...cardShadow,
    },

    emptyTitle: {
        color: "#111827",
        fontSize: 19,
        fontWeight: "900",
        marginBottom: 6,
        textAlign: "center",
    },

    emptyText: {
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 21,
        marginBottom: 14,
    },
});
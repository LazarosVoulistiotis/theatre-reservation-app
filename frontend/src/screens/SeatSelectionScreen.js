import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Platform,
    Pressable,
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
  SeatSelectionScreen supports both reservation creation and reservation editing.

  Create mode:
  Show Details -> Seat Selection -> POST /reservations

  Edit mode:
  My Reservations -> Edit Reservation -> PUT /reservations/:id

  This screen covers the assignment requirements for:
  - selecting a showtime,
  - displaying seat availability,
  - selecting specific seats,
  - creating reservations,
  - modifying future reservations,
  - refreshing availability after create/update errors.
*/
export default function SeatSelectionScreen({ route, navigation }) {
    const params = route.params || {};

    const mode = params.mode === "edit" ? "edit" : "create";
    const isEditMode = mode === "edit";

    const reservation = params.reservation || null;
    const reservationId = params.reservationId;
    const show = params.show || null;
    const showId = params.showId;
    const currentShowtimeId = params.currentShowtimeId;

    /*
      Converts current seat IDs into a stable key.

      This avoids creating a fresh array dependency on every render, which can
      otherwise cause repeated API calls and loading loops.
    */
    const currentSeatIdsKey = Array.isArray(params.currentSeatIds)
        ? params.currentSeatIds.map(String).join(",")
        : "";

    const initialCurrentSeatIds = useMemo(() => {
        if (!currentSeatIdsKey) {
            return [];
        }

        return currentSeatIdsKey
            .split(",")
            .map(Number)
            .filter((seatId) => Number.isInteger(seatId) && seatId > 0);
    }, [currentSeatIdsKey]);

    const [showtimes, setShowtimes] = useState([]);
    const [seats, setSeats] = useState([]);

    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [selectedSeatIds, setSelectedSeatIds] = useState([]);

    const [loadingShowtimes, setLoadingShowtimes] = useState(true);
    const [loadingSeats, setLoadingSeats] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [feedback, setFeedback] = useState(null);

    /*
      These states represent the seats/showtime currently owned by the
      reservation during edit mode. They are updated after a successful PUT,
      so the screen remains accurate after modifying a booking.
    */
    const [reservationShowtimeId, setReservationShowtimeId] =
        useState(currentShowtimeId);
    const [reservationSeatIds, setReservationSeatIds] =
        useState(initialCurrentSeatIds);

    useEffect(() => {
        setReservationShowtimeId(currentShowtimeId);
        setReservationSeatIds(initialCurrentSeatIds);
    }, [currentShowtimeId, currentSeatIdsKey, initialCurrentSeatIds]);

    const resolvedShowId =
        showId ||
        show?.show_id ||
        show?.showId ||
        show?.id ||
        reservation?.show_id ||
        reservation?.showId;

    const resolvedReservationId =
        reservationId ||
        reservation?.reservation_id ||
        reservation?.reservationId ||
        reservation?.id;

    const showTitle =
        show?.title ||
        reservation?.title ||
        "Selected show";

    function getShowtimeId(item) {
        return item?.showtime_id || item?.showtimeId || item?.id;
    }

    function getSeatId(item) {
        return item?.seat_id || item?.seatId || item?.id;
    }

    function normalizeId(value) {
        return Number(value);
    }

    function isSameId(firstValue, secondValue) {
        return String(firstValue) === String(secondValue);
    }

    function normalizeSeatIds(seatIds) {
        if (!Array.isArray(seatIds)) {
            return [];
        }

        return seatIds
            .map(Number)
            .filter((seatId) => Number.isInteger(seatId) && seatId > 0);
    }

    function isCurrentReservationSeat(seat) {
        const seatId = normalizeId(getSeatId(seat));

        return reservationSeatIds.includes(seatId);
    }

    function isSeatAvailable(seat) {
        /*
          In edit mode, seats already owned by the current reservation may
          appear as reserved from the backend. They remain selectable so the
          user can keep or remove them while editing.
        */
        if (isEditMode && isCurrentReservationSeat(seat)) {
            return true;
        }

        if (seat?.is_available !== undefined) {
            return (
                seat.is_available === true ||
                seat.is_available === 1 ||
                seat.is_available === "1"
            );
        }

        if (seat?.isAvailable !== undefined) {
            return (
                seat.isAvailable === true ||
                seat.isAvailable === 1 ||
                seat.isAvailable === "1"
            );
        }

        if (seat?.is_reserved !== undefined) {
            return !(
                seat.is_reserved === true ||
                seat.is_reserved === 1 ||
                seat.is_reserved === "1"
            );
        }

        if (seat?.isReserved !== undefined) {
            return !(
                seat.isReserved === true ||
                seat.isReserved === 1 ||
                seat.isReserved === "1"
            );
        }

        if (seat?.status) {
            return String(seat.status).toLowerCase() === "available";
        }

        return true;
    }

    function formatShowtime(item) {
        const rawDate =
            item?.show_date ||
            item?.showDate ||
            item?.performance_date ||
            item?.performanceDate ||
            item?.date;

        const rawTime =
            item?.show_time ||
            item?.showTime ||
            item?.start_time ||
            item?.startTime ||
            item?.time;

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

    function formatSeat(item) {
        const row =
            item?.row_label ||
            item?.rowLabel ||
            item?.seat_row ||
            item?.seatRow ||
            item?.row ||
            "";

        const number =
            item?.seat_number ||
            item?.seatNumber ||
            item?.number ||
            item?.seatNo ||
            "";

        if (row || number) {
            return `${row}${number}`;
        }

        return `Seat ${getSeatId(item)}`;
    }

    function getSeatPrice(item) {
        const price = Number(item?.price);

        if (Number.isNaN(price)) {
            return 0;
        }

        return price;
    }

    const selectedShowtimeId = useMemo(
        () => getShowtimeId(selectedShowtime),
        [selectedShowtime]
    );

    const selectedSeats = useMemo(() => {
        const normalizedSelectedSeatIds = selectedSeatIds.map(normalizeId);

        return seats.filter((seat) =>
            normalizedSelectedSeatIds.includes(normalizeId(getSeatId(seat)))
        );
    }, [seats, selectedSeatIds]);

    const totalPrice = useMemo(() => {
        return selectedSeats.reduce((sum, seat) => {
            return sum + getSeatPrice(seat);
        }, 0);
    }, [selectedSeats]);

    /*
      Loads seats for a selected showtime.

      In create mode, no seats are preselected.
      In edit mode, the reservation's current seats are preselected only if the
      selected showtime matches the reservation's current showtime.
    */
    const fetchSeats = useCallback(
        async (showtimeId, options = {}) => {
            const {
                clearFeedback = true,
                ownedShowtimeId = reservationShowtimeId,
                ownedSeatIds = reservationSeatIds,
                preselectSeatIds,
            } = options;

            if (!showtimeId) {
                setSeats([]);
                setSelectedSeatIds([]);
                return;
            }

            try {
                if (clearFeedback) {
                    setFeedback(null);
                }

                setLoadingSeats(true);

                const response = await api.get("/seats", {
                    params: {
                        showtimeId,
                    },
                });

                const nextSeats =
                    response.data.seats ||
                    response.data.data ||
                    response.data ||
                    [];

                setSeats(Array.isArray(nextSeats) ? nextSeats : []);

                if (Array.isArray(preselectSeatIds)) {
                    setSelectedSeatIds(normalizeSeatIds(preselectSeatIds));
                    return;
                }

                if (
                    isEditMode &&
                    ownedShowtimeId &&
                    isSameId(showtimeId, ownedShowtimeId)
                ) {
                    setSelectedSeatIds(normalizeSeatIds(ownedSeatIds));
                } else {
                    setSelectedSeatIds([]);
                }
            } catch (error) {
                setFeedback({
                    type: "error",
                    message: getApiError(error),
                });

                setSeats([]);
                setSelectedSeatIds([]);
            } finally {
                setLoadingSeats(false);
            }
        },
        [isEditMode, reservationShowtimeId, reservationSeatIds]
    );

    /*
      Loads available showtimes for the selected show.

      In edit mode, the reservation's current showtime is selected first so the
      user sees the current booking state before making changes.
    */
    const fetchShowtimes = useCallback(async () => {
        if (!resolvedShowId) {
            setFeedback({
                type: "error",
                message: "Show information is missing. Please go back and select a show again.",
            });

            setLoadingShowtimes(false);
            return;
        }

        try {
            setFeedback(null);
            setLoadingShowtimes(true);

            const response = await api.get("/showtimes", {
                params: {
                    showId: resolvedShowId,
                },
            });

            const nextShowtimes =
                response.data.showtimes ||
                response.data.data ||
                response.data ||
                [];

            const safeShowtimes = Array.isArray(nextShowtimes) ? nextShowtimes : [];

            setShowtimes(safeShowtimes);

            if (safeShowtimes.length > 0) {
                const preferredShowtime =
                    isEditMode && reservationShowtimeId
                        ? safeShowtimes.find((item) =>
                            isSameId(getShowtimeId(item), reservationShowtimeId)
                        )
                        : null;

                const initialShowtime = preferredShowtime || safeShowtimes[0];
                const initialShowtimeId = getShowtimeId(initialShowtime);

                setSelectedShowtime(initialShowtime);
                await fetchSeats(initialShowtimeId);
            } else {
                setSelectedShowtime(null);
                setSeats([]);
                setSelectedSeatIds([]);
            }
        } catch (error) {
            setFeedback({
                type: "error",
                message: getApiError(error),
            });

            setShowtimes([]);
            setSeats([]);
            setSelectedSeatIds([]);
        } finally {
            setLoadingShowtimes(false);
        }
    }, [
        resolvedShowId,
        isEditMode,
        reservationShowtimeId,
        fetchSeats,
    ]);

    useEffect(() => {
        fetchShowtimes();
    }, [fetchShowtimes]);

    async function handleSelectShowtime(showtime) {
        const showtimeId = getShowtimeId(showtime);

        setSelectedShowtime(showtime);
        await fetchSeats(showtimeId);
    }

    function handleToggleSeat(seat) {
        if (!isSeatAvailable(seat)) {
            return;
        }

        const seatId = normalizeId(getSeatId(seat));

        setSelectedSeatIds((currentSeatIdsState) => {
            const normalizedCurrentIds = currentSeatIdsState.map(normalizeId);

            if (normalizedCurrentIds.includes(seatId)) {
                return normalizedCurrentIds.filter((id) => id !== seatId);
            }

            return [...normalizedCurrentIds, seatId];
        });
    }

    /*
      Sends the user back to the main authenticated home screen.

      navigation.reset clears the previous stack, so pressing back does not
      return through the whole reservation flow.
    */
    function handleGoHome() {
        navigation.reset({
            index: 0,
            routes: [{ name: "Shows" }],
        });
    }

    /*
      Submits either a create or update request.

      POST creates a new reservation.
      PUT updates an existing future reservation.

      Seat availability is refreshed after the backend confirms the action.
      The success feedback is set after refresh so it remains visible.
    */
    async function handleSubmitReservation() {
        if (!selectedShowtimeId) {
            setFeedback({
                type: "error",
                message: "Please select a showtime before continuing.",
            });
            return;
        }

        if (selectedSeatIds.length === 0) {
            setFeedback({
                type: "error",
                message: "Please select at least one available seat.",
            });
            return;
        }

        if (isEditMode && !resolvedReservationId) {
            setFeedback({
                type: "error",
                message: "Reservation ID is missing. Please go back and try again.",
            });
            return;
        }

        try {
            setSubmitting(true);
            setFeedback(null);

            const submittedSeatIds = normalizeSeatIds(selectedSeatIds);

            const payload = {
                showtimeId: selectedShowtimeId,
                seatIds: submittedSeatIds,
            };

            if (isEditMode) {
                await api.put(`/reservations/${resolvedReservationId}`, payload);

                setReservationShowtimeId(selectedShowtimeId);
                setReservationSeatIds(submittedSeatIds);

                await fetchSeats(selectedShowtimeId, {
                    clearFeedback: false,
                    ownedShowtimeId: selectedShowtimeId,
                    ownedSeatIds: submittedSeatIds,
                    preselectSeatIds: submittedSeatIds,
                });

                setFeedback({
                    type: "success",
                    message: "Reservation updated successfully. Seat availability has been refreshed.",
                });
            } else {
                await api.post("/reservations", payload);

                await fetchSeats(selectedShowtimeId, {
                    clearFeedback: false,
                    preselectSeatIds: [],
                });

                setFeedback({
                    type: "success",
                    message: "Reservation created successfully. Seat availability has been updated.",
                });
            }

            /*
              Delay navigation so the success message remains visible.
              This improves UX and allows clean screenshot evidence.
            */
            setTimeout(() => {
                navigation.navigate("MyReservations");
            }, 2500);
        } catch (error) {
            await fetchSeats(selectedShowtimeId, {
                clearFeedback: false,
            });

            setFeedback({
                type: "error",
                message: getApiError(error),
            });
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingShowtimes) {
        return <LoadingView message="Loading available showtimes..." />;
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.badge}>
                        {isEditMode ? "Edit Reservation" : "Seat Selection"}
                    </Text>

                    <Text style={styles.title}>{showTitle}</Text>

                    <Text style={styles.subtitle}>
                        {isEditMode
                            ? "Modify your future reservation by selecting a new showtime or changing seats."
                            : "Select a showtime, choose available seats, and confirm your reservation securely."}
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>1. Select showtime</Text>

                    {showtimes.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No showtimes are currently available for this show.
                        </Text>
                    ) : (
                        showtimes.map((item) => {
                            const itemId = getShowtimeId(item);
                            const selected = isSameId(itemId, selectedShowtimeId);

                            return (
                                <Pressable
                                    key={String(itemId)}
                                    style={[
                                        styles.showtimeButton,
                                        selected && styles.selectedShowtimeButton,
                                    ]}
                                    onPress={() => handleSelectShowtime(item)}
                                >
                                    <Text
                                        style={[
                                            styles.showtimeText,
                                            selected && styles.selectedShowtimeText,
                                        ]}
                                    >
                                        {formatShowtime(item)}
                                    </Text>
                                </Pressable>
                            );
                        })
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>2. Select seats</Text>

                    {loadingSeats ? (
                        <LoadingView message="Loading seats..." />
                    ) : seats.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No seats were found for the selected showtime.
                        </Text>
                    ) : (
                        <View style={styles.seatGrid}>
                            {seats.map((item) => {
                                const seatId = normalizeId(getSeatId(item));
                                const available = isSeatAvailable(item);
                                const selected = selectedSeatIds
                                    .map(normalizeId)
                                    .includes(seatId);

                                return (
                                    <Pressable
                                        key={String(seatId)}
                                        style={[
                                            styles.seat,
                                            !available && styles.unavailableSeat,
                                            selected && styles.selectedSeat,
                                        ]}
                                        onPress={() => handleToggleSeat(item)}
                                        disabled={!available}
                                    >
                                        <Text
                                            style={[
                                                styles.seatText,
                                                !available && styles.unavailableSeatText,
                                                selected && styles.selectedSeatText,
                                            ]}
                                        >
                                            {formatSeat(item)}
                                        </Text>

                                        <Text
                                            style={[
                                                styles.seatPrice,
                                                !available && styles.unavailableSeatText,
                                                selected && styles.selectedSeatText,
                                            ]}
                                        >
                                            €{getSeatPrice(item).toFixed(2)}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}

                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, styles.availableDot]} />
                            <Text style={styles.legendText}>Available</Text>
                        </View>

                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, styles.selectedDot]} />
                            <Text style={styles.legendText}>Selected</Text>
                        </View>

                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, styles.unavailableDot]} />
                            <Text style={styles.legendText}>Unavailable</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>3. Confirm reservation</Text>

                    <Text style={styles.summaryText}>
                        Selected seats:{" "}
                        <Text style={styles.summaryStrong}>
                            {selectedSeatIds.length}
                        </Text>
                    </Text>

                    <Text style={styles.summaryText}>
                        Total price:{" "}
                        <Text style={styles.summaryStrong}>
                            €{totalPrice.toFixed(2)}
                        </Text>
                    </Text>

                    <FeedbackMessage
                        message={feedback?.message}
                        type={feedback?.type}
                    />

                    <AppButton
                        title={
                            submitting
                                ? isEditMode
                                    ? "Updating Reservation..."
                                    : "Creating Reservation..."
                                : isEditMode
                                    ? "Update Reservation"
                                    : "Create Reservation"
                        }
                        onPress={handleSubmitReservation}
                        disabled={
                            submitting ||
                            !selectedShowtime ||
                            selectedSeatIds.length === 0
                        }
                    />

                    <AppButton
                        title={isEditMode ? "Back to My Reservations" : "Back to Show Details"}
                        variant="secondary"
                        onPress={() => navigation.goBack()}
                    />

                    <AppButton
                        title="Back to Theatre Shows"
                        variant="secondary"
                        onPress={handleGoHome}
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

    sectionTitle: {
        fontSize: 21,
        fontWeight: "900",
        color: "#111827",
        marginBottom: 14,
    },

    showtimeButton: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 16,
        padding: 15,
        marginBottom: 10,
        backgroundColor: "#ffffff",
    },

    selectedShowtimeButton: {
        backgroundColor: "#1f2937",
        borderColor: "#1f2937",
    },

    showtimeText: {
        color: "#111827",
        fontWeight: "800",
    },

    selectedShowtimeText: {
        color: "#ffffff",
    },

    seatGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },

    seat: {
        width: 86,
        minHeight: 78,
        justifyContent: "center",
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 14,
        backgroundColor: "#e0f2fe",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#bae6fd",
    },

    selectedSeat: {
        backgroundColor: "#1f2937",
        borderColor: "#1f2937",
    },

    unavailableSeat: {
        backgroundColor: "#e5e7eb",
        borderColor: "#d1d5db",
        opacity: 0.78,
    },

    seatText: {
        color: "#075985",
        fontSize: 16,
        fontWeight: "900",
        marginBottom: 5,
    },

    seatPrice: {
        color: "#075985",
        fontSize: 12,
        fontWeight: "800",
    },

    selectedSeatText: {
        color: "#ffffff",
    },

    unavailableSeatText: {
        color: "#9ca3af",
    },

    legend: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        marginTop: 18,
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },

    legendDot: {
        width: 14,
        height: 14,
        borderRadius: 999,
        borderWidth: 1,
    },

    availableDot: {
        backgroundColor: "#e0f2fe",
        borderColor: "#bae6fd",
    },

    selectedDot: {
        backgroundColor: "#1f2937",
        borderColor: "#1f2937",
    },

    unavailableDot: {
        backgroundColor: "#e5e7eb",
        borderColor: "#d1d5db",
    },

    legendText: {
        color: "#6b7280",
        fontWeight: "800",
        fontSize: 13,
    },

    summaryText: {
        color: "#4b5563",
        fontSize: 16,
        marginBottom: 10,
    },

    summaryStrong: {
        color: "#111827",
        fontWeight: "900",
    },

    emptyText: {
        color: "#6b7280",
        lineHeight: 21,
    },
});
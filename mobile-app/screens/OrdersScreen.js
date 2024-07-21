import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import { useGetUserBookingsQuery } from "../redux/api/userApiSlice";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native";

const OrdersScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const {
    data: bookings = [],
    isError,
    refetch,
  } = useGetUserBookingsQuery(userInfo?.id, {
    skip: !userInfo,
  });
  const [currentBooking, setCurrentBooking] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    if (userInfo) {
      refetch();
    }
  }, [userInfo, refetch]);

  const handleGenerateQR = (booking) => {
    setCurrentBooking(booking);
    setIsQRModalOpen(true);
  };

  const formatDateInFrench = (dateString) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("fr-FR", { weekday: "long" });
    const restOfDate = date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return `${day} ${restOfDate}`;
  };

  const formatTimeInUTC = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  const generateQRData = (booking) => {
    return JSON.stringify({
      bookingId: booking._id,
      movieTitle: booking.movie.movieTitle,
      sessionDate: booking.timeRange
        ? `${formatDateInFrench(
            booking.timeRange.timeRangeStartTime
          )} de ${formatTimeInUTC(
            booking.timeRange.timeRangeStartTime
          )} à ${formatTimeInUTC(booking.timeRange.timeRangeEndTime)}`
        : "N/A",
      cinemaName: booking.session?.cinema?.cinemaName || "N/A",
      seats: booking.seatsBooked.map((seat) => seat.seatNumber).join(", "),
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filterBookings = (bookings, condition) => {
    if (!Array.isArray(bookings)) return [];
    return bookings.filter((booking) => {
      const sessionDate = new Date(booking.timeRange.timeRangeStartTime);
      sessionDate.setHours(0, 0, 0, 0);
      return condition(sessionDate);
    });
  };

  const todayBookings = filterBookings(
    bookings,
    (sessionDate) => sessionDate.getTime() === today.getTime()
  );
  const futureBookings = filterBookings(
    bookings,
    (sessionDate) => sessionDate.getTime() > today.getTime()
  );
  const pastBookings = filterBookings(
    bookings,
    (sessionDate) => sessionDate.getTime() < today.getTime()
  );

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingItem}>
      <View style={styles.bookingHeader}>
        <Image
          source={{ uri: item.movie.movieImg }}
          style={styles.movieImage}
        />
        <View style={styles.bookingHeaderText}>
          <Text style={styles.bookingTitle}>{item.movie.movieTitle}</Text>
          <Text style={styles.bookingId}>Commande n°{item._id}</Text>
        </View>
      </View>
      <Text style={styles.bookingDetails}>
        Date de la réservation: {formatDateInFrench(item.bookingCreatedAt)} à{" "}
        {formatTimeInUTC(item.bookingCreatedAt)}
      </Text>
      <Text style={styles.bookingDetails}>
        Montant payé: {item.bookingPrice.toFixed(2)} €
      </Text>
      <Text style={styles.bookingDetails}>
        Sièges sélectionnés:{" "}
        {item.seatsBooked.map((seat) => seat.seatNumber).join(", ")}
      </Text>
      <Text style={styles.sectionTitle}>Votre séance</Text>
      <Text style={styles.bookingDetails}>
        Date de la séance:{" "}
        {item.timeRange
          ? `${formatDateInFrench(
              item.timeRange.timeRangeStartTime
            )} de ${formatTimeInUTC(
              item.timeRange.timeRangeStartTime
            )} à ${formatTimeInUTC(item.timeRange.timeRangeEndTime)}`
          : "N/A"}
      </Text>
      <Text style={styles.bookingDetails}>
        Salle n° {item.session.room?.roomNumber || "N/A"}
      </Text>
      <Text style={styles.sectionTitle}>Votre cinéma</Text>
      <Text style={styles.bookingDetails}>
        {item.session?.cinema?.cinemaName || "N/A"}
      </Text>
      <Text style={styles.bookingDetails}>
        {item.session?.cinema?.cinemaAddress || "N/A"}
      </Text>
      <Text style={styles.bookingDetails}>
        {item.session?.cinema?.cinemaPostalCode || "N/A"}{" "}
        {item.session?.cinema?.cinemaCity || "N/A"}
      </Text>
      <Text style={styles.bookingDetails}>
        {item.session?.cinema?.cinemaCountry || "N/A"}
      </Text>
      <TouchableOpacity
        style={styles.qrButton}
        onPress={() => handleGenerateQR(item)}
      >
        <Text style={styles.qrButtonText}>Afficher le QR Code</Text>
      </TouchableOpacity>
    </View>
  );

  if (isError) return <Text>Error loading bookings</Text>;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <Text style={styles.mainSectionTitle}>Réservations du jour</Text>
        {todayBookings.length > 0 ? (
          <FlatList
            style={styles.bookingsSection}
            data={todayBookings}
            keyExtractor={(item) => item._id}
            renderItem={renderBookingItem}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noBookings}>
            Aucune réservation pour aujourd'hui.
          </Text>
        )}

        <Text style={styles.mainSectionTitle}>Réservations futures</Text>
        {futureBookings.length > 0 ? (
          <FlatList
            style={styles.bookingsSection}
            data={futureBookings}
            keyExtractor={(item) => item._id}
            renderItem={renderBookingItem}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noBookings}>Aucune réservation future.</Text>
        )}

        <Text style={styles.mainSectionTitle}>Réservations passées</Text>
        {pastBookings.length > 0 ? (
          <FlatList
            style={styles.bookingsSection}
            data={pastBookings}
            keyExtractor={(item) => item._id}
            renderItem={renderBookingItem}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noBookings}>Aucune réservation passée.</Text>
        )}

        {currentBooking && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={isQRModalOpen}
            onRequestClose={() => setIsQRModalOpen(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsQRModalOpen(false)}
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
                <QRCode value={generateQRData(currentBooking)} size={256} />
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 20,
    paddingBottom: 60,
  },
  bookingsSection: {
    marginBottom: 24,
  },
  mainSectionTitle: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
  },
  bookingItem: {
    padding: 22,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  movieImage: {
    width: 80,
    height: 120,
    resizeMode: "cover",
    borderRadius: 4,
  },
  bookingHeaderText: {
    marginLeft: 16,
    flex: 1,
  },
  bookingTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  bookingId: {
    fontSize: 14,
    color: "#555",
  },
  bookingDetails: {
    fontSize: 14,
    color: "#555",
    marginVertical: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  qrButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#15803d",
    borderRadius: 4,
    alignItems: "center",
  },
  qrButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  noBookings: {
    fontSize: 16,
    color: "#999",
    marginVertical: 8,
    textAlign: "center",
    marginBottom: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: -40,
    right: -40,
    padding: 8,
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 25,
  },
});

export default OrdersScreen;

import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
  Image,
} from "react-native";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../redux/api/userApiSlice";
import { logout } from "../redux/features/auth/authSlice";
import { useNavigation } from "@react-navigation/native";
import { WEB_APP_FRONTEND_URL } from "@env";

const Logo = require("../assets/logo-light.svg");

const Footer = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch();
  const [logoutUser] = useLogoutMutation();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(logout());
      setModalVisible(false);
      navigation.navigate("Login");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <View style={styles.footer}>
      <Image source={Logo} style={styles.centerLogo} />
      <TouchableOpacity
        style={styles.accountButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.accountText}>Mon compte</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Mon compte</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() =>
                navigation.navigate("WebView", {
                  url: `${WEB_APP_FRONTEND_URL}/login`,
                })
              }
            >
              <Text style={styles.modalLinkText}>Aller sur le site</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={handleLogout}>
              <Text style={styles.modalLinkText}>Déconnexion</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButton}>Retour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#262626",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  centerLogo: {
    position: "absolute",
    top: "50%",
    transform: [{ translateY: -9.375 }],
    width: 154,
    height: 22.75,
    resizeMode: "contain",
  },
  accountButton: {
    position: "absolute",
    bottom: "50%",
    right: 10,
    transform: [{ translateY: 10 }],
  },
  accountText: {
    color: "#fff",
    fontSize: 14,
    textAlignVertical: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalOption: {
    padding: 10,
  },
  modalLinkText: {
    color: "#111827",
    fontSize: 16,
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 20,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    backgroundColor: "#D1D5DB",
    color: "#4B5563",
  },
});

export default Footer;

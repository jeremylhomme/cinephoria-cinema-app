import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useLoginMutation } from "../redux/api/userApiSlice";
import { setCredentials } from "../redux/features/auth/authSlice";
import { useNavigation } from "@react-navigation/native";
import { NATIVE_FRONTEND_URL } from "@env";
import { WEB_APP_FRONTEND_URL } from "@env";

const Logo = require("../assets/logo-dark.svg");

const LoginScreen = () => {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const navigation = useNavigation();

  useEffect(() => {
    if (userInfo && userInfo.mustChangePassword) {
      Alert.alert(
        "Change Password Required",
        `Please go to ${NATIVE_FRONTEND_URL}/login to change your password.`,
        [{ text: "OK" }]
      );
    } else if (userInfo) {
      navigation.navigate("Orders");
    }
  }, [userInfo, navigation]);

  const submitHandler = async () => {
    try {
      const user = await login({ userEmail, userPassword }).unwrap();
      dispatch(setCredentials(user));
      if (user.mustChangePassword) {
        Alert.alert(
          "Change Password Required",
          `Please go to ${WEB_APP_FRONTEND_URL}/login to change your password.`,
          [{ text: "OK" }]
        );
      } else {
        navigation.navigate("Orders");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={Logo} style={styles.logo} />
        <Text style={styles.title}>
          Bienvenue sur l'application Cinéphoria !
        </Text>
        <Text style={styles.subtitle}>
          Connectez-vous pour accéder à vos réservations.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Adresse e-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre adresse e-mail"
            value={userEmail}
            onChangeText={setUserEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Entrez votre mot de passe"
            value={userPassword}
            onChangeText={setUserPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={submitHandler}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Loading..." : "Connexion"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 351,
    height: 44,
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  formContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  passwordContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#15803d",
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LoginScreen;

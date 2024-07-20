import { createSlice } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialState = {
  userInfo: null,
};

const loadInitialState = async () => {
  try {
    const userInfo = await AsyncStorage.getItem("userInfo");
    if (userInfo !== null) {
      initialState.userInfo = JSON.parse(userInfo);
    }
  } catch (error) {
    console.error("Failed to load user info from storage:", error);
  }
};

loadInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      AsyncStorage.setItem("userInfo", JSON.stringify(action.payload));

      const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
      AsyncStorage.setItem("expirationTime", expirationTime.toString());
    },
    logout: (state) => {
      state.userInfo = null;
      AsyncStorage.clear();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

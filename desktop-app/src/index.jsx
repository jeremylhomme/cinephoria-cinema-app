import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import "./index.css";

const expirationTime = localStorage.getItem("expirationTime");
if (expirationTime && new Date().getTime() > parseInt(expirationTime)) {
  localStorage.removeItem("userInfo");
  localStorage.removeItem("expirationTime");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

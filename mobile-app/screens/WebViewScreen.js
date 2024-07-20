import React from "react";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native";

const WebViewScreen = ({ route }) => {
  const { url } = route.params;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView source={{ uri: url }} />
    </SafeAreaView>
  );
};

export default WebViewScreen;

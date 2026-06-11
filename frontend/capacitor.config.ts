import type { CapacitorConfig } from "@capacitor/cli";

const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim();
const isCleartextServer = serverUrl?.startsWith("http://") ?? false;
const isDevelopment = process.env.NODE_ENV !== "production";

const config: CapacitorConfig = {
  appId: "com.maia.app",
  appName: "Maia",
  webDir: "native-shell",
  backgroundColor: "#fffafa",
  loggingBehavior: isDevelopment ? "debug" : "none",
  android: {
    backgroundColor: "#fffafa",
    webContentsDebuggingEnabled: isDevelopment,
  },
  ios: {
    backgroundColor: "#fffafa",
    preferredContentMode: "mobile",
  },
  server: serverUrl
    ? {
        url: serverUrl,
        cleartext: isCleartextServer,
        errorPath: "connection-error.html",
      }
    : {
        errorPath: "connection-error.html",
      },
};

export default config;

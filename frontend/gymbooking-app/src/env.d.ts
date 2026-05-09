// Expo injects EXPO_PUBLIC_* variables into process.env at build/runtime.
// This lightweight declaration avoids requiring @types/node in the RN app.

declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
  };
};

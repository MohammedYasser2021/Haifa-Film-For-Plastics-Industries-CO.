import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { I18nProvider } from "./lib/i18n";
import { AuthProvider } from "./lib/auth";
import { FeedbackProvider } from "./components/Feedback";
import AuthGate from "./components/AuthGate";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <I18nProvider>
    <FeedbackProvider>
      <AuthProvider>
        <AuthGate>
          <App />
        </AuthGate>
      </AuthProvider>
    </FeedbackProvider>
  </I18nProvider>
);

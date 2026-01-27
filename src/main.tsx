import React from "react";
import ReactDOM from "react-dom/client";
import { MsalProvider, PublicClientApplication } from "@azure/msal-react";
import App from "./App";
import { msalConfig } from "./lib/auth";
import "./index.css";

const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </React.StrictMode>
);

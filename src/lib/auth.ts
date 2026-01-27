import { Configuration, LogLevel, PopupRequest } from "@azure/msal-browser";

const clientId = import.meta.env.VITE_AAD_CLIENT_ID as string | undefined;
const tenantId = import.meta.env.VITE_AAD_TENANT_ID as string | undefined;
const redirectUri = import.meta.env.VITE_REDIRECT_URI as string | undefined;

export const envErrors = [
  !clientId ? "VITE_AAD_CLIENT_ID is missing" : null,
  !tenantId ? "VITE_AAD_TENANT_ID is missing" : null,
  !redirectUri ? "VITE_REDIRECT_URI is missing" : null
].filter(Boolean) as string[];

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId ?? "",
    authority: `https://login.microsoftonline.com/${tenantId ?? "common"}`,
    redirectUri: redirectUri ?? "http://localhost:5173"
  },
  cache: {
    cacheLocation: "memoryStorage",
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      piiLoggingEnabled: false
    }
  }
};

export const loginRequest: PopupRequest = {
  scopes: ["User.Read", "Sites.Read.All"]
};

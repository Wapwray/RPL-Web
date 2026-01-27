import { useEffect, useMemo, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { envErrors, loginRequest } from "./lib/auth";
import {
  findList,
  getDisplayFields,
  getListItems,
  resolveSiteId,
  GraphListItem
} from "./lib/graph";

type LoadState = "idle" | "loading" | "success" | "error";

function formatValue(value: unknown): string {
  if (value == null) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export default function App() {
  const { instance, accounts } = useMsal();
  const [items, setItems] = useState<GraphListItem[]>([]);
  const [status, setStatus] = useState<LoadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [listName, setListName] = useState<string>("");

  const account = useMemo(() => {
    return instance.getActiveAccount() ?? accounts[0] ?? null;
  }, [accounts, instance]);

  const displayFields = useMemo(() => getDisplayFields(items), [items]);

  useEffect(() => {
    if (accounts.length > 0 && !instance.getActiveAccount()) {
      instance.setActiveAccount(accounts[0]);
    }
  }, [accounts, instance]);

  const signIn = async () => {
    setError(null);
    try {
      const response = await instance.loginPopup(loginRequest);
      instance.setActiveAccount(response.account);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  };

  const loadItems = async () => {
    if (!account) {
      return;
    }

    setStatus("loading");
    setError(null);

    try {
      let tokenResponse;
      try {
        tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account
        });
      } catch {
        tokenResponse = await instance.acquireTokenPopup({
          ...loginRequest,
          account
        });
      }

      const siteId = await resolveSiteId(tokenResponse.accessToken);
      const list = await findList(tokenResponse.accessToken, siteId);
      const listItems = await getListItems(tokenResponse.accessToken, siteId, list.id);

      setListName(list.displayName);
      setItems(listItems);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to load list items.");
    }
  };

  useEffect(() => {
    if (account) {
      loadItems();
    }
  }, [account]);

  const isSignedIn = Boolean(account);

  return (
    <div className="app">
      <header>
        <h1>RPL SharePoint List Viewer</h1>
        <p>Site: aamctraining.sharepoint.com/sites/AAMCData</p>
      </header>

      {envErrors.length > 0 && (
        <div className="card error">
          <h2>Missing configuration</h2>
          <ul>
            {envErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <p>Update your .env file and restart the dev server.</p>
        </div>
      )}

      <div className="actions">
        {!isSignedIn ? (
          <button onClick={signIn} disabled={envErrors.length > 0}>
            Sign in
          </button>
        ) : (
          <button onClick={loadItems} disabled={status === "loading"}>
            Refresh list
          </button>
        )}
      </div>

      {status === "loading" && <div className="card">Loading list items…</div>}
      {status === "error" && error && <div className="card error">{error}</div>}

      {status === "success" && (
        <div className="card">
          <h2>{listName || "List items"}</h2>
          {items.length === 0 ? (
            <p>No list items found.</p>
          ) : displayFields.length === 0 ? (
            <p>No non-system fields detected.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  {displayFields.map((field: string) => (
                    <th key={field}>{field}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item: GraphListItem) => (
                  <tr key={item.id}>
                    {displayFields.map((field: string) => (
                      <td key={`${item.id}-${field}`}>
                        {formatValue(item.fields?.[field])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {isSignedIn && status === "success" && (
        <p className="hint">
          If you see an authorization error, ensure Sites.Read.All has admin
          consent.
        </p>
      )}
    </div>
  );
}

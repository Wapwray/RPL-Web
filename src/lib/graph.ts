export type GraphSite = {
  id: string;
};

export type GraphList = {
  id: string;
  displayName: string;
};

export type GraphListItem = {
  id: string;
  fields: Record<string, unknown>;
};

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";
const SITE_HOSTNAME = "aamctraining.sharepoint.com";
const SITE_PATH = "/sites/AAMCData";
const TARGET_LIST_NAME = "Industry List  RPL";

export const SYSTEM_FIELDS = new Set([
  "id",
  "Title",
  "Created",
  "Modified",
  "Author",
  "Editor",
  "ContentType",
  "Attachments",
  "GUID",
  "ComplianceAssetId"
]);

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

async function graphGet<T>(accessToken: string, url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Graph request failed (${response.status}): ${detail}`);
  }

  return (await response.json()) as T;
}

export async function resolveSiteId(accessToken: string): Promise<string> {
  const url = `${GRAPH_BASE}/sites/${SITE_HOSTNAME}:${SITE_PATH}`;
  const site = await graphGet<GraphSite>(accessToken, url);
  return site.id;
}

export async function findList(accessToken: string, siteId: string): Promise<GraphList> {
  const url = `${GRAPH_BASE}/sites/${siteId}/lists?$select=id,displayName`;
  const result = await graphGet<{ value: GraphList[] }>(accessToken, url);

  const targetNormalized = normalizeName(TARGET_LIST_NAME);
  const exact = result.value.find((list) => list.displayName === TARGET_LIST_NAME);
  if (exact) {
    return exact;
  }

  const normalizedMatch = result.value.find(
    (list) => normalizeName(list.displayName) === targetNormalized
  );

  if (!normalizedMatch) {
    const available = result.value.map((list) => list.displayName).join(", ");
    throw new Error(
      `List '${TARGET_LIST_NAME}' was not found. Available lists: ${available || "(none)"}.`
    );
  }

  return normalizedMatch;
}

export async function getListItems(
  accessToken: string,
  siteId: string,
  listId: string
): Promise<GraphListItem[]> {
  const url = `${GRAPH_BASE}/sites/${siteId}/lists/${listId}/items?expand=fields&$top=200`;
  const result = await graphGet<{ value: GraphListItem[] }>(accessToken, url);
  return result.value ?? [];
}

export function getDisplayFields(items: GraphListItem[]): string[] {
  const allFields = new Set<string>();
  const nonEmptyFields = new Set<string>();

  for (const item of items) {
    const fields = item.fields ?? {};
    for (const [key, value] of Object.entries(fields)) {
      if (SYSTEM_FIELDS.has(key)) {
        if (key !== "Title") {
          continue;
        }
        if (value == null || String(value).trim() === "") {
          continue;
        }
      }

      allFields.add(key);
      if (value != null && String(value).trim() !== "") {
        nonEmptyFields.add(key);
      }
    }
  }

  const result = (nonEmptyFields.size ? nonEmptyFields : allFields);
  return Array.from(result);
}

const output = document.getElementById("output");
const statusEl = document.getElementById("status");
const refreshBtn = document.getElementById("refreshBtn");

async function loadItems() {
  statusEl.textContent = "Loading...";
  try {
    const response = await fetch("/api/list-items");
    if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.detail ? JSON.stringify(errorBody.detail) : "Request failed");
    }
    const data = await response.json();
    output.textContent = JSON.stringify(data.items, null, 2);
    statusEl.textContent = `Loaded ${data.items.length} items`;
  } catch (error) {
    output.textContent = error.message;
    statusEl.textContent = "Error";
  }
}

refreshBtn.addEventListener("click", loadItems);

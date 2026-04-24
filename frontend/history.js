const API_BASE_URL = "https://finwise-expense-tracker.onrender.com";

let allTransactions = [];
let filteredTransactions = [];

// ══════════════════════════════════════════════════════════
//                   AUTHENTICATION
// ══════════════════════════════════════════════════════════

function checkAuth() {
  const user = localStorage.getItem("user");
  if (!user) {
    window.location.href = "login.html";
    return false;
  }

  const userData = JSON.parse(user);
  const avatarElement = document.getElementById("userAvatar");
  const usernameElement = document.getElementById("logoutUsername");

  if (avatarElement) {
    avatarElement.textContent = userData.username.substring(0, 2).toUpperCase();
  }

  if (usernameElement) {
    usernameElement.textContent = userData.username;
  }

  return true;
}

function showLogoutMenu() {
  const menu = document.getElementById("logoutMenu");
  if (menu) {
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  }
}

document.addEventListener("click", function (e) {
  const avatar = document.getElementById("userAvatar");
  const menu = document.getElementById("logoutMenu");

  if (
    menu &&
    avatar &&
    !avatar.contains(e.target) &&
    !menu.contains(e.target)
  ) {
    menu.style.display = "none";
  }
});

async function handleLogout() {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
}

checkAuth();

// ══════════════════════════════════════════════════════════
//                   TRANSACTION HISTORY
// ══════════════════════════════════════════════════════════

const categoryStyles = {
  Food: { bg: "rgba(0,229,195,0.12)", color: "#00e5c3", icon: "🍔" },
  Transport: { bg: "rgba(79,142,247,0.12)", color: "#4f8ef7", icon: "🚗" },
  Healthcare: { bg: "rgba(168,85,247,0.12)", color: "#a855f7", icon: "💊" },
  Bills: { bg: "rgba(245,166,35,0.12)", color: "#f5a623", icon: "⚡" },
  Shopping: { bg: "rgba(255,159,69,0.12)", color: "#ff9f45", icon: "🛍️" },
  Entertainment: { bg: "rgba(249,115,22,0.12)", color: "#f97316", icon: "🎬" },
  Income: { bg: "rgba(34,197,94,0.12)", color: "#22c55e", icon: "💰" },
  Others: { bg: "rgba(148,163,184,0.12)", color: "#94a3b8", icon: "📝" },
};

async function loadAllTransactions() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/transactions?limit=1000`,
      {
        credentials: "include",
      },
    );
    const data = await response.json();

    if (data.success) {
      allTransactions = data.transactions;
      filteredTransactions = [...allTransactions];
      renderTransactions();
      updateStats();
    }
  } catch (error) {
    console.error("Error loading transactions:", error);
    showEmptyState();
  }
}

function renderTransactions() {
  const tbody = document.getElementById("transactionsBody");
  const emptyState = document.getElementById("emptyState");
  const tableContainer = document.getElementById("tableContainer");

  if (filteredTransactions.length === 0) {
    tbody.innerHTML = "";
    emptyState.style.display = "block";
    document.getElementById("transactionsTable").style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  document.getElementById("transactionsTable").style.display = "table";

  tbody.innerHTML = filteredTransactions
    .map((tx) => {
      const style = categoryStyles[tx.category] || categoryStyles["Others"];
      const date = new Date(tx.date);
      const formattedDate = date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      return `
      <tr>
        <td>
          <div class="table-icon" style="background: ${style.bg}">
            ${tx.icon || style.icon}
          </div>
        </td>
        <td>
          <strong>${tx.description}</strong>
        </td>
        <td>
          <span class="table-category" style="background: ${style.bg}; color: ${style.color}">
            ${tx.category}
          </span>
        </td>
        <td>
          <span class="table-amount" style="color: ${tx.category === "Income" ? "#22c55e" : "#ff5c5c"}">
            ${tx.category === "Income" ? "+" : "-"}₹${tx.amount.toFixed(2)}
          </span>
        </td>
        <td>${formattedDate}</td>
        <td>${tx.confidence ? tx.confidence.toFixed(1) + "%" : "N/A"}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn delete" onclick="deleteTransaction(${tx.id})">
              🗑️ Delete
            </button>
          </div>
        </td>
      </tr>
    `;
    })
    .join("");
}

function updateStats() {
  const total = allTransactions.length;
  const totalSpending = allTransactions
    .filter((tx) => tx.category !== "Income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthSpending = allTransactions
    .filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        tx.category !== "Income" &&
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  document.getElementById("totalCount").textContent = total;
  document.getElementById("totalSpending").textContent =
    "₹" + totalSpending.toFixed(2);
  document.getElementById("monthSpending").textContent =
    "₹" + monthSpending.toFixed(2);
}

function filterTransactions() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const categoryFilter = document.getElementById("categoryFilter").value;
  const monthFilter = document.getElementById("monthFilter").value;

  filteredTransactions = allTransactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm);
    const matchesCategory = !categoryFilter || tx.category === categoryFilter;

    let matchesMonth = true;
    if (monthFilter) {
      const txDate = new Date(tx.date);
      const [filterYear, filterMonth] = monthFilter.split("-");
      matchesMonth =
        txDate.getFullYear() === parseInt(filterYear) &&
        txDate.getMonth() + 1 === parseInt(filterMonth);
    }

    return matchesSearch && matchesCategory && matchesMonth;
  });

  renderTransactions();
}

function clearFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("categoryFilter").value = "";
  document.getElementById("monthFilter").value = "";
  filteredTransactions = [...allTransactions];
  renderTransactions();
}

async function deleteTransaction(id) {
  if (!confirm("Are you sure you want to delete this transaction?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      allTransactions = allTransactions.filter((tx) => tx.id !== id);
      filteredTransactions = filteredTransactions.filter((tx) => tx.id !== id);

      renderTransactions();
      updateStats();

      alert("✅ Transaction deleted successfully!");
    } else {
      alert("❌ Failed to delete transaction");
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
    alert("❌ AI service unavailable. Please try again.");
  }
}

function exportToCSV() {
  if (filteredTransactions.length === 0) {
    alert("No transactions to export!");
    return;
  }

  let csv = "Date,Description,Category,Amount,Confidence\n";

  filteredTransactions.forEach((tx) => {
    const date = new Date(tx.date).toLocaleDateString("en-IN");
    const amount = tx.category === "Income" ? tx.amount : -tx.amount;
    const confidence = tx.confidence ? tx.confidence.toFixed(1) : "N/A";

    csv += `"${date}","${tx.description}","${tx.category}",${amount},${confidence}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `finwise_transactions_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  alert("✅ Transactions exported successfully!");
}

function showEmptyState() {
  document.getElementById("emptyState").style.display = "block";
  document.getElementById("transactionsTable").style.display = "none";
}

loadAllTransactions();

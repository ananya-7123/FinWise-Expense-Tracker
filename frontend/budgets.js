const API_BASE_URL = "https://finwise-expense-tracker.onrender.com";

let budgets = {};
let currentMonthStats = null;
let selectedMonth = "";

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

  if (avatarElement)
    avatarElement.textContent = userData.username.substring(0, 2).toUpperCase();
  if (usernameElement) usernameElement.textContent = userData.username;

  return true;
}

function showLogoutMenu() {
  const menu = document.getElementById("logoutMenu");
  if (menu)
    menu.style.display = menu.style.display === "none" ? "block" : "none";
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
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
}

checkAuth();

// ══════════════════════════════════════════════════════════
//                   BUDGET MANAGEMENT
// ══════════════════════════════════════════════════════════

const categoryInfo = {
  Food: { icon: "🍔", class: "food", color: "#00e5c3" },
  Transport: { icon: "🚗", class: "transport", color: "#4f8ef7" },
  Healthcare: { icon: "💊", class: "healthcare", color: "#a855f7" },
  Bills: { icon: "⚡", class: "bills", color: "#f5a623" },
  Shopping: { icon: "🛍️", class: "shopping", color: "#ff9f45" },
  Entertainment: { icon: "🎬", class: "entertainment", color: "#f97316" },
};

function init() {
  populateMonthSelector();
  loadBudgetsAndStats();
}

function populateMonthSelector() {
  const selector = document.getElementById("budgetMonthSelector");
  const months = [];
  const today = new Date();

  for (let i = 0; i < 6; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    months.push({ label: monthStr, value: monthValue });
  }

  selector.innerHTML = months
    .map(
      (m, i) =>
        `<option value="${m.value}" ${i === 0 ? "selected" : ""}>${m.label}</option>`,
    )
    .join("");

  selectedMonth = months[0].value;
  selector.addEventListener("change", function () {
    selectedMonth = this.value;
    loadBudgetsAndStats();
  });
}

async function loadBudgetsAndStats() {
  try {
    // Load both stats AND budgets from backend
    const [statsResponse, budgetsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/stats?month=${selectedMonth}`, {
        credentials: "include",
      }),
      fetch(`${API_BASE_URL}/api/budgets`, { credentials: "include" }),
    ]);

    const statsData = await statsResponse.json();
    const budgetsData = await budgetsResponse.json();

    if (statsData.success) {
      currentMonthStats = statsData;
    }

    if (budgetsData.success) {
      // Convert array to object keyed by category for easy lookup
      budgets = {};
      budgetsData.budgets.forEach((b) => {
        budgets[b.category] = b.limit;
      });
    }

    renderBudgets();
    updateOverview();
    checkBudgetAlerts();
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function renderBudgets() {
  const grid = document.getElementById("budgetGrid");
  grid.innerHTML = "";

  Object.keys(budgets).forEach((category) => {
    const budget = budgets[category];
    const info = categoryInfo[category] || {
      icon: "📝",
      class: "others",
      color: "#94a3b8",
    };
    const spent = getSpentForCategory(category);
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    const remaining = budget - spent;

    let progressClass = "good";
    let statusText = "On track";
    if (percentage >= 100) {
      progressClass = "danger";
      statusText = "Over budget!";
    } else if (percentage >= 80) {
      progressClass = "warning";
      statusText = "Warning";
    }

    const card = document.createElement("div");
    card.className = `budget-card ${info.class}`;
    card.innerHTML = `
      <div class="budget-icon">${info.icon}</div>
      <div class="budget-category">${category}</div>
      <div class="budget-status">${statusText}</div>
      <div class="budget-amounts">
        <div class="budget-spent" style="color: ${percentage >= 100 ? "#ff5c5c" : info.color}">
          ₹${spent.toFixed(2)}
        </div>
        <div class="budget-limit">/ ₹${budget.toFixed(2)}</div>
      </div>
      <div class="budget-progress">
        <div class="budget-progress-bar ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
      </div>
      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
        ${
          remaining >= 0
            ? `₹${remaining.toFixed(2)} remaining`
            : `₹${Math.abs(remaining).toFixed(2)} over budget`
        }
      </div>
      <div class="budget-actions">
        <button class="budget-btn" onclick="editBudget('${category}')">✏️ Edit</button>
        <button class="budget-btn" onclick="deleteBudget('${category}')">🗑️ Delete</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Always append the add card at the end
  const addCard = document.createElement("div");
  addCard.className = "budget-card add-budget-card";
  addCard.onclick = openAddBudgetModal;
  addCard.innerHTML = `
    <div class="add-budget-icon">➕</div>
    <div style="font-size: 14px; font-weight: 600; color: var(--text-dim);">Add New Budget</div>
  `;
  grid.appendChild(addCard);
}

function getSpentForCategory(category) {
  if (!currentMonthStats || !currentMonthStats.categories) return 0;
  const catData = currentMonthStats.categories.find(
    (c) => c.category === category,
  );
  return catData ? catData.total : 0;
}

function updateOverview() {
  const totalBudget = Object.values(budgets).reduce((sum, val) => sum + val, 0);
  const totalSpent = currentMonthStats ? currentMonthStats.total_spending : 0;
  const totalRemaining = totalBudget - totalSpent;
  const spentPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeft = Math.max(0, lastDay.getDate() - today.getDate() + 1);

  let alertCount = 0;
  Object.keys(budgets).forEach((category) => {
    if (getSpentForCategory(category) > budgets[category]) alertCount++;
  });

  document.getElementById("totalBudget").textContent =
    "₹" + totalBudget.toFixed(2);
  document.getElementById("totalSpent").textContent =
    "₹" + totalSpent.toFixed(2);
  document.getElementById("totalRemaining").textContent =
    "₹" + totalRemaining.toFixed(2);
  document.getElementById("alertCount").textContent = alertCount;
  document.getElementById("totalBudgetStatus").textContent =
    totalBudget > 0
      ? `${Object.keys(budgets).length} categories`
      : "Set your budgets";
  document.getElementById("totalSpentPercent").textContent =
    totalBudget > 0 ? `${spentPercent.toFixed(1)}% of budget` : "0% of budget";
  document.getElementById("daysRemaining").textContent =
    `${daysLeft} days left`;
}

function checkBudgetAlerts() {
  const alertBanner = document.getElementById("budgetAlert");
  const alertText = document.getElementById("budgetAlertText");
  const overBudget = [];

  Object.keys(budgets).forEach((category) => {
    const spent = getSpentForCategory(category);
    const budget = budgets[category];
    const percentage = (spent / budget) * 100;

    if (percentage >= 100) {
      overBudget.push(
        `<strong>${category}</strong> is ₹${(spent - budget).toFixed(2)} over budget`,
      );
    } else if (percentage >= 80) {
      overBudget.push(
        `<strong>${category}</strong> has only ₹${(budget - spent).toFixed(2)} left (${(100 - percentage).toFixed(1)}%)`,
      );
    }
  });

  if (overBudget.length > 0) {
    alertText.innerHTML = overBudget.join(" • ");
    alertBanner.style.display = "flex";
  } else {
    alertBanner.style.display = "none";
  }
}

function closeBudgetAlert() {
  document.getElementById("budgetAlert").style.display = "none";
}

function openAddBudgetModal() {
  document.getElementById("modalTitle").textContent = "Set Budget";
  document.getElementById("budgetCategory").value = "";
  document.getElementById("budgetAmount").value = "";
  document.getElementById("budgetCategory").disabled = false;
  document.getElementById("budgetModal").classList.add("show");
}

function editBudget(category) {
  document.getElementById("modalTitle").textContent = "Edit Budget";
  document.getElementById("budgetCategory").value = category;
  document.getElementById("budgetAmount").value = budgets[category];
  document.getElementById("budgetCategory").disabled = true;
  document.getElementById("budgetModal").classList.add("show");
}

async function deleteBudget(category) {
  if (!confirm(`Delete ${category} budget?`)) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/budgets/${encodeURIComponent(category)}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    const data = await response.json();
    if (data.success) {
      await loadBudgetsAndStats();
    } else {
      alert("❌ Failed to delete budget: " + data.error);
    }
  } catch (err) {
    console.error("Delete budget error:", err);
    alert("❌ Error connecting to server");
  }
}

function closeModal() {
  document.getElementById("budgetModal").classList.remove("show");
}

async function saveBudget(event) {
  event.preventDefault();

  const category = document.getElementById("budgetCategory").value;
  const amount = parseFloat(document.getElementById("budgetAmount").value);

  if (!category || amount <= 0) {
    alert("Please enter valid values");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/budgets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ category, limit: amount }),
    });

    const data = await response.json();

    if (data.success) {
      closeModal();
      await loadBudgetsAndStats();
    } else {
      alert("❌ Failed to save budget: " + data.error);
    }
  } catch (err) {
    console.error("Save budget error:", err);
    alert("❌ Error connecting to server");
  }
}

init();

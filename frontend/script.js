const API_BASE_URL = "https://finwise-expense-tracker.onrender.com";

async function changePassword() {
  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const message = document.getElementById("pwMessage");

  if (newPassword !== confirmPassword) {
    message.innerText = "❌ Passwords do not match";
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        currentPassword: currentPassword,
        newPassword: newPassword,
      }),
    });

    const data = await response.json();

    if (data.success) {
      message.innerText = "✅ Password updated successfully";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1200);
    } else {
      message.innerText = "❌ " + data.error;
    }
  } catch (error) {
    message.innerText = "❌ AI service unavailable. Please try again.";
  }
}

// ══════════════════════════════════════════════════════════
//                   AUTHENTICATION
// ══════════════════════════════════════════════════════════

// Check if user is logged in
async function checkAuth() {
  const user = localStorage.getItem("user");
  if (!user) {
    window.location.href = "login.html";
    return false;
  }

  // Validate cookie-based session with backend to avoid fake logged-in state.
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      credentials: "include",
    });

    if (!response.ok) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return false;
    }

    const meData = await response.json();
    if (!meData.success || !meData.user) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return false;
    }

    localStorage.setItem("user", JSON.stringify(meData.user));
  } catch (error) {
    console.error("Auth check failed:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "login.html";
    return false;
  }

  // Display username
  const userData = JSON.parse(localStorage.getItem("user"));
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

// Show/hide logout menu
function showLogoutMenu() {
  const menu = document.getElementById("logoutMenu");
  if (menu) {
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  }
}

// Close logout menu when clicking outside
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

// Logout function
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

// ══════════════════════════════════════════════════════════
//                   TRANSACTIONS
// ══════════════════════════════════════════════════════════

const transactions = [];

function renderTransactions() {
  var txList = document.getElementById("txList");
  txList.innerHTML = "";
  for (var i = 0; i < transactions.length; i++) {
    var t = transactions[i];
    var deleteBtn = t.id
      ? `<button class="tx-delete-btn" onclick="deleteTransaction(${t.id})" title="Delete transaction">🗑️</button>`
      : "";

    txList.innerHTML +=
      '<div class="tx-item" data-id="' +
      (t.id || "") +
      '">' +
      '<div class="tx-icon" style="background:' +
      t.bg +
      '">' +
      t.icon +
      "</div>" +
      '<div class="tx-info">' +
      '<div class="tx-name">' +
      t.name +
      "</div>" +
      '<div class="tx-cat">' +
      t.cat +
      "</div>" +
      "</div>" +
      '<div class="tx-right">' +
      '<div class="tx-amount ' +
      t.cls +
      '">' +
      t.amount +
      "</div>" +
      '<div class="tx-date">' +
      t.date +
      "</div>" +
      "</div>" +
      deleteBtn +
      "</div>";
  }
}

var classifierData = {
  food: {
    icon: "🍔",
    tip: "Food is your #1 expense. Try meal-prepping to save up to 40%.",
    keywords: [
      "zomato",
      "swiggy",
      "dominos",
      "mcdonalds",
      "starbucks",
      "food",
      "restaurant",
      "cafe",
      "pizza",
      "burger",
      "kfc",
      "coffee",
      "lunch",
      "dinner",
      "breakfast",
      "grocery",
      "dmart",
      "bigbasket",
      "blinkit",
    ],
  },
  travel: {
    icon: "🚗",
    tip: "Transit is your 2nd biggest spend. A monthly pass saves ₹120.",
    keywords: [
      "uber",
      "ola",
      "rapido",
      "cab",
      "taxi",
      "metro",
      "bus",
      "train",
      "irctc",
      "travel",
      "ride",
      "flight",
      "indigo",
      "airport",
      "redbus",
    ],
  },
  bills: {
    icon: "⚡",
    tip: "Bills are on track. Check for unused subscriptions.",
    keywords: [
      "electricity",
      "bill",
      "water",
      "internet",
      "broadband",
      "wifi",
      "airtel",
      "jio",
      "vodafone",
      "recharge",
      "utility",
      "gas",
      "lpg",
      "maintenance",
    ],
  },
  medicine: {
    icon: "💊",
    tip: "Generic medicines cost 50-80% less than branded ones.",
    keywords: [
      "pharmacy",
      "medicine",
      "medical",
      "apollo",
      "doctor",
      "hospital",
      "clinic",
      "health",
      "tablet",
      "wellness",
      "diagnostic",
      "netmeds",
    ],
  },
  shopping: {
    icon: "🛍️",
    tip: "Discretionary spending is high. Try a no-spend weekend.",
    keywords: [
      "amazon",
      "flipkart",
      "myntra",
      "ajio",
      "shopping",
      "clothes",
      "fashion",
      "shoes",
      "mall",
      "store",
      "meesho",
      "nykaa",
    ],
  },
  entertainment: {
    icon: "🎬",
    tip: "Entertainment looks low this month — good control!",
    keywords: [
      "netflix",
      "prime",
      "hotstar",
      "spotify",
      "movie",
      "cinema",
      "pvr",
      "concert",
      "game",
      "steam",
      "youtube",
      "ott",
      "bookmyshow",
      "inox",
    ],
  },
};

// AI-Powered Classification Function
async function classifyExpense() {
  var desc = document.getElementById("txDesc").value.trim();
  var amount = document.getElementById("txAmount").value;
  var classifyBtn = document.querySelector(".classify-action-btn");

  if (!desc) {
    alert("⚠️ Please enter a transaction description!");
    document.getElementById("txDesc").focus();
    return;
  }

  classifyBtn.disabled = true;
  classifyBtn.innerHTML = "⏳ Classifying...";

  try {
    const response = await fetch(`${API_BASE_URL}/api/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        description: desc,
        amount: amount ? parseFloat(amount) : null,
        save: true,
      }),
    });

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status}`;
      try {
        const errData = await response.json();
        if (errData && errData.error) {
          errorMessage = errData.error;
        }
      } catch (_) {
        // Keep generic message if response isn't JSON.
      }

      if (response.status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        alert("❌ Session expired. Please login again.");
        window.location.href = "login.html";
        return;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (data.success) {
      var category = data.category;
      var confidence = data.confidence;
      var icon = data.icon;
      var tip = data.tip;

      document.getElementById("resultIcon").textContent = icon;
      document.getElementById("resultCategory").textContent = category;

      var descText =
        amount && amount > 0
          ? `₹${amount} classified as ${category} · ${confidence}% confidence`
          : `Classified as ${category} · Confidence: ${confidence}%`;

      if (data.saved) {
        descText += " · ✅ Saved to database";
      }

      document.getElementById("resultDesc").textContent = descText;
      document.getElementById("resultTip").textContent = "💡 " + tip;
      document.getElementById("confBadge").textContent = confidence + "%";

      var resultBox = document.getElementById("classifyResult");
      resultBox.classList.remove("show");
      setTimeout(function () {
        resultBox.classList.add("show");
      }, 10);

      if (data.saved) {
        setTimeout(() => {
          loadTransactionsFromDB();
          loadDashboardStats();
        }, 500);
      }

      console.log("Full API Response:", data);
    } else {
      alert("❌ Classification failed: " + data.error);
    }
  } catch (error) {
    console.error("Classification Error:", error);
    alert(
      "❌ " + (error.message || "AI service unavailable. Try again later."),
    );
  } finally {
    classifyBtn.disabled = false;
    classifyBtn.innerHTML = "⚡ Classify";
  }
}

function closeAlert() {
  var banner = document.getElementById("alertBanner");
  banner.style.opacity = "0";
  banner.style.transform = "translateY(-10px)";
  setTimeout(function () {
    banner.style.display = "none";
  }, 300);
}

function scrollToClassify() {
  document
    .getElementById("classifySection")
    .scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(function () {
    document.getElementById("txDesc").focus();
  }, 500);
}

// Navigation active state management
var navItems = document.querySelectorAll(".nav-item");
for (var i = 0; i < navItems.length; i++) {
  navItems[i].addEventListener("click", function (e) {
    if (this.getAttribute("href") === "#") {
      e.preventDefault();

      for (var j = 0; j < navItems.length; j++) {
        navItems[j].classList.remove("active");
      }
      this.classList.add("active");

      var itemText = this.textContent.trim();
      if (itemText === "Classifier") {
        scrollToClassify();
      }
    }
  });
}

const txDesc = document.getElementById("txDesc");
if (txDesc) {
  txDesc.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      classifyExpense();
    }
  });
}

if (txDesc) {
  txDesc.addEventListener("input", function () {
    if (this.value.length === 0) {
      document.getElementById("classifyResult").classList.remove("show");
    }
  });
}

async function checkAPIConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      credentials: "include",
    });
    const data = await response.json();
    console.log("✅ Flask API Connected:", data);

    loadTransactionsFromDB();
    loadDashboardStats();
  } catch (error) {
    console.error("❌ AI service unavailable. Try again.");
  }
}

/// Load transactions from database
async function loadTransactionsFromDB() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/transactions?limit=20`, {
      credentials: "include",
    });

    const data = await response.json();

    if (data.success) {
      console.log(
        `📊 Loaded ${data.transactions.length} transactions from database`,
      );

      transactions.length = 0;

      if (data.transactions.length > 0) {
        data.transactions.forEach((tx) => {
          const bgColors = {
            Food: "rgba(0,229,195,0.12)",
            Transport: "rgba(79,142,247,0.12)",
            Bills: "rgba(245,166,35,0.12)",
            Healthcare: "rgba(168,85,247,0.12)",
            Shopping: "rgba(255,159,69,0.12)",
            Entertainment: "rgba(249,115,22,0.12)",
            Income: "rgba(34,197,94,0.12)",
            Others: "rgba(148,163,184,0.12)",
          };

          const date = new Date(tx.date);

          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          const dateStr = months[date.getMonth()] + " " + date.getDate();

          transactions.push({
            id: tx.id,
            name: tx.description,
            cat: tx.category,
            icon: tx.icon || "📝",
            bg: bgColors[tx.category] || "rgba(255,255,255,0.1)",
            amount: "-₹" + tx.amount,
            date: dateStr,
            cls: tx.category.toLowerCase(),
          });
        });
      }

      // Update UI
      renderTransactions();

      // Update dashboard stats
      loadDashboardStats();
      loadCategoryBreakdown();
      loadSmartTips();
    }
  } catch (error) {
    console.error("❌ Error loading transactions:", error);
  }
}

// Delete transaction
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
      console.log("✅ Transaction deleted");
      loadTransactionsFromDB();
      loadDashboardStats();
      loadCategoryBreakdown();
      loadQuickStats();
    } else {
      alert("❌ Failed to delete transaction");
    }
  } catch (error) {
    console.error("Error deleting transaction:", error);
    alert("❌ AI service unavailable. Please try again.");
  }
}

async function loadDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats`, {
      credentials: "include",
    });

    const data = await response.json();
    console.log("STATS DATA:", data);

    if (data.success) {
      // Total Spending
      const totalEl = document.getElementById("totalSpending");
      if (totalEl) totalEl.textContent = "₹" + data.total_spending;

      // Transactions
      const txEl = document.getElementById("totalTransactions");
      if (txEl) txEl.textContent = data.transaction_count;

      // Top Category
      const topEl = document.getElementById("topCategory");
      if (topEl) {
        if (data.categories.length > 0) {
          // sort categories by spending
          const sorted = data.categories.sort((a, b) => b.total - a.total);

          topEl.textContent = sorted[0].category;
        } else {
          topEl.textContent = "—";
        }
      }

      // Savings Rate (simple example)
      const savingsEl = document.getElementById("savingsRate");
      if (savingsEl) {
        const savings = Math.max(0, 100 - data.total_spending / 100);
        savingsEl.textContent = Math.round(savings) + "%";
      }
    }
  } catch (error) {
    console.error("Stats load error:", error);
  }
}

async function loadCategoryBreakdown() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats`, {
      credentials: "include",
    });

    const data = await response.json();

    const container = document.getElementById("categoryBreakdown");
    if (!container) return;

    container.innerHTML = "";

    if (!data.categories || data.categories.length === 0) {
      container.innerHTML =
        '<div class="empty-state">No spending data yet</div>';
      return;
    }

    data.categories.forEach((cat) => {
      const colors = {
        Food: "#00e5c3",
        Transport: "#4f8ef7",
        Bills: "#f5a623",
        Healthcare: "#a855f7",
        Shopping: "#ff9f45",
        Entertainment: "#f97316",
        Others: "#94a3b8",
      };

      const row = `
<div class="category-row">
  <div class="cat-info">
    <span class="cat-name">${cat.category}</span>
  </div>

  <div class="cat-bar-wrap">
    <div class="cat-bar"
      style="
        width:${cat.percentage}%;
        background:${colors[cat.category] || "#00e5c3"};
        height:6px;
        border-radius:6px;
      ">
    </div>
  </div>

  <div class="cat-pct">${cat.percentage}%</div>
</div>
`;
      container.innerHTML += row;
    });
  } catch (err) {
    console.error("Category breakdown error:", err);
  }
}
async function loadQuickStats() {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const txRes = await fetch(`${API_BASE_URL}/api/transactions?limit=1000`, {
      credentials: "include",
    });
    const txData = await txRes.json();

    if (!txData.success) return;

    const monthTxs = txData.transactions.filter((tx) =>
      tx.date.startsWith(currentMonth),
    );

    console.log("QuickStats monthTxs:", monthTxs.length, monthTxs);

    if (monthTxs.length === 0) return;

    const totalSpending = monthTxs.reduce((sum, t) => sum + t.amount, 0);
    const avgDay = totalSpending / now.getDate();
    const biggest = Math.max(...monthTxs.map((t) => t.amount));
    const avgTx = totalSpending / monthTxs.length;

    const catCount = {};
    monthTxs.forEach((t) => {
      catCount[t.category] = (catCount[t.category] || 0) + 1;
    });
    const mostFrequent =
      Object.keys(catCount).sort((a, b) => catCount[b] - catCount[a])[0] || "—";

    const dayCount = {};
    monthTxs.forEach((t) => {
      const day = new Date(t.date + "T12:00:00").toLocaleDateString("en-US", {
        weekday: "short",
      });
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    const busiestDay =
      Object.keys(dayCount).sort((a, b) => dayCount[b] - dayCount[a])[0] || "—";

    document.getElementById("qsAvgDay").textContent = "₹" + avgDay.toFixed(0);
    document.getElementById("qsBiggest").textContent = "₹" + biggest.toFixed(0);
    document.getElementById("qsFrequent").textContent = mostFrequent;
    document.getElementById("qsAvgTx").textContent = "₹" + avgTx.toFixed(0);
    document.getElementById("qsBusiestDay").textContent = busiestDay;
    document.getElementById("qsTxCount").textContent = monthTxs.length;
  } catch (err) {
    console.error("Quick stats error:", err);
  }
}

// Run on page load only after server-side auth verification.
async function initializeDashboard() {
  const isAuthed = await checkAuth();
  if (!isAuthed) {
    return;
  }

  renderTransactions();
  checkAPIConnection();
}

initializeDashboard();

// ══════════════════════════════════════════════════════════
//                    CHARTS & GRAPHS
// ══════════════════════════════════════════════════════════

let categoryPieChart = null;
let trendLineChart = null;
let monthlyBarChart = null;

async function loadChartData() {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const statsResponse = await fetch(
      `${API_BASE_URL}/api/stats?month=${currentMonth}`,
      {
        credentials: "include",
      },
    );
    const statsData = await statsResponse.json();

    const txResponse = await fetch(
      `${API_BASE_URL}/api/transactions?limit=1000`,
      {
        credentials: "include",
      },
    );
    const txData = await txResponse.json();

    if (statsData.success && txData.success) {
      createCategoryPieChart(statsData.categories);
      createTrendLineChart(txData.transactions);
      createMonthlyBarChart(txData.transactions);
    }
  } catch (error) {
    console.error("Error loading chart data:", error);
  }
}

function createCategoryPieChart(categories) {
  const ctx = document.getElementById("categoryPieChart");
  if (!ctx) return;

  if (categoryPieChart) {
    categoryPieChart.destroy();
  }

  const validCategories = categories
    .filter((cat) => cat.total > 0)
    .sort((a, b) => b.total - a.total);

  if (validCategories.length === 0) {
    ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
    return;
  }

  const categoryColors = {
    Food: "#00e5c3",
    Transport: "#4f8ef7",
    Healthcare: "#a855f7",
    Bills: "#f5a623",
    Shopping: "#ff9f45",
    Entertainment: "#f97316",
    Income: "#22c55e",
    Others: "#94a3b8",
  };

  categoryPieChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: validCategories.map((cat) => cat.category),
      datasets: [
        {
          data: validCategories.map((cat) => cat.total),
          backgroundColor: validCategories.map(
            (cat) => categoryColors[cat.category] || "#94a3b8",
          ),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            color: "#ffffff",
            fontColor: "#ffffff",
            padding: 20,
            boxWidth: 14,
            font: { size: 12, family: "DM Sans", weight: "500" },
            generateLabels: function (chart) {
              const data = chart.data;
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  fontColor: "#e8edf5",
                  strokeStyle: "transparent",
                  hidden: false,
                  index: i,
                };
              });
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(8,13,26,0.95)",
          titleColor: "#ffffff",
          bodyColor: "#e8edf5",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function (context) {
              return " ₹" + context.parsed.toFixed(2);
            },
          },
        },
      },
    },
  });
}

function createTrendLineChart(transactions) {
  const ctx = document.getElementById("trendLineChart");
  if (!ctx) return;

  if (trendLineChart) {
    trendLineChart.destroy();
  }

  const last7Days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split("T")[0]);
  }

  const dailySpending = last7Days.map((dateStr) => {
    const dayTotal = transactions
      .filter((tx) => {
        const txDate = new Date(tx.date).toISOString().split("T")[0];
        return txDate === dateStr && tx.category !== "Income";
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
    return dayTotal;
  });

  const labels = last7Days.map((dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  });

  trendLineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Daily Spending",
          data: dailySpending,
          borderColor: "#00e5c3",
          backgroundColor: "rgba(0,229,195,0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#00e5c3",
          pointBorderColor: "#080d1a",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(8,13,26,0.95)",
          titleColor: "#e8edf5",
          bodyColor: "#e8edf5",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function (context) {
              return " ₹" + context.parsed.y.toFixed(2);
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "rgba(232,237,245,0.45)",
            font: { size: 11, family: "DM Sans" },
            callback: function (value) {
              return "₹" + value;
            },
          },
          grid: { color: "rgba(255,255,255,0.05)", drawBorder: false },
        },
        x: {
          ticks: {
            color: "rgba(232,237,245,0.45)",
            font: { size: 11, family: "DM Sans" },
          },
          grid: { display: false },
        },
      },
    },
  });
}

function createMonthlyBarChart(transactions) {
  const ctx = document.getElementById("monthlyBarChart");
  if (!ctx) return;

  if (monthlyBarChart) {
    monthlyBarChart.destroy();
  }

  const last6Months = [];
  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    last6Months.push({
      year: date.getFullYear(),
      month: date.getMonth(),
      label: date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
    });
  }

  const monthlySpending = last6Months.map((monthData) => {
    const monthTotal = transactions
      .filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          txDate.getFullYear() === monthData.year &&
          txDate.getMonth() === monthData.month &&
          tx.category !== "Income"
        );
      })
      .reduce((sum, tx) => sum + tx.amount, 0);
    return monthTotal;
  });

  monthlyBarChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: last6Months.map((m) => m.label),
      datasets: [
        {
          label: "Monthly Spending",
          data: monthlySpending,
          backgroundColor: "rgba(0,229,195,0.2)",
          borderColor: "#00e5c3",
          borderWidth: 2,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(8,13,26,0.95)",
          titleColor: "#e8edf5",
          bodyColor: "#e8edf5",
          borderColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function (context) {
              return " ₹" + context.parsed.y.toFixed(2);
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "rgba(232,237,245,0.45)",
            font: { size: 11, family: "DM Sans" },
            callback: function (value) {
              return "₹" + value;
            },
          },
          grid: { color: "rgba(255,255,255,0.05)", drawBorder: false },
        },
        x: {
          ticks: {
            color: "rgba(232,237,245,0.45)",
            font: { size: 11, family: "DM Sans" },
          },
          grid: { display: false },
        },
      },
    },
  });
}

// Load charts on page load
setTimeout(() => {
  loadChartData();
  populateReportMonths();
}, 1000);

// ══════════════════════════════════════════════════════════
//                  MONTHLY REPORTS & PDF EXPORT
// ══════════════════════════════════════════════════════════

function populateReportMonths() {
  const selector = document.getElementById("reportMonthSelector");
  if (!selector) return;

  const months = [];
  const today = new Date();

  for (let i = 0; i < 12; i++) {
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

  selector.addEventListener("change", loadReportPreview);
  loadReportPreview();
}

async function loadReportPreview() {
  const month = document.getElementById("reportMonthSelector").value;
  if (!month) return;

  try {
    const [statsResponse, txResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/stats?month=${month}`, {
        credentials: "include",
      }),
      fetch(`${API_BASE_URL}/api/transactions?limit=1000`, {
        credentials: "include",
      }),
    ]);

    const statsData = await statsResponse.json();
    const txData = await txResponse.json();

    if (statsData.success && txData.success) {
      const [year, monthNum] = month.split("-");
      const monthTransactions = txData.transactions.filter((tx) => {
        const txDate = new Date(tx.date);
        return (
          txDate.getFullYear() === parseInt(year) &&
          txDate.getMonth() + 1 === parseInt(monthNum)
        );
      });

      displayReportPreview(statsData, monthTransactions);
    }
  } catch (error) {
    console.error("Error loading report:", error);
  }
}

function displayReportPreview(stats, transactions) {
  const preview = document.getElementById("reportPreview");
  if (!preview) return;

  preview.style.display = "block";

  document.getElementById("reportTotalSpending").textContent =
    "₹" + stats.total_spending.toFixed(2);
  document.getElementById("reportTxCount").textContent =
    stats.transaction_count;

  const topCategory =
    stats.categories.length > 0
      ? stats.categories.sort((a, b) => b.total - a.total)[0]
      : null;

  document.getElementById("reportTopCategory").textContent = topCategory
    ? `${topCategory.category} (${topCategory.percentage}%)`
    : "-";

  const insights = generateInsights(stats, transactions);
  document.getElementById("reportInsights").innerHTML = insights
    .map((insight) => `<div style="margin-bottom: 8px;">• ${insight}</div>`)
    .join("");
}

function generateInsights(stats, transactions) {
  const insights = [];

  if (stats.transaction_count === 0) {
    insights.push(
      "No transactions recorded this month. Start tracking your expenses!",
    );
    return insights;
  }

  if (stats.categories.length > 0) {
    const topCat = stats.categories.sort((a, b) => b.total - a.total)[0];
    if (topCat.percentage > 40) {
      insights.push(
        `Your ${topCat.category} spending is ${topCat.percentage}% of total - consider reducing it.`,
      );
    } else {
      insights.push(
        `${topCat.category} is your highest expense at ${topCat.percentage}%.`,
      );
    }
  }

  const avgTransaction = stats.total_spending / stats.transaction_count;
  insights.push(`Average transaction: ₹${avgTransaction.toFixed(2)}`);

  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();
  const txPerDay = (stats.transaction_count / daysInMonth).toFixed(1);
  insights.push(`You made ${txPerDay} transactions per day on average.`);

  if (stats.categories.length >= 5) {
    insights.push(
      `Good spending diversity across ${stats.categories.length} categories.`,
    );
  } else if (stats.categories.length <= 2) {
    insights.push(
      `Limited spending diversity. Track expenses in more categories for better insights.`,
    );
  }

  const foodCat = stats.categories.find((c) => c.category === "Food");
  if (foodCat && foodCat.percentage > 35) {
    const potential = (foodCat.total * 0.3).toFixed(2);
    insights.push(
      `💡 Meal prepping could save you up to ₹${potential} on food expenses.`,
    );
  }

  return insights;
}

async function generatePDFReport() {
  const month = document.getElementById("reportMonthSelector").value;
  if (!month) {
    alert("Please select a month");
    return;
  }

  try {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = "⏳ Generating...";
    btn.disabled = true;

    const [statsResponse, txResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/api/stats?month=${month}`, {
        credentials: "include",
      }),
      fetch(`${API_BASE_URL}/api/transactions?limit=1000`, {
        credentials: "include",
      }),
    ]);

    const statsData = await statsResponse.json();
    const txData = await txResponse.json();

    if (!statsData.success || !txData.success) {
      throw new Error("Failed to fetch data");
    }

    const [year, monthNum] = month.split("-");
    const monthTransactions = txData.transactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        txDate.getFullYear() === parseInt(year) &&
        txDate.getMonth() + 1 === parseInt(monthNum) &&
        tx.category !== "Income"
      );
    });

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(0, 229, 195);
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(8, 13, 26);
    doc.setFontSize(24);
    doc.setFont(undefined, "bold");
    doc.text("FinWise", 15, 20);

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    const monthName = new Date(year, monthNum - 1, 1).toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      },
    );
    doc.text(`Monthly Report - ${monthName}`, 15, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Summary", 15, 55);

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    let yPos = 65;

    doc.text(
      `Total Spending: ₹${statsData.total_spending.toFixed(2)}`,
      15,
      yPos,
    );
    yPos += 8;
    doc.text(`Total Transactions: ${statsData.transaction_count}`, 15, yPos);
    yPos += 8;

    if (statsData.categories.length > 0) {
      const topCat = statsData.categories.sort((a, b) => b.total - a.total)[0];
      doc.text(
        `Top Category: ${topCat.category} (${topCat.percentage}%)`,
        15,
        yPos,
      );
      yPos += 8;
    }

    yPos += 10;
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("Category Breakdown", 15, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");

    statsData.categories
      .sort((a, b) => b.total - a.total)
      .forEach((cat) => {
        doc.text(
          `${cat.category}: ₹${cat.total.toFixed(2)} (${cat.percentage}%)`,
          20,
          yPos,
        );
        yPos += 7;
      });

    yPos += 10;
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text("AI Insights", 15, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    const insights = generateInsights(statsData, monthTransactions);
    insights.forEach((insight) => {
      const lines = doc.splitTextToSize(insight, 180);
      lines.forEach((line) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`• ${line}`, 15, yPos);
        yPos += 6;
      });
      yPos += 2;
    });

    if (monthTransactions.length > 0) {
      doc.addPage();
      doc.setFontSize(16);
      doc.setFont(undefined, "bold");
      doc.text("All Transactions", 15, 20);

      const tableData = monthTransactions.map((tx) => [
        new Date(tx.date).toLocaleDateString("en-IN"),
        tx.description,
        tx.category,
        `₹${tx.amount.toFixed(2)}`,
      ]);

      doc.autoTable({
        startY: 30,
        head: [["Date", "Description", "Category", "Amount"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [0, 229, 195],
          textColor: [8, 13, 26],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });
    }

    const pageCount = doc.internal.getNumberOfPages();
    doc.setPage(pageCount);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generated by FinWise AI | ${new Date().toLocaleString("en-IN")}`,
      15,
      doc.internal.pageSize.height - 10,
    );

    const fileName = `FinWise_Report_${monthName.replace(" ", "_")}.pdf`;
    doc.save(fileName);

    btn.innerHTML = originalText;
    btn.disabled = false;

    console.log("✅ PDF generated successfully!");
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("❌ Error generating PDF report");

    const btn = event.target;
    btn.innerHTML = "📥 Download PDF";
    btn.disabled = false;
  }
}

async function loadSmartTips() {
  try {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const [statsRes, txRes, budgetRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/stats?month=${currentMonth}`, {
        credentials: "include",
      }),
      fetch(`${API_BASE_URL}/api/transactions?limit=1000`, {
        credentials: "include",
      }),
      fetch(`${API_BASE_URL}/api/budgets`, { credentials: "include" }),
    ]);

    const statsData = await statsRes.json();
    const txData = await txRes.json();
    const budgetData = await budgetRes.json();

    const tips = [];

    // ── 1. TOP SPENDING CATEGORY TIPS ──
    const categoryTips = {
      Food: {
        icon: "🍱",
        title: "Meal prep this week",
        body: "Food is your #1 expense. Home cooking can cut costs by up to 40%.",
      },
      Transport: {
        icon: "🚍",
        title: "Try a commuter pass",
        body: "Transit is a big spend. A monthly pass can save you ₹100-200.",
      },
      Healthcare: {
        icon: "💊",
        title: "Use generic medicines",
        body: "Generic medicines cost 50-80% less than branded alternatives.",
      },
      Bills: {
        icon: "📡",
        title: "Audit your subscriptions",
        body: "Check for unused OTT or app subscriptions silently draining money.",
      },
      Shopping: {
        icon: "🛍️",
        title: "Try a no-spend weekend",
        body: "Discretionary spending is high. One no-spend weekend saves ₹300+.",
      },
      Entertainment: {
        icon: "🎬",
        title: "Set an entertainment cap",
        body: "Try capping entertainment at ₹500/month to free up savings.",
      },
    };

    if (statsData.success && statsData.categories.length > 0) {
      const sorted = [...statsData.categories].sort(
        (a, b) => b.total - a.total,
      );
      const top = sorted[0];

      if (categoryTips[top.category]) {
        tips.push(categoryTips[top.category]);
      }

      // If top category is over 35% of spending
      if (top.percentage > 35) {
        tips.push({
          icon: "⚠️",
          title: `${top.category} is ${top.percentage}% of budget`,
          body: `Try reducing ${top.category} spending by just 20% to save ₹${(top.total * 0.2).toFixed(0)} this month.`,
        });
      }
    }

    // ── 2. OVER-BUDGET CATEGORY TIPS ──
    if (budgetData.success && budgetData.budgets.length > 0) {
      budgetData.budgets.forEach((b) => {
        const pct = (b.spent / b.limit) * 100;
        if (pct >= 100) {
          tips.push({
            icon: "🚨",
            title: `${b.category} over budget!`,
            body: `You've exceeded your ₹${b.limit} limit by ₹${(b.spent - b.limit).toFixed(0)}. Pause ${b.category} spending for now.`,
          });
        } else if (pct >= 80) {
          tips.push({
            icon: "🔔",
            title: `${b.category} almost at limit`,
            body: `Only ₹${(b.limit - b.spent).toFixed(0)} left in your ${b.category} budget. Spend carefully!`,
          });
        }
      });
    }

    // ── 3. SPENDING TREND TIPS ──
    if (txData.success) {
      const monthTxs = txData.transactions.filter((tx) =>
        tx.date.startsWith(currentMonth),
      );

      // Check if spending is accelerating (more in last 7 days vs first 7 days)
      const first7 = monthTxs
        .filter((tx) => {
          const day = new Date(tx.date + "T12:00:00").getDate();
          return day <= 7;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const last7 = monthTxs
        .filter((tx) => {
          const day = new Date(tx.date + "T12:00:00").getDate();
          return day >= now.getDate() - 6;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      if (last7 > first7 * 1.5 && last7 > 0) {
        tips.push({
          icon: "📈",
          title: "Spending is accelerating",
          body: `You've spent ₹${last7.toFixed(0)} in the last 7 days vs ₹${first7.toFixed(0)} in the first 7. Slow down!`,
        });
      } else if (monthTxs.length > 0 && last7 < first7 * 0.5) {
        tips.push({
          icon: "✅",
          title: "Great spending control!",
          body: `Your spending has slowed down this week. Keep it up to finish the month strong.`,
        });
      }

      // High transaction frequency tip
      if (monthTxs.length > 20) {
        tips.push({
          icon: "🔁",
          title: "Too many small transactions",
          body: `You've made ${monthTxs.length} transactions this month. Try batching purchases to stay in control.`,
        });
      }
    }

    // ── 4. GENERIC ROTATING TIPS (always show if < 4 tips) ──
    const genericTips = [
      {
        icon: "🎯",
        title: "Set a no-spend day",
        body: "Try one day a week with zero spending. It adds up to big savings monthly.",
      },
      {
        icon: "💰",
        title: "Pay yourself first",
        body: "Transfer savings the moment you receive income, before spending anything.",
      },
      {
        icon: "📱",
        title: "Review subscriptions",
        body: "Check for unused OTT or app subscriptions — they silently drain ₹200-500/month.",
      },
      {
        icon: "🏦",
        title: "Build an emergency fund",
        body: "Aim for 3 months of expenses saved. Start with just ₹500/month.",
      },
      {
        icon: "📊",
        title: "Track daily spending",
        body: "People who track daily spend 20% less on average. Keep it up!",
      },
      {
        icon: "🛒",
        title: "Shop with a list",
        body: "Impulse purchases account for 40% of overspending. Always shop with a plan.",
      },
    ];

    // Shuffle generics and fill up to 4 total tips
    const shuffled = genericTips.sort(() => Math.random() - 0.5);
    let i = 0;
    while (tips.length < 4 && i < shuffled.length) {
      tips.push(shuffled[i]);
      i++;
    }

    // ── RENDER ──
    const container = document.querySelector(".tips-list");
    if (!container) return;

    container.innerHTML = tips
      .slice(0, 4)
      .map(
        (tip) => `
      <div class="tip-card">
        <div class="tip-icon">${tip.icon}</div>
        <div>
          <div class="tip-title">${tip.title}</div>
          <div class="tip-body">${tip.body}</div>
        </div>
      </div>
    `,
      )
      .join("");
  } catch (err) {
    console.error("Smart tips error:", err);
  }
}

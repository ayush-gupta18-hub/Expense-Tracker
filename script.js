const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const errorDisplay = document.getElementById("error");
const categorySummaryList = document.getElementById("category-summary");

const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");



let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

/* ---------- Utility Functions ---------- */

function saveToLocalStorage() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function calculateTotal(data) {
  return data.reduce((sum, e) => sum + e.amount, 0);
}

function showError(message) {
  errorDisplay.textContent = message;
}

function clearError() {
  errorDisplay.textContent = "";
}

/* ---------- Validation ---------- */

function validateInput(title, amount, category, date) {
  if (!title) {
    showError("Expense title cannot be empty.");
    return false;
  }

  if (isNaN(amount) || amount <= 0) {
    showError("Amount must be a positive number.");
    return false;
  }

  if (!category) {
    showError("Please select a category.");
    return false;
  }

  if (!date) {
    showError("Please select a valid date.");
    return false;
  }

  clearError();
  return true;
}

/* ---------- ANALYTICS ---------- */

 function renderCategorySummary(data) {
  const categoryTotals = {};

  data.forEach(expense => {
    if (!categoryTotals[expense.category]) {
      categoryTotals[expense.category] = 0;
    }
    categoryTotals[expense.category] += expense.amount;
  });

  categorySummaryList.innerHTML = "";

  if (Object.keys(categoryTotals).length === 0) {
    categorySummaryList.innerHTML = "<li>No data</li>";
    return;
  }

  for (const category in categoryTotals) {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${category}</span>
      <span>₹${categoryTotals[category]}</span>
    `;
    categorySummaryList.appendChild(li);
  }
}

/* ---------- Rendering ---------- */

function renderExpenses(data) {
  list.innerHTML = "";

  if (data.length === 0) {
    list.innerHTML = "<li>No expenses found</li>";
    totalDisplay.textContent = 0;
    return;
  }

  data.forEach((expense, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>
        ${expense.title} | ${expense.category} | ₹${expense.amount} | ${expense.date}
      </span>
      <button data-index="${index}">X</button>
    `;

    li.querySelector("button").addEventListener("click", () => {
      deleteExpense(index);
    });

    list.appendChild(li);
  });

  totalDisplay.textContent = calculateTotal(data);
  renderCategorySummary(data);
}

/* ---------- CRUD Operations ---------- */

function deleteExpense(index) {
  if (!confirm("Are you sure you want to delete this expense?")) return;

  expenses.splice(index, 1);
  saveToLocalStorage();
  applyFilters();
}

/* ---------- Form Handling ---------- */

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!validateInput(title, amount, category, date)) return;

  const expense = { title, amount, category, date };
  expenses.push(expense);

  saveToLocalStorage();
  form.reset();
  applyFilters();
});

/* ---------- Filtering & Sorting ---------- */

function applyFilters() {
  let filtered = [...expenses];

  const query = searchInput.value.toLowerCase();
  if (query) {
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(query)
    );
  }

  if (sortSelect.value === "amount") {
    filtered.sort((a, b) => b.amount - a.amount);
  } else {
    filtered.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }

  renderExpenses(filtered);
}

searchInput.addEventListener("input", applyFilters);
sortSelect.addEventListener("change", applyFilters);

/* ---------- Initial Load ---------- */
applyFilters();



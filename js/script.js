const VALID_USERNAME = "admin";
const VALID_PASSWORD = "password";

const loginScreen = document.getElementById("login-screen");
const dashboardScreen = document.getElementById("dashboard-screen");
const entryFormScreen = document.getElementById("entry-form-screen");

const loginBtn = document.getElementById("login-btn");
const addBtn = document.getElementById("add-btn");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");

const filterInput = document.getElementById("filter-input");
const entryList = document.getElementById("entry-list");

const entryForm = document.getElementById("entry-form");
const categoryInput = document.getElementById("category");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const notesInput = document.getElementById("notes");

// State
let entries = JSON.parse(localStorage.getItem("budgetEntries")) || [];
let editingIndex = null;

// Event Listeners
loginBtn.addEventListener("click", handleLogin);
addBtn.addEventListener("click", () => showScreen(entryFormScreen));
saveBtn.addEventListener("click", saveEntry);
cancelBtn.addEventListener("click", () => showScreen(dashboardScreen));
filterInput.addEventListener("input", filterEntries);

document.getElementById("login-form").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleLogin();
    }
});

function clearForm() {
    categoryInput.value = "";
    amountInput.value = "";
    dateInput.value = "";
    notesInput.value = "";
}

addBtn.addEventListener("click", () => {
    clearForm();
    showScreen(entryFormScreen);
});


function handleLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        const expirationTime = new Date().getTime() + 5 * 60 * 1000; // 5 minutes
        localStorage.setItem("isLoggedIn", JSON.stringify({ isLoggedIn: true, expiresAt: expirationTime }));
        showScreen(dashboardScreen);
        renderEntries();
    } else {
        alert("Invalid username or password");
    }
}

function showScreen(screen) {
    loginScreen.classList.add("d-none");
    dashboardScreen.classList.add("d-none");
    entryFormScreen.classList.add("d-none");

    screen.classList.remove("d-none");
}

function saveEntry() {
    const category = categoryInput.value;
    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;
    const notes = notesInput.value;

    if (!category || isNaN(amount) || !date) {
        alert("Please fill in all fields.");
        return;
    }

    const entry = { category, amount, date, notes };

    if (editingIndex !== null) {
        entries[editingIndex] = entry;
        editingIndex = null;
    } else {
        entries.push(entry);
    }

    localStorage.setItem("budgetEntries", JSON.stringify(entries));
    renderEntries();
    showScreen(dashboardScreen);
    entryForm.reset();
}

function calculateTotal(entries) {
    return entries.reduce((total, entry) => total + entry.amount, 0).toFixed(2);
}

function renderEntries(filteredEntries = entries) {
    entryList.innerHTML = "";
    filteredEntries.forEach((entry, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <span>${entry.category} - $${entry.amount.toFixed(2)} (${entry.date})</span>
            <div>
                <button class="btn btn-sm btn-info mr-2" onclick="viewEntry(${index})" data-toggle="modal" data-target="#viewModal">View</button>
                <button class="btn btn-sm btn-warning mr-2" onclick="editEntry(${index})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEntry(${index})">Delete</button>
            </div>
        `;
        entryList.appendChild(li);
    });

    const totalSpent = calculateTotal(filteredEntries);
    document.getElementById("totalSpent").textContent = totalSpent;
}


function viewEntry(index) {
    const entry = entries[index];
    document.getElementById("viewCategory").textContent = entry.category;
    document.getElementById("viewAmount").textContent = entry.amount.toFixed(2);
    document.getElementById("viewDate").textContent = entry.date;
    document.getElementById("viewNotes").textContent = entry.notes;
}


function editEntry(index) {
    const entry = entries[index];
    categoryInput.value = entry.category;
    amountInput.value = entry.amount;
    dateInput.value = entry.date;
    notesInput.value = entry.notes;

    editingIndex = index;
    showScreen(entryFormScreen);
}

function deleteEntry(index) {
    entries.splice(index, 1);
    localStorage.setItem("budgetEntries", JSON.stringify(entries));
    renderEntries();
}

function filterEntries() {
    const filter = filterInput.value.toLowerCase();
    const filteredEntries = entries.filter(entry =>
        entry.category.toLowerCase().includes(filter)
    );
    renderEntries(filteredEntries);
    entryList.innerHTML = "";
    filteredEntries.forEach((entry, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <span>${entry.category} - $${entry.amount.toFixed(2)} (${entry.date})</span>
            <div>
                <button class="btn btn-sm btn-info mr-2" onclick="viewEntry(${index})" data-toggle="modal" data-target="#viewModal">View</button>
                <button class="btn btn-sm btn-warning mr-2" onclick="editEntry(${index})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEntry(${index})">Delete</button>
            </div>
        `;
        entryList.appendChild(li);
    });
}

function checkLoginStatus() {
    const loginData = JSON.parse(localStorage.getItem("isLoggedIn"));
    const currentTime = new Date().getTime();

    if (loginData && loginData.isLoggedIn && loginData.expiresAt > currentTime) {
        showScreen(dashboardScreen);
        renderEntries();
    } else {
        localStorage.removeItem("isLoggedIn");
        showScreen(loginScreen);
    }
}

window.onload = checkLoginStatus;

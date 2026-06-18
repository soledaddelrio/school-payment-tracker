const SHEET_ID = "1iZ8KfdXtSHWQagoyJvR8Kl2qDO616zngKhYwMCQ5_0E";

async function fetchSheet(sheetName) {
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

const response = await fetch(url);
const text = await response.text();

const json = JSON.parse(text.substring(47, text.length - 2));
const rows = json.table.rows || [];

return rows.map(row =>
    row.c.map(cell => cell ? cell.v : "")
);

}

function formatMoney(value) {

if (value === undefined || value === null || value === "") {
    return "$0";
}

const number = parseFloat(
    String(value).replace(/[$,]/g, "")
);

if (Number.isNaN(number)) {
    return "$0";
}

return number.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
});

}

function setText(id, value) {
const element = document.getElementById(id);

if (element) {
    element.textContent = value;
}

}

async function loadDashboard() {

const dashboardData = await fetchSheet("DashboardData");
const todoData = await fetchSheet("Todo");
const historyData = await fetchSheet("History");

const metrics = {};

dashboardData.forEach(row => {

    if (row[0]) {
        metrics[String(row[0]).trim()] = row[1];
    }

});

setText("familyName", metrics.FamilyName || "Family");
setText("schoolYear", metrics.SchoolYear || "");
setText("totalDue", formatMoney(metrics.TotalDue));
setText("totalPaid", formatMoney(metrics.TotalPaid));
setText("remaining", formatMoney(metrics.Remaining));
setText("paymentsLeft", metrics.PaymentsLeft || "0");

const todoList = document.getElementById("todoList");

if (todoList) {

    todoList.innerHTML = "";

    todoData.forEach((row, index) => {

        if (
            index === 0 &&
            String(row[0]).trim().toLowerCase() === "task"
        ) {
            return;
        }

        if (!row[0]) {
            return;
        }

        const item = document.createElement("div");

        item.className = "todo-item";

        item.innerHTML =
            `<span class="todo-box"></span>${row[0]}`;

        todoList.appendChild(item);

    });

}

const historyBody =
    document.getElementById("historyBody");

if (historyBody) {

    historyBody.innerHTML = "";

    historyData.forEach((row, index) => {

        if (
            index === 0 &&
            String(row[0]).trim().toLowerCase() === "year"
        ) {
            return;
        }

        if (!row[0]) {
            return;
        }

        const status = row[4] || "";

        const tr =
            document.createElement("tr");

        if (
            String(row[0]) ===
            String(metrics.SchoolYear)
        ) {
            tr.className = "current-year";
        }

        tr.innerHTML = `
            <td>${row[0]}</td>
            <td>${formatMoney(row[1])}</td>
            <td>${formatMoney(row[2])}</td>
            <td>${formatMoney(row[3])}</td>
            <td class="${status === "Paid" ? "history-paid" : ""}">
                ${status}
            </td>
        `;

        historyBody.appendChild(tr);

    });

}

}

document.addEventListener(
"DOMContentLoaded",
() => {

    loadDashboard().catch(error => {
        console.error(
            "DASHBOARD ERROR:",
            error
        );
    });

}

);

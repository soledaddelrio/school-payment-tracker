const SHEET_ID = "1iZ8KfdXtSHWQagoyJvR8Kl2qDO616zngKhYwMCQ5_0E";

async function fetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
  const response = await fetch(url);
  const text = await response.text();

  const json = JSON.parse(text.substring(47, text.length - 2));
  const rows = json.table.rows;

  return rows.map(row =>
    row.c.map(cell => cell ? cell.v : "")
  );
}

async function loadDashboard() {
  const dashboardData = await fetchSheet("DashboardData");
  const todoData = await fetchSheet("Todo");
  const historyData = await fetchSheet("History");

  const metrics = {};
  dashboardData.slice(1).forEach(row => {
    metrics[row[0]] = row[1];
  });

  console.log(metrics);
  
  document.getElementById("familyName").textContent = metrics.FamilyName;
  document.getElementById("schoolYear").textContent = metrics.SchoolYear;
  document.getElementById("totalDue").textContent = formatMoney(metrics.TotalDue);
  document.getElementById("totalPaid").textContent = formatMoney(metrics.TotalPaid);
  document.getElementById("remaining").textContent = formatMoney(metrics.Remaining);
  document.getElementById("paymentsLeft").textContent = metrics.PaymentsLeft;

  const todoList = document.getElementById("todoList");
  todoList.innerHTML = "";

  todoData.slice(1).forEach(row => {
    const item = document.createElement("div");
    item.className = "todo-item";
    item.innerHTML = `<span class="todo-box"></span>${row[0]}`;
    todoList.appendChild(item);
  });

  const historyBody = document.getElementById("historyBody");
  historyBody.innerHTML = "";

  historyData.slice(1).forEach(row => {
    const tr = document.createElement("tr");

    if (row[0] === metrics.SchoolYear) {
      tr.className = "current-year";
    }

    tr.innerHTML = `
      <td>${row[0]}</td>
      <td>${formatMoney(row[1])}</td>
      <td>${formatMoney(row[2])}</td>
      <td>${formatMoney(row[3])}</td>
      <td class="${row[4] === "Paid" ? "history-paid" : ""}">${row[4]}</td>
    `;

    historyBody.appendChild(tr);
  });
}

function formatMoney(value) {
  const number = Number(value);
  return number.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

loadDashboard();

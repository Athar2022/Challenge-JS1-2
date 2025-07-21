let employees = [];
let trash = [];

const employeeForm = document.getElementById("employeeForm");
const employeeTableBody = document.querySelector("#employeeTableBody");
const trashTableBody = document.querySelector("#trashTableBody");
const toggleTrashBtn = document.getElementById("toggleTrashBtn");
const counter = document.getElementsByClassName("counter")[0];
const trashSection = document.querySelector("#trashSection");

// Form validation regex
const nameRegex = /^[A-Za-z\s]+$/;
const roleRegex = /^[A-Za-z\s]+$/;

// Performance measurement
console.time("Employee Management App");

// Update counter
function updateCounter() {
  counter.textContent = `Employees: ${employees.length} | Trash: ${trash.length}`;
}

// Validate form inputs
function validateForm(name, role, status) {
  const nameError = document.getElementById("nameError");
  const roleError = document.getElementById("roleError");
  const statusError = document.getElementById("statusError");

  let isValid = true;

  // Reset error messages
  nameError.style.display = "none";
  roleError.style.display = "none";
  statusError.style.display = "none";

  if (!name || !nameRegex.test(name)) {
    nameError.style.display = "block";
    isValid = false;
  }

  if (!role || !roleRegex.test(role)) {
    roleError.style.display = "block";
    isValid = false;
  }

  if (!status) {
    statusError.style.display = "block";
    isValid = false;
  }

  return isValid;
}

// Render employee table
function renderEmployees() {
  employeeTableBody.innerHTML = "";
  employees.forEach((employee, index) => {
    const row = document.createElement("tr");
    row.setAttribute("data-id", index);

    // Using innerHTML for structured content
    row.innerHTML = `
                    <td>${employee.name}</td>
                    <td>${employee.role}</td>
                    <td><span class="status-badge status-${employee.status
                      .toLowerCase()
                      .replace(" ", "")}">${employee.status}</span></td>
                    <td>
                        <button class="action-btn edit-btn" onclick="editEmployee(${index})">Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteEmployee(${index})">Delete</button>
                    </td>
                `;

    employeeTableBody.appendChild(row);
  });
  updateCounter();
}

// Render trash table
function renderTrash() {
  trashTableBody.innerHTML = "";
  trash.forEach((employee, index) => {
    const row = document.createElement("tr");
    row.setAttribute("data-id", index);

    row.innerHTML = `
                    <td>${employee.name}</td>
                    <td>${employee.role}</td>
                    <td><span class="status-badge status-${employee.status
                      .toLowerCase()
                      .replace(" ", "")}">${employee.status}</span></td>
                    <td>
                        <button class="action-btn restore-btn" onclick="restoreEmployee(${index})">Restore</button>
                        <button class="action-btn perm-delete-btn" onclick="permanentlyDeleteEmployee(${index})">Permanently Delete</button>
                    </td>
                `;

    trashTableBody.appendChild(row);
  });
  updateCounter();
}

// Add employee
employeeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const role = document.getElementById("role").value.trim();
  const status = document.getElementById("status").value;

  if (validateForm(name, role, status)) {
    employees.push({ name, role, status });
    renderEmployees();
    employeeForm.reset();
  }
});

// Edit employee
window.editEmployee = function (index) {
  const employee = employees[index];
  const name = window.prompt("Enter new name:", employee.name);
  const role = window.prompt("Enter new role:", employee.role);
  const status = window.prompt(
    "Enter new status (Active/On Leave/Terminated):",
    employee.status
  );

  if (name && role && status && validateForm(name, role, status)) {
    employees[index] = { name, role, status };
    renderEmployees();
  } else {
    alert("Invalid input. Please try again.");
  }
};

// Delete employee (soft delete)
window.deleteEmployee = function (index) {
  if (confirm("Are you sure you want to move this employee to trash?")) {
    const employee = employees.splice(index, 1)[0];
    trash.push(employee);
    renderEmployees();
    renderTrash();
  }
};

// Restore employee
window.restoreEmployee = function (index) {
  const employee = trash.splice(index, 1)[0];
  employees.push(employee);
  renderEmployees();
  renderTrash();
};

// Permanently delete employee
window.permanentlyDeleteEmployee = function (index) {
  if (confirm("Are you sure you want to permanently delete this employee?")) {
    trash.splice(index, 1);
    renderTrash();
  }
};

// Toggle trash section
toggleTrashBtn.addEventListener("click", () => {
  const isHidden = trashSection.style.display === "none";
  trashSection.style.display = isHidden ? "block" : "none";
  toggleTrashBtn.textContent = isHidden ? "Hide Trash" : "Show Trash";
});

// Initial render
renderEmployees();
renderTrash();

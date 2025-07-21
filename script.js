let employees = [];
let trash = [];
let currentEmployeeIndexForBonus = null;

// DOM elements
const employeeForm = document.getElementById("employeeForm");
const employeeTableBody = document.querySelector("#employeeTableBody");
const trashTableBody = document.querySelector("#trashTableBody");
const toggleTrashBtn = document.getElementById("toggleTrashBtn");
const counter = document.getElementById("counter");
const trashSection = document.querySelector("#trashSection");
const totalPayrollElement = document.getElementById("totalPayroll");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const roleFilter = document.getElementById("roleFilter");
const statusFilter = document.getElementById("statusFilter");
const minSalary = document.getElementById("minSalary");
const maxSalary = document.getElementById("maxSalary");
const minBonus = document.getElementById("minBonus");
const maxBonus = document.getElementById("maxBonus");
const applyFilters = document.getElementById("applyFilters");
const resetFilters = document.getElementById("resetFilters");
const salaryThreshold = document.getElementById("salaryThreshold");
const deleteLowSalaryBtn = document.getElementById("deleteLowSalaryBtn");
const bonusModal = document.getElementById("bonusModal");
const closeModal = document.querySelector(".close");
const bonusPercentage = document.getElementById("bonusPercentage");
const applyBonusBtn = document.getElementById("applyBonusBtn");
const bonusError = document.getElementById("bonusError");

// Form validation regex
const nameRegex = /^[A-Za-z\s]+$/;
const roleRegex = /^[A-Za-z\s]+$/;
const salaryRegex = /^\d+$/;

// Initialize the app
function init() {
  updateCounter();
  updateTotalPayroll();
  renderEmployees();
  renderTrash();
  setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
  employeeForm.addEventListener("submit", handleFormSubmit);
  toggleTrashBtn.addEventListener("click", toggleTrashSection);
  searchBtn.addEventListener("click", applySearch);
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") applySearch();
  });
  applyFilters.addEventListener("click", applyAllFilters);
  resetFilters.addEventListener("click", resetAllFilters);
  deleteLowSalaryBtn.addEventListener("click", deleteEmployeesBelowThreshold);
  closeModal.addEventListener("click", () => bonusModal.style.display = "none");
  applyBonusBtn.addEventListener("click", applyBonus);
  window.addEventListener("click", (e) => {
    if (e.target === bonusModal) bonusModal.style.display = "none";
  });
}

// Update counter
function updateCounter() {
  counter.textContent = `Employees: ${employees.length} | Trash: ${trash.length}`;
}

// Update total payroll
function updateTotalPayroll() {
  const total = employees.reduce((sum, employee) => sum + (employee.salary || 0), 0);
  totalPayrollElement.textContent = total.toLocaleString();
}

// Validate form inputs
function validateForm(name, role, salary, status) {
  const nameError = document.getElementById("nameError");
  const roleError = document.getElementById("roleError");
  const salaryError = document.getElementById("salaryError");
  const statusError = document.getElementById("statusError");

  let isValid = true;

  // Reset error messages
  nameError.style.display = "none";
  roleError.style.display = "none";
  salaryError.style.display = "none";
  statusError.style.display = "none";

  if (!name || !nameRegex.test(name)) {
    nameError.style.display = "block";
    isValid = false;
  }

  if (!role || !roleRegex.test(role)) {
    roleError.style.display = "block";
    isValid = false;
  }

  if (!salary || !salaryRegex.test(salary) || parseInt(salary) <= 0) {
    salaryError.style.display = "block";
    isValid = false;
  }

  if (!status) {
    statusError.style.display = "block";
    isValid = false;
  }

  return isValid;
}

// Render employee table
function renderEmployees(employeesToRender = employees) {
  employeeTableBody.innerHTML = "";
  
  // Update role filter options
  updateRoleFilterOptions();
  
  employeesToRender.forEach((employee, index) => {
    const row = document.createElement("tr");
    row.setAttribute("data-id", index);

    // Create name cell with badges if applicable
    const nameCell = document.createElement("td");
    nameCell.textContent = employee.name;
    
    if (employee.salary >= 100000) {
      const highSalaryBadge = document.createElement("span");
      highSalaryBadge.className = "high-salary-badge";
      highSalaryBadge.textContent = "High Salary";
      nameCell.appendChild(highSalaryBadge);
    }
    
    if (employee.bonus && employee.bonus > 0) {
      const bonusBadge = document.createElement("span");
      bonusBadge.className = "has-bonus-badge";
      bonusBadge.textContent = "Bonus";
      nameCell.appendChild(bonusBadge);
    }

    // Calculate bonus amount if percentage exists
    const bonusAmount = employee.bonus ? (employee.salary * employee.bonus / 100) : 0;

    row.innerHTML = `
      <td></td>
      <td>${employee.role}</td>
      <td>${employee.salary.toLocaleString()} R</td>
      <td>${bonusAmount.toLocaleString()} R</td>
      <td><span class="status-badge status-${employee.status.toLowerCase().replace(" ", "")}">${employee.status}</span></td>
      <td>
        <button class="action-btn edit-btn" onclick="editEmployee(${index})">Edit</button>
        <button class="action-btn bonus-btn" onclick="openBonusModal(${index})">Bonus</button>
        <button class="action-btn delete-btn" onclick="deleteEmployee(${index})">Delete</button>
      </td>
    `;

    // Replace the empty name cell with our constructed one
    row.replaceChild(nameCell, row.cells[0]);
    
    employeeTableBody.appendChild(row);
  });
  
  updateCounter();
  updateTotalPayroll();
}

// Update role filter options
function updateRoleFilterOptions() {
  const currentRoles = [...new Set(employees.map(emp => emp.role))];
  const currentOptions = Array.from(roleFilter.options).map(opt => opt.value);
  
  // Add new roles that aren't already in the filter
  currentRoles.forEach(role => {
    if (!currentOptions.includes(role)) {
      const option = document.createElement("option");
      option.value = role;
      option.textContent = role;
      roleFilter.appendChild(option);
    }
  });
}

// Render trash table
function renderTrash() {
  trashTableBody.innerHTML = "";
  trash.forEach((employee, index) => {
    const row = document.createElement("tr");
    row.setAttribute("data-id", index);

    const bonusAmount = employee.bonus ? (employee.salary * employee.bonus / 100) : 0;

    row.innerHTML = `
      <td>${employee.name}</td>
      <td>${employee.role}</td>
      <td>${employee.salary.toLocaleString()} R</td>
      <td>${bonusAmount.toLocaleString()} R</td>
      <td><span class="status-badge status-${employee.status.toLowerCase().replace(" ", "")}">${employee.status}</span></td>
      <td>
        <button class="action-btn restore-btn" onclick="restoreEmployee(${index})">Restore</button>
        <button class="action-btn perm-delete-btn" onclick="permanentlyDeleteEmployee(${index})">Permanently Delete</button>
      </td>
    `;

    trashTableBody.appendChild(row);
  });
}

// Handle form submission
function handleFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const role = document.getElementById("role").value.trim();
  const salary = document.getElementById("salary").value.trim();
  const status = document.getElementById("status").value;

  if (validateForm(name, role, salary, status)) {
    employees.push({ 
      name, 
      role, 
      salary: parseInt(salary), 
      status,
      bonus: 0 // Initialize bonus as 0
    });
    renderEmployees();
    employeeForm.reset();
  }
}

// Edit employee
window.editEmployee = function(index) {
  const employee = employees[index];
  const name = window.prompt("Enter new name:", employee.name);
  const role = window.prompt("Enter new role:", employee.role);
  const salary = window.prompt("Enter new salary:", employee.salary);
  const status = window.prompt(
    "Enter new status (Active/On Leave/Terminated):",
    employee.status
  );

  if (name && role && salary && status && validateForm(name, role, salary, status)) {
    employees[index] = { 
      ...employees[index],
      name, 
      role, 
      salary: parseInt(salary), 
      status 
    };
    renderEmployees();
  } else {
    alert("Invalid input. Please try again.");
  }
};

// Delete employee (soft delete)
window.deleteEmployee = function(index) {
  if (confirm("Are you sure you want to move this employee to trash?")) {
    const employee = employees.splice(index, 1)[0];
    trash.push(employee);
    renderEmployees();
    renderTrash();
  }
};

// Restore employee
window.restoreEmployee = function(index) {
  const employee = trash.splice(index, 1)[0];
  employees.push(employee);
  renderEmployees();
  renderTrash();
};

// Permanently delete employee
window.permanentlyDeleteEmployee = function(index) {
  if (confirm("Are you sure you want to permanently delete this employee?")) {
    trash.splice(index, 1);
    renderTrash();
  }
};

// Toggle trash section
function toggleTrashSection() {
  const isHidden = trashSection.style.display === "none";
  trashSection.style.display = isHidden ? "block" : "none";
  toggleTrashBtn.textContent = isHidden ? "Hide Trash" : "Show Trash";
}

// Open bonus modal
window.openBonusModal = function(index) {
  currentEmployeeIndexForBonus = index;
  bonusPercentage.value = employees[index].bonus || "";
  bonusModal.style.display = "block";
};

// Apply bonus
function applyBonus() {
  const percentage = parseInt(bonusPercentage.value);
  
  if (isNaN(percentage) || percentage < 0 || percentage > 100) {
    bonusError.textContent = "Please enter a valid percentage (0-100)";
    bonusError.style.display = "block";
    return;
  }
  
  bonusError.style.display = "none";
  employees[currentEmployeeIndexForBonus].bonus = percentage;
  bonusModal.style.display = "none";
  renderEmployees();
}

// Apply search
function applySearch() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (!searchTerm) {
    renderEmployees();
    return;
  }
  
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm)
  );
  renderEmployees(filteredEmployees);
}

// Apply all filters
function applyAllFilters() {
  const selectedRole = roleFilter.value;
  const selectedStatus = statusFilter.value;
  const minSalaryValue = minSalary.value ? parseInt(minSalary.value) : null;
  const maxSalaryValue = maxSalary.value ? parseInt(maxSalary.value) : null;
  const minBonusValue = minBonus.value ? parseInt(minBonus.value) : null;
  const maxBonusValue = maxBonus.value ? parseInt(maxBonus.value) : null;

  const filteredEmployees = employees.filter(emp => {
    // Filter by role
    if (selectedRole && emp.role !== selectedRole) return false;
    
    // Filter by status
    if (selectedStatus && emp.status !== selectedStatus) return false;
    
    // Filter by salary range
    if (minSalaryValue !== null && emp.salary < minSalaryValue) return false;
    if (maxSalaryValue !== null && emp.salary > maxSalaryValue) return false;
    
    // Filter by bonus range
    const bonusAmount = emp.bonus ? (emp.salary * emp.bonus / 100) : 0;
    if (minBonusValue !== null && bonusAmount < minBonusValue) return false;
    if (maxBonusValue !== null && bonusAmount > maxBonusValue) return false;
    
    return true;
  });

  renderEmployees(filteredEmployees);
}

// Reset all filters
function resetAllFilters() {
  searchInput.value = "";
  roleFilter.value = "";
  statusFilter.value = "";
  minSalary.value = "";
  maxSalary.value = "";
  minBonus.value = "";
  maxBonus.value = "";
  renderEmployees();
}

// Delete employees below salary threshold
function deleteEmployeesBelowThreshold() {
  const threshold = parseInt(salaryThreshold.value);
  if (isNaN (threshold)){
    alert("Please enter a valid salary threshold");
    return;
  }
  

  if (confirm(`Are you sure you want to delete all employees with salary ≤ ${threshold} R?`)) {
    const employeesToDelete = employees.filter(emp => emp.salary <= threshold);
    employeesToDelete.forEach(emp => {
      const index = employees.findIndex(e => e === emp);
      if (index !== -1) {
        const employee = employees.splice(index, 1)[0];
        trash.push(employee);
      }
    });
    renderEmployees();
    renderTrash();
  }
}

// Initialize the application
init();
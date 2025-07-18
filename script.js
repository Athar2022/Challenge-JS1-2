document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Selectors ---
    // 1. getElementById (for unique elements)
    const employeeForm = document.getElementById('employeeForm');
    const employeeNameInput = document.getElementById('employeeName');
    const employeeRoleInput = document.getElementById('employeeRole');
    const employeeStatusInput = document.getElementById('employeeStatus');
    const employeeTableBody = document.querySelector('#employeeTable tbody'); // 2. querySelector (for first matching element)
    const trashTableBody = document.querySelector('#trashTable tbody');
    const toggleTrashBtn = document.getElementById('toggleTrashBtn');
    const trashBinSection = document.getElementById('trashBinSection');
    const activeEmployeeCountSpan = document.getElementById('activeEmployeeCount');
    const trashCountSpan = document.getElementById('trashCount');
    const trashBinCountDisplay = document.getElementById('trashBinCountDisplay');
    const noEmployeesMessage = document.getElementById('noEmployeesMessage');
    const noTrashMessage = document.getElementById('noTrashMessage');
    const emptyTrashBtn = document.getElementById('emptyTrashBtn');

    // Error message elements
    const nameError = document.getElementById('nameError');
    const roleError = document.getElementById('roleError');
    const statusError = document.getElementById('statusError');

    // Global arrays to store employees (for simplicity, not persistent storage)
    let employees = []; // Active employees
    let trash = [];     // Soft-deleted employees

    // --- Utility Functions ---

    /**
     * Updates the counts displayed for active and trash employees.
     */
    function updateEmployeeCounts() {
        activeEmployeeCountSpan.textContent = employees.length; // Using textContent for plain text
        trashCountSpan.textContent = trash.length;
        trashBinCountDisplay.textContent = trash.length;

        if (employees.length === 0) {
            noEmployeesMessage.style.display = 'block';
        } else {
            noEmployeesMessage.style.display = 'none';
        }

        if (trash.length === 0) {
            noTrashMessage.style.display = 'block';
            emptyTrashBtn.style.display = 'none'; // Hide empty trash button if trash is empty
        } else {
            noTrashMessage.style.display = 'block'; // Show empty trash message
            if (trashBinSection.classList.contains('hidden')) {
                // If trash section is hidden, only show the "Trash is empty!" message
                noTrashMessage.textContent = 'Trash is empty!';
            } else {
                // If trash section is visible, show the message "No employees in trash."
                 noTrashMessage.textContent = 'No employees in trash.';
            }
            emptyTrashBtn.style.display = 'block'; // Show empty trash button
        }
         // Correct logic for noTrashMessage based on actual content
        if (trash.length === 0 && !trashBinSection.classList.contains('hidden')) {
            noTrashMessage.style.display = 'block';
            noTrashMessage.textContent = 'Trash is empty!';
        } else if (trash.length > 0 && !trashBinSection.classList.contains('hidden')) {
             noTrashMessage.style.display = 'none';
        }

    }


    /**
     * Renders the employee table based on the 'employees' array.
     */
    function renderEmployees() {
        console.time('renderEmployees'); // Performance measurement start
        employeeTableBody.innerHTML = ''; // Clear existing table rows (using innerHTML for clearing)

        if (employees.length === 0) {
            noEmployeesMessage.style.display = 'block';
        } else {
            noEmployeesMessage.style.display = 'none';
            employees.forEach(employee => {
                const row = employeeTableBody.insertRow();
                // 3. createElement (for creating new elements)
                const nameCell = document.createElement('td');
                const roleCell = document.createElement('td');
                const statusCell = document.createElement('td');
                const actionsCell = document.createElement('td');

                // setAttribute for data-label (for responsive table)
                nameCell.setAttribute('data-label', 'Employee Name');
                roleCell.setAttribute('data-label', 'Role');
                statusCell.setAttribute('data-label', 'Status');
                actionsCell.setAttribute('data-label', 'Actions');


                // innerText vs textContent vs innerHTML explanation:
                // innerText: Gets/sets the *rendered* text content. Aware of CSS (e.g., hidden elements).
                // textContent: Gets/sets the *raw* text content, including hidden text, scripts, etc. More performant for pure text.
                // innerHTML: Gets/sets the HTML content. Involves parsing, less secure for user input.

                // Here we use textContent for plain text display for performance and security
                nameCell.textContent = employee.name;
                roleCell.textContent = employee.role;

                // Dynamic badge creation and styling
                const statusBadge = document.createElement('span');
                statusBadge.textContent = employee.status; // Using textContent
                statusBadge.classList.add('status-badge'); // Add base class

                // Dynamic classes based on status
                if (employee.status === 'Active') {
                    statusBadge.classList.add('active');
                } else if (employee.status === 'On Leave') {
                    statusBadge.classList.add('on-leave');
                } else if (employee.status === 'Terminated') {
                    statusBadge.classList.add('terminated');
                }
                statusCell.appendChild(statusBadge);

                // Action buttons
                const actionDiv = document.createElement('div');
                actionDiv.classList.add('action-buttons');

                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edit';
                editBtn.classList.add('btn', 'btn-info');
                // getAttribute example: Retrieving a custom data attribute for employee ID
                editBtn.setAttribute('data-employee-id', employee.id);
                editBtn.onclick = () => editEmployee(employee.id);

                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.classList.add('btn', 'btn-danger');
                deleteBtn.setAttribute('data-employee-id', employee.id); // setAttribute
                deleteBtn.onclick = () => softDeleteEmployee(employee.id);

                actionDiv.appendChild(editBtn);
                actionDiv.appendChild(deleteBtn);
                actionsCell.appendChild(actionDiv);

                row.appendChild(nameCell);
                row.appendChild(roleCell);
                row.appendChild(statusCell);
                row.appendChild(actionsCell);
            });
        }
        updateEmployeeCounts();
        console.timeEnd('renderEmployees'); // Performance measurement end
    }

    /**
     * Renders the trash bin table based on the 'trash' array.
     */
    function renderTrash() {
        trashTableBody.innerHTML = ''; // Clear existing table rows

        if (trash.length === 0) {
            noTrashMessage.style.display = 'block';
            emptyTrashBtn.style.display = 'none';
        } else {
            noTrashMessage.style.display = 'none';
            emptyTrashBtn.style.display = 'block';
            trash.forEach(employee => {
                const row = trashTableBody.insertRow();

                const nameCell = document.createElement('td');
                const roleCell = document.createElement('td');
                const statusCell = document.createElement('td');
                const actionsCell = document.createElement('td');

                nameCell.setAttribute('data-label', 'Employee Name');
                roleCell.setAttribute('data-label', 'Role');
                statusCell.setAttribute('data-label', 'Status');
                actionsCell.setAttribute('data-label', 'Actions');

                nameCell.textContent = employee.name;
                roleCell.textContent = employee.role;

                const statusBadge = document.createElement('span');
                statusBadge.textContent = employee.status;
                statusBadge.classList.add('status-badge', 'terminated'); // Trash items are implicitly terminated or deleted
                statusCell.appendChild(statusBadge);

                const actionDiv = document.createElement('div');
                actionDiv.classList.add('action-buttons');

                const restoreBtn = document.createElement('button');
                restoreBtn.textContent = 'Restore';
                restoreBtn.classList.add('btn', 'btn-success');
                restoreBtn.setAttribute('data-employee-id', employee.id);
                restoreBtn.onclick = () => restoreEmployee(employee.id);

                const permDeleteBtn = document.createElement('button');
                permDeleteBtn.textContent = 'Permanently Delete';
                permDeleteBtn.classList.add('btn', 'btn-danger');
                permDeleteBtn.setAttribute('data-employee-id', employee.id);
                permDeleteBtn.onclick = () => confirmPermanentDelete(employee.id);

                actionDiv.appendChild(restoreBtn);
                actionDiv.appendChild(permDeleteBtn);
                actionsCell.appendChild(actionDiv);

                row.appendChild(nameCell);
                row.appendChild(roleCell);
                row.appendChild(statusCell);
                row.appendChild(actionsCell);
            });
        }
        updateEmployeeCounts();
    }

    // --- CRUD Operations ---

    /**
     * Handles adding a new employee.
     * @param {Event} e - The submit event.
     */
    employeeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.time('addEmployee'); // Performance measurement start

        // Reset previous errors
        nameError.textContent = '';
        roleError.textContent = '';
        statusError.textContent = '';

        const name = employeeNameInput.value.trim();
        const role = employeeRoleInput.value.trim();
        const status = employeeStatusInput.value;

        // Form Validation
        let isValid = true;

        // Name validation: Only letters and spaces allowed
        const nameRegex = /^[a-zA-Z\s]+$/;
        if (!name) {
            nameError.textContent = 'Employee Name is required.';
            isValid = false;
        } else if (!nameRegex.test(name)) {
            nameError.textContent = 'Name can only contain letters and spaces.';
            isValid = false;
        }

        // Role validation: Alphanumeric and spaces allowed
        const roleRegex = /^[a-zA-Z0-9\s-]+$/;
        if (!role) {
            roleError.textContent = 'Role is required.';
            isValid = false;
        } else if (!roleRegex.test(role)) {
            roleError.textContent = 'Role can only contain letters, numbers, spaces, or hyphens.';
            isValid = false;
        }

        // Status validation
        if (!status) {
            statusError.textContent = 'Status is required.';
            isValid = false;
        }

        if (!isValid) {
            alert('Please fill in all fields correctly.'); // Alert for convenience
            return;
        }

        const newEmployee = {
            id: Date.now().toString(), // Simple unique ID
            name: name,
            role: role,
            status: status
        };

        employees.push(newEmployee);
        renderEmployees(); // Re-render the main list

        // Clear form fields using value property
        employeeNameInput.value = '';
        employeeRoleInput.value = '';
        employeeStatusInput.value = ''; // Reset dropdown

        console.timeEnd('addEmployee'); // Performance measurement end
    });

    /**
     * Edits an existing employee's data.
     * Uses prompt() for simplicity, could be replaced by a modal.
     * @param {string} id - The ID of the employee to edit.
     */
    function editEmployee(id) {
        const employeeToEdit = employees.find(emp => emp.id === id);
        if (!employeeToEdit) return;

        console.time('editEmployee'); // Performance measurement start

        // Get current values
        const currentName = employeeToEdit.name;
        const currentRole = employeeToEdit.role;
        const currentStatus = employeeToEdit.status;

        // Prompt for new name
        let newName = prompt(`Edit Name for ${currentName}:`, currentName);
        if (newName === null) { // User clicked cancel
            console.timeEnd('editEmployee');
            return;
        }
        newName = newName.trim();
        const nameRegex = /^[a-zA-Z\s]+$/;
        while (!newName || !nameRegex.test(newName)) {
            alert('Name cannot be empty and must contain only letters and spaces.');
            newName = prompt(`Edit Name for ${currentName}:`, currentName);
            if (newName === null) { return; } // Allow cancel again
            newName = newName.trim();
        }

        // Prompt for new role
        let newRole = prompt(`Edit Role for ${currentName} (Current: ${currentRole}):`, currentRole);
        if (newRole === null) {
            console.timeEnd('editEmployee');
            return;
        }
        newRole = newRole.trim();
        const roleRegex = /^[a-zA-Z0-9\s-]+$/;
        while (!newRole || !roleRegex.test(newRole)) {
            alert('Role cannot be empty and must contain letters, numbers, spaces, or hyphens.');
            newRole = prompt(`Edit Role for ${currentName} (Current: ${currentRole}):`, currentRole);
            if (newRole === null) { return; }
            newRole = newRole.trim();
        }

        // Prompt for new status
        let newStatus = prompt(`Edit Status for ${currentName} (Active, On Leave, Terminated. Current: ${currentStatus}):`, currentStatus);
        if (newStatus === null) {
            console.timeEnd('editEmployee');
            return;
        }
        newStatus = newStatus.trim();
        const validStatuses = ['Active', 'On Leave', 'Terminated'];
        while (!validStatuses.includes(newStatus)) {
            alert('Invalid status. Please enter Active, On Leave, or Terminated.');
            newStatus = prompt(`Edit Status for ${currentName} (Active, On Leave, Terminated. Current: ${currentStatus}):`, currentStatus);
            if (newStatus === null) { return; }
            newStatus = newStatus.trim();
        }

        employeeToEdit.name = newName;
        employeeToEdit.role = newRole;
        employeeToEdit.status = newStatus;

        renderEmployees(); // Re-render the main list
        console.timeEnd('editEmployee'); // Performance measurement end
    }

    /**
     * Moves an employee to the trash (soft delete).
     * @param {string} id - The ID of the employee to soft delete.
     */
    function softDeleteEmployee(id) {
        if (!confirm('Are you sure you want to delete this employee? It will be moved to the trash.')) {
            return;
        }
        console.time('softDeleteEmployee'); // Performance measurement start

        const index = employees.findIndex(emp => emp.id === id);
        if (index > -1) {
            const [deletedEmployee] = employees.splice(index, 1); // Remove from employees
            trash.push(deletedEmployee); // Add to trash
            renderEmployees(); // Re-render main list
            renderTrash();    // Re-render trash list
        }
        console.timeEnd('softDeleteEmployee'); // Performance measurement end
    }

    /**
     * Restores an employee from the trash to the active list.
     * @param {string} id - The ID of the employee to restore.
     */
    function restoreEmployee(id) {
        if (!confirm('Are you sure you want to restore this employee?')) {
            return;
        }
        console.time('restoreEmployee'); // Performance measurement start

        const index = trash.findIndex(emp => emp.id === id);
        if (index > -1) {
            const [restoredEmployee] = trash.splice(index, 1); // Remove from trash
            employees.push(restoredEmployee); // Add to employees
            renderTrash();     // Re-render trash list
            renderEmployees(); // Re-render main list
        }
        console.timeEnd('restoreEmployee'); // Performance measurement end
    }

    /**
     * Confirms and permanently deletes an employee from the trash.
     * @param {string} id - The ID of the employee to permanently delete.
     */
    function confirmPermanentDelete(id) {
        if (!confirm('WARNING: This action cannot be undone. Are you sure you want to permanently delete this employee?')) {
            return;
        }
        console.time('permanentDeleteEmployee'); // Performance measurement start

        const index = trash.findIndex(emp => emp.id === id);
        if (index > -1) {
            trash.splice(index, 1); // Permanently remove
            renderTrash(); // Re-render trash list
        }
        console.timeEnd('permanentDeleteEmployee'); // Performance measurement end
    }

    /**
     * Empties the entire trash bin.
     */
    emptyTrashBtn.addEventListener('click', () => {
        if (!confirm('Are you sure you want to permanently empty the entire trash bin? This action cannot be undone.')) {
            return;
        }
        console.time('emptyTrash'); // Performance measurement start
        trash = []; // Clear the trash array
        renderTrash(); // Re-render trash list (which will now be empty)
        console.timeEnd('emptyTrash'); // Performance measurement end
    });

    /**
     * Toggles the visibility of the trash bin section.
     */
    toggleTrashBtn.addEventListener('click', () => {
        // 4. classList.toggle (for dynamic classes)
        trashBinSection.classList.toggle('hidden');
        if (trashBinSection.classList.contains('hidden')) {
            toggleTrashBtn.textContent = `Show Trash (${trash.length})`;
            // Hide message if trash is hidden
            if (trash.length === 0) {
                 noTrashMessage.style.display = 'none';
            }
        } else {
            toggleTrashBtn.textContent = `Hide Trash (${trash.length})`;
            renderTrash(); // Render trash content when shown
        }
    });

    // Initial render when the page loads
    renderEmployees();
    renderTrash(); // Render trash initially (even if hidden) to update counts
});
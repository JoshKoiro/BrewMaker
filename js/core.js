let groupCounter = 0;
let fieldCounter = 0;

function createGroup() {
    const groupId = `group_${groupCounter++}`;
    const group = document.createElement('div');
    group.className = 'card mt-3 draggable';
    group.draggable = true;
    group.id = groupId;
    group.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <div>
                <input type="text" class="form-control mb-2" placeholder="Group Heading">
                <input type="text" class="form-control mb-2" placeholder="Icon Name">
            </div>
            <div>
                <button class="btn btn-secondary btn-sm toggle-group me-2">Collapse</button>
                <button class="btn btn-danger btn-sm delete-group">Delete Group</button>
            </div>
        </div>
        <div class="card-body">
            <table class="table">
                <thead>
                    <tr>
                        <th>Field Name</th>
                        <th>Field Type</th>
                        <th>Required</th>
                        <th>Options</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <button class="btn btn-secondary btn-sm add-field">Add Field</button>
        </div>
    `;

    group.querySelector('.delete-group').addEventListener('click', () => group.remove());
    group.querySelector('.add-field').addEventListener('click', () => createField(group));
    group.querySelector('.toggle-group').addEventListener('click', (e) => toggleGroup(e, group));
    
    group.querySelector('.card-header').addEventListener('dblclick', (e) => toggleGroup(e, group));

    groupsContainer.appendChild(group);
    setupDragAndDrop(group);
}

function toggleGroup(e, group) {
    const button = group.querySelector('.toggle-group');
    const cardBody = group.querySelector('.card-body');
    if (cardBody.style.display === 'none') {
        cardBody.style.display = 'block';
        button.textContent = 'Collapse';
    } else {
        cardBody.style.display = 'none';
        button.textContent = 'Expand';
    }
}

function createField(group) {
    const fieldId = `field_${fieldCounter++}`;
    const row = document.createElement('tr');
    row.className = 'draggable';
    row.draggable = true;
    row.id = fieldId;
    row.innerHTML = `
        <td><input type="text" class="form-control" placeholder="Field Name"></td>
        <td>
            <select class="form-control field-type">
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="dropdown">Dropdown</option>
                <option value="checkbox">Checkbox</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
            </select>
        </td>
        <td><input type="checkbox"></td>
        <td><input type="text" class="form-control options-input" placeholder="Options (comma-separated)" style="display: none;"></td>
        <td><button class="btn btn-danger btn-sm delete-field">Delete</button></td>
    `;

    row.querySelector('.delete-field').addEventListener('click', () => row.remove());
    row.querySelector('.field-type').addEventListener('change', (e) => toggleOptionsInput(e.target));
    group.querySelector('tbody').appendChild(row);
    setupDragAndDrop(row);
}

function toggleOptionsInput(selectElement) {
    const optionsInput = selectElement.closest('tr').querySelector('.options-input');
    optionsInput.style.display = selectElement.value === 'dropdown' ? 'block' : 'none';
}

function formatFieldName(name) {
    return name;
    // return name.toLowerCase().replace(/\s+/g, '_');
}

// Expose necessary functions
window.createGroup = createGroup;
window.createField = createField;
window.toggleGroup = toggleGroup;
window.toggleOptionsInput = toggleOptionsInput;
window.formatFieldName = formatFieldName;
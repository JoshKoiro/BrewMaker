/**
 * @module core
 * @description A module that handles the creation and display of groups and fields that get applied to the form structure.
 */

let groupCounter = 0;
let fieldCounter = 0;
/**
 * @func createGroup Creates a new group element and adds it to the DOM.
 * @return {void} This function does not return anything.
 */
function createGroup() {
    const groupId = `group_${groupCounter++}`;
    const group = document.createElement('div');
    group.className = 'card mt-3 draggable';
    group.draggable = true;
    group.id = groupId;
    group.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <div class="mb-2 row flex-grow-1">
                <div class="col-8">
                <label for="groupName" class="form-label">Group Name</label>
                <input name="groupName" type="text" class="form-control mb-2" placeholder="Group Heading">
                </div>
                <div class="col-3">
                <label for="groupIcon" class="form-label">Group Icon</label>
                <input name="groupIcon" type="text" class="form-control mb-2" placeholder="Icon Name">
                </div>
            </div>
            <div>
                <button class="btn btn-secondary btn-sm toggle-group me-2">Collapse</button>
                <button class="btn btn-danger btn-sm delete-group">
                <span class="material-symbols-outlined delete">delete</span>
                </button>
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
                        <th>Description</th>
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
        button.innerHTML = '<span class="material-symbols-outlined expand_circle_up">expand_circle_up</span>';
    } else {
        cardBody.style.display = 'none';
        button.innerHTML = '<span class="material-symbols-outlined expand_circle_down">expand_circle_down</span>';
    }
}
/**
 * @func createField Creates a new field element within a group and adds it to the DOM.
 * @param {HTMLElement} group the group element to add the field to
 * @return {void} This function does not return anything.
 */
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
                <option value="textarea">Textarea</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="dropdown">Dropdown</option>
                <option value="checkbox">Checkbox</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
            </select>
        </td>
        <td><input type="checkbox"></td>
        <td><textarea class="form-control options-input" placeholder="Options (one per line)" style="display: none;"></textarea></td>
        <td><textarea class="form-control description-input" placeholder="Description"></textarea></td>
        <td><button class="btn btn-danger btn-sm delete-field">
        <i class="material-symbols-outlined delete">delete</i>
        </button>
        <button class="btn btn-primary btn-sm" disabled>
        <i class="material-symbols-outlined">quick_reference</i>
        </button>
        </td>
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
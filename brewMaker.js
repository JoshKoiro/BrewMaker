const formBuilder = document.getElementById('formBuilder');
const groupsContainer = document.getElementById('groups');
const addGroupBtn = document.getElementById('addGroup');
const exportJSBtn = document.getElementById('exportJS');
const exportJSONBtn = document.getElementById('exportJSON');
const importFileInput = document.getElementById('importFile');

let groupCounter = 0;
let fieldCounter = 0;

function createGroup() {
    const groupId = `group_${groupCounter++}`;
    const group = document.createElement('div');
    group.className = 'card mt-3 draggable';
    group.draggable = true;
    group.id = groupId;
    group.innerHTML = `
        <div class="card-header">
            <input type="text" class="form-control mb-2" placeholder="Group Heading">
            <input type="text" class="form-control mb-2" placeholder="Icon Name">
            <button class="btn btn-danger btn-sm float-end delete-group">Delete Group</button>
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

    groupsContainer.appendChild(group);
    setupDragAndDrop(group);
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
                <option value="email">Email</option>
                <option value="select">Select</option>
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
    optionsInput.style.display = selectElement.value === 'select' ? 'block' : 'none';
}

let draggingElement = null;
let dropTarget = null;

function setupDragAndDrop(element) {
    element.addEventListener('dragstart', dragStart);
    element.addEventListener('dragend', dragEnd);
}

function dragStart(e) {
    draggingElement = e.target.closest('.draggable');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
    setTimeout(() => draggingElement.classList.add('dragging'), 0);
}

function dragEnd(e) {
    if (draggingElement && dropTarget) {
        const isGroup = draggingElement.classList.contains('card');
        if (isGroup) {
            rearrangeGroups();
        } else {
            rearrangeFields();
        }
    }
    
    if (draggingElement) {
        draggingElement.classList.remove('dragging');
    }
    draggingElement = null;
    dropTarget = null;
    clearDragOverStyles();
}

function rearrangeGroups() {
    const rect = dropTarget.getBoundingClientRect();
    const dropY = rect.top + rect.height / 2;
    if (event.clientY < dropY) {
        groupsContainer.insertBefore(draggingElement, dropTarget);
    } else {
        groupsContainer.insertBefore(draggingElement, dropTarget.nextElementSibling);
    }
}

function rearrangeFields() {
    const sourceTable = draggingElement.closest('tbody');
    const targetTable = dropTarget.closest('tbody');
    
    if (sourceTable !== targetTable) {
        targetTable.insertBefore(draggingElement, dropTarget);
    } else {
        const rect = dropTarget.getBoundingClientRect();
        const dropY = rect.top + rect.height / 2;
        if (event.clientY < dropY) {
            sourceTable.insertBefore(draggingElement, dropTarget);
        } else {
            sourceTable.insertBefore(draggingElement, dropTarget.nextElementSibling);
        }
    }
}

function clearDragOverStyles() {
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!draggingElement) return;

    dropTarget = getClosestDraggableElement(e.clientY);
    
    if (dropTarget) {
        clearDragOverStyles();
        dropTarget.classList.add('drag-over');
    }
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
    dragEnd(e);
});

function getClosestDraggableElement(clientY) {
    const draggableElements = [...document.querySelectorAll('.draggable:not(.dragging)')];
    return draggableElements.reduce((closest, element) => {
        const box = element.getBoundingClientRect();
        const offset = clientY - box.top - box.height / 2;
        if (Math.abs(offset) < Math.abs(closest.offset)) {
            return { offset: offset, element: element };
        } else {
            return closest;
        }
    }, { offset: Number.POSITIVE_INFINITY }).element;
}

function getFormConfig() {
    const config = { groups: [] };
    document.querySelectorAll('.card').forEach(groupEl => {
        const group = {
            heading: groupEl.querySelector('.card-header input:nth-child(1)').value,
            icon: groupEl.querySelector('.card-header input:nth-child(2)').value,
            categories: []
        };

        groupEl.querySelectorAll('tbody tr').forEach(rowEl => {
            const fieldType = rowEl.querySelector('td:nth-child(2) select').value;
            const category = {
                category: formatFieldName(rowEl.querySelector('td:nth-child(1) input').value),
                type: fieldType,
                required: rowEl.querySelector('td:nth-child(3) input').checked,
                options: fieldType === 'select' ? rowEl.querySelector('td:nth-child(4) input').value.split(',').map(o => o.trim()).filter(o => o !== '') : []
            };
            group.categories.push(category);
        });

        config.groups.push(group);
    });
    return config;
}

function formatFieldName(name) {
    return name.toLowerCase().replace(/\s+/g, '_');
}

function exportConfig(format) {
    const config = getFormConfig();
    let content, filename, type;

    if (format === 'js') {
        content = `window.formConfig = ${JSON.stringify(config, null, 2)};`;
        filename = 'form_config.js';
        type = 'application/javascript';
    } else {
        content = JSON.stringify(config, null, 2);
        filename = 'form_config.json';
        type = 'application/json';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function importConfig(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        let config;
        if (file.name.endsWith('.js')) {
            const js = e.target.result;
            eval(js);
            config = window.formConfig;
        } else {
            config = JSON.parse(e.target.result);
        }
        renderConfig(config);
    };
    reader.readAsText(file);
}

function renderConfig(config) {
    groupsContainer.innerHTML = '';
    config.groups.forEach(group => {
        createGroup();
        const groupEl = groupsContainer.lastElementChild;
        groupEl.querySelector('.card-header input:nth-child(1)').value = group.heading;
        groupEl.querySelector('.card-header input:nth-child(2)').value = group.icon;

        group.categories.forEach(category => {
            createField(groupEl);
            const rowEl = groupEl.querySelector('tbody tr:last-child');
            rowEl.querySelector('td:nth-child(1) input').value = category.category;
            const fieldTypeSelect = rowEl.querySelector('td:nth-child(2) select');
            fieldTypeSelect.value = category.type;
            rowEl.querySelector('td:nth-child(3) input').checked = category.required;
            const optionsInput = rowEl.querySelector('td:nth-child(4) input');
            optionsInput.value = category.options.join(', ');
            toggleOptionsInput(fieldTypeSelect);
        });
    });
}

addGroupBtn.addEventListener('click', createGroup);
exportJSBtn.addEventListener('click', () => exportConfig('js'));
exportJSONBtn.addEventListener('click', () => exportConfig('json'));
importFileInput.addEventListener('change', (e) => importConfig(e.target.files[0]));
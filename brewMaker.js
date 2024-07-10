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
    group.className = 'card mt-3';
    group.id = groupId;
    group.innerHTML = `
        <div class="card-header draggable" draggable="true">
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

function setupDragAndDrop(element) {
    element.addEventListener('dragstart', dragStart);
    element.addEventListener('dragend', dragEnd);
    document.addEventListener('dragover', dragOver);
    document.addEventListener('drop', drop);
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    setTimeout(() => e.target.classList.add('dragging'), 0);
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
    const draggable = document.querySelector('.dragging');
    if (!draggable) return;

    const closestElement = getClosestDraggableElement(e.clientY);
    if (closestElement) {
        const container = draggable.closest('.card') ? groupsContainer : closestElement.closest('tbody');
        const insertBefore = draggable.closest('.card') === closestElement.closest('.card') && 
                             draggable.getBoundingClientRect().top < closestElement.getBoundingClientRect().top;
        container.insertBefore(draggable, insertBefore ? closestElement : closestElement.nextSibling);
    }
}

function getClosestDraggableElement(clientY) {
    const draggableElements = [...document.querySelectorAll('.draggable:not(.dragging)')];
    return draggableElements.reduce((closest, element) => {
        const box = element.getBoundingClientRect();
        const offset = clientY - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function drop(e) {
    e.preventDefault();
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
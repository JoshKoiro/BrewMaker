let conditionsContainer;
let addConditionBtn;

function initializeConditions() {
    conditionsContainer = document.getElementById('conditions');
    addConditionBtn = document.getElementById('addCondition');
    addConditionBtn.addEventListener('click', addCondition);
}

function addCondition() {
    const conditionId = `condition_${Date.now()}`;
    const conditionElement = document.createElement('div');
    conditionElement.className = 'card mt-3';
    conditionElement.id = conditionId;
    conditionElement.innerHTML = `
        <div class="card-header">
            <h5 class="mb-0">
                Condition
                <button class="btn btn-danger btn-sm float-end delete-condition">Delete</button>
            </h5>
        </div>
        <div class="card-body">
            <h6>If:</h6>
            <div class="condition-triggers"></div>
            <button class="btn btn-secondary btn-sm mt-2 add-trigger">Add Trigger</button>
            
            <h6 class="mt-3">Then:</h6>
            <div class="condition-actions"></div>
            <button class="btn btn-secondary btn-sm mt-2 add-action">Add Action</button>
        </div>
    `;

    conditionElement.querySelector('.delete-condition').addEventListener('click', () => conditionElement.remove());
    conditionElement.querySelector('.add-trigger').addEventListener('click', () => addTrigger(conditionId));
    conditionElement.querySelector('.add-action').addEventListener('click', () => addAction(conditionId));

    conditionsContainer.appendChild(conditionElement);
    addTrigger(conditionId);
    addAction(conditionId);
}

function addTrigger(conditionId) {
    const triggerElement = document.createElement('div');
    triggerElement.className = 'mb-2';
    triggerElement.innerHTML = `
        <select class="form-select trigger-category"></select>
        <div class="mt-2 trigger-values"></div>
    `;

    const condition = document.getElementById(conditionId);
    condition.querySelector('.condition-triggers').appendChild(triggerElement);

    populateCategoryDropdown(triggerElement.querySelector('.trigger-category'));
    triggerElement.querySelector('.trigger-category').addEventListener('change', (e) => updateTriggerValues(e.target));
}

function addAction(conditionId) {
    const actionElement = document.createElement('div');
    actionElement.className = 'mb-2';
    actionElement.innerHTML = `
        <select class="form-select action-type">
            <option value="removes">Removes</option>
            <option value="shows">Shows</option>
            <option value="hides">Hides</option>
            <option value="requires">Requires</option>
        </select>
        <select class="form-select mt-2 action-category"></select>
        <div class="mt-2 action-values"></div>
    `;

    const condition = document.getElementById(conditionId);
    condition.querySelector('.condition-actions').appendChild(actionElement);

    populateCategoryDropdown(actionElement.querySelector('.action-category'));
    actionElement.querySelector('.action-category').addEventListener('change', (e) => updateActionValues(e.target));
}

function populateCategoryDropdown(selectElement) {
    const categories = getAllCategories();
    selectElement.innerHTML = '<option value="">Select a category</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category;
        option.textContent = category.category;
        selectElement.appendChild(option);
    });
}

function updateTriggerValues(categorySelect) {
    const valuesContainer = categorySelect.parentElement.querySelector('.trigger-values');
    updateValues(categorySelect, valuesContainer, true);
}

function updateActionValues(categorySelect) {
    const valuesContainer = categorySelect.parentElement.querySelector('.action-values');
    updateValues(categorySelect, valuesContainer, false);
}

function updateValues(categorySelect, valuesContainer, isTrigger) {
    const category = getAllCategories().find(cat => cat.category === categorySelect.value);
    valuesContainer.innerHTML = '';

    if (category.type === 'select') {
        const select = document.createElement('select');
        select.className = 'form-select';
        select.multiple = isTrigger;
        category.options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
        valuesContainer.appendChild(select);
    } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control';
        input.placeholder = 'Enter comma-separated values';
        valuesContainer.appendChild(input);
    }

    if (!isTrigger) {
        const wholeCategory = document.createElement('div');
        wholeCategory.className = 'form-check mt-2';
        wholeCategory.innerHTML = `
            <input class="form-check-input" type="checkbox" id="wholeCategory_${category.category}">
            <label class="form-check-label" for="wholeCategory_${category.category}">
                Apply to whole category
            </label>
        `;
        valuesContainer.appendChild(wholeCategory);
    }
}

function getAllCategories() {
    const categories = [];
    document.querySelectorAll('.card').forEach(groupEl => {
        groupEl.querySelectorAll('tbody tr').forEach(rowEl => {
            categories.push({
                category: formatFieldName(rowEl.querySelector('td:nth-child(1) input').value),
                type: rowEl.querySelector('td:nth-child(2) select').value,
                options: rowEl.querySelector('td:nth-child(2) select').value === 'select' 
                    ? rowEl.querySelector('td:nth-child(4) input').value.split(',').map(o => o.trim()).filter(o => o !== '')
                    : []
            });
        });
    });
    return categories;
}

function getConditionsConfig() {
    const conditions = [];
    document.querySelectorAll('#conditions .card').forEach(conditionEl => {
        const condition = {
            if: [],
            then: []
        };

        conditionEl.querySelectorAll('.condition-triggers > div').forEach(triggerEl => {
            const category = triggerEl.querySelector('.trigger-category').value;
            const valuesElement = triggerEl.querySelector('.trigger-values > *');
            const values = valuesElement.tagName === 'SELECT' 
                ? Array.from(valuesElement.selectedOptions).map(opt => opt.value)
                : valuesElement.value.split(',').map(v => v.trim());

            condition.if.push({ category, values });
        });

        conditionEl.querySelectorAll('.condition-actions > div').forEach(actionEl => {
            const type = actionEl.querySelector('.action-type').value;
            const category = actionEl.querySelector('.action-category').value;
            const valuesElement = actionEl.querySelector('.action-values > *:first-child');
            const applyToWholeCategory = actionEl.querySelector('.action-values input[type="checkbox"]').checked;

            let values = [];
            if (!applyToWholeCategory) {
                values = valuesElement.tagName === 'SELECT' 
                    ? Array.from(valuesElement.selectedOptions).map(opt => opt.value)
                    : valuesElement.value.split(',').map(v => v.trim());
            }

            condition.then.push({ type, category, values, applyToWholeCategory });
        });

        conditions.push(condition);
    });

    return conditions;
}

// Expose necessary functions
window.initializeConditions = initializeConditions;
window.getConditionsConfig = getConditionsConfig;
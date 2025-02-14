/**
 * @module conditions
 * @description A module that handles the creation and display of conditions that get applied to the form structure elements.
 */

let conditionsContainer;
let addConditionBtn;

/**
 * @func initializeConditions
 */
function initializeConditions() {
    conditionsContainer = document.getElementById('conditions');
    addConditionBtn = document.getElementById('addCondition');
    addConditionBtn.addEventListener('click', addCondition);
}

function addCondition(name = '') {
    const conditionId = `condition_${Date.now()}`;
    const conditionElement = document.createElement('div');
    conditionElement.className = 'card mt-3';
    conditionElement.id = conditionId;
    conditionElement.innerHTML = `
        <div class="card-header d-flex justify-content-between align-items-center">
            <input type="text" class="form-control condition-name" placeholder="Condition Name (Optional)" value="${name}" style="width: auto;">
            <div>
                <button class="btn btn-secondary btn-sm toggle-condition me-2">Collapse
                <span class="material-symbols-outlined expand_circle_down">expand_circle_down</span>
                </button>
                <button class="btn btn-danger btn-sm delete-condition">
                <span class="material-symbols-outlined delete">delete</span>
                </button>
            </div>
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
    conditionElement.querySelector('.toggle-condition').addEventListener('click', () => toggleCondition(conditionElement));
    
    conditionElement.querySelector('.card-header').addEventListener('dblclick', () => toggleCondition(conditionElement));

    conditionsContainer.appendChild(conditionElement);
    addTrigger(conditionId);
    addAction(conditionId);
}

function toggleCondition(conditionElement) {
    const button = conditionElement.querySelector('.toggle-condition');
    const cardBody = conditionElement.querySelector('.card-body');
    if (cardBody.style.display === 'none') {
        cardBody.style.display = 'block';
        button.innerHTML = '<span class="material-symbols-outlined expand_circle_up">expand_circle_up</span>';
    } else {
        cardBody.style.display = 'none';
        button.innerHTML = '<span class="material-symbols-outlined expand_circle_down">expand_circle_down</span>';
    }
}

function addTrigger(conditionId) {
    const triggerElement = document.createElement('div');
    triggerElement.className = 'mb-2 d-flex align-items-center';
    triggerElement.innerHTML = `
        <div class="flex-grow-1">
            <select class="form-select trigger-category"></select>
            <div class="mt-2 trigger-values"></div>
        </div>
        <button class="btn btn-danger btn-sm ms-2 remove-trigger">
        <span class="material-symbols-outlined delete">delete</span>
        </button>
    `;

    const condition = document.getElementById(conditionId);
    if (condition) {
        const triggersContainer = condition.querySelector('.condition-triggers');
        if (triggersContainer) {
            triggersContainer.appendChild(triggerElement);
            const categorySelect = triggerElement.querySelector('.trigger-category');
            if (categorySelect) {
                populateCategoryDropdown(categorySelect);
                categorySelect.addEventListener('change', (e) => updateTriggerValues(e.target));
            }
            const removeButton = triggerElement.querySelector('.remove-trigger');
            if (removeButton) {
                removeButton.addEventListener('click', () => triggerElement.remove());
            }
        }
    }
}

function addAction(conditionId) {
    const actionElement = document.createElement('div');
    actionElement.className = 'mb-2 d-flex align-items-center';
    actionElement.innerHTML = `
        <div class="flex-grow-1">
            <select class="form-select action-type">
                <option value="removes">Removes</option>
                <option value="requires">Requires</option>
                <option value="shows">Shows</option>
            </select>
            <select class="form-select mt-2 action-category"></select>
            <div class="mt-2 action-values"></div>
        </div>
        <button class="btn btn-danger btn-sm ms-2 remove-action">
        <span class="material-symbols-outlined delete">delete</span>
        </button>
    `;

    const condition = document.getElementById(conditionId);
    if (condition) {
        const actionsContainer = condition.querySelector('.condition-actions');
        if (actionsContainer) {
            actionsContainer.appendChild(actionElement);
            const categorySelect = actionElement.querySelector('.action-category');
            if (categorySelect) {
                populateCategoryDropdown(categorySelect);
                categorySelect.addEventListener('change', (e) => updateActionValues(e.target));
            }
            const removeButton = actionElement.querySelector('.remove-action');
            if (removeButton) {
                removeButton.addEventListener('click', () => actionElement.remove());
            }
        }
    }
}

function populateCategoryDropdown(selectElement) {
    if (!selectElement) return;
    
    const categories = getAllCategories();
    selectElement.innerHTML = '<option value="">Select a category</option>';
    categories.forEach(category => {
        if (category && category.category) {
            const option = document.createElement('option');
            option.value = category.category;
            option.textContent = category.category;
            selectElement.appendChild(option);
        }
    });
}

function updateTriggerValues(categorySelect) {
    if (!categorySelect) return;
    const valuesContainer = categorySelect.parentElement.querySelector('.trigger-values');
    if (valuesContainer) {
        updateValues(categorySelect, valuesContainer, true);
    }
}

function updateActionValues(categorySelect) {
    if (!categorySelect) return;
    const valuesContainer = categorySelect.parentElement.querySelector('.action-values');
    if (valuesContainer) {
        updateValues(categorySelect, valuesContainer, false);
    }
}

function updateValues(categorySelect, valuesContainer, isTrigger) {
    if (!categorySelect || !valuesContainer) return;

    const category = getAllCategories().find(cat => cat && cat.category === categorySelect.value);
    if (!category) return;

    valuesContainer.innerHTML = '';
    
    if (category.type === 'dropdown') {
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
    } else if (category.type === 'checkbox') {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'form-check';
        checkboxDiv.innerHTML = `
            <input class="form-check-input" type="checkbox" id="checkbox_${category.category}">
            <label class="form-check-label" for="checkbox_${category.category}">Checked</label>
        `;
        valuesContainer.appendChild(checkboxDiv);
    } else {
        const input = document.createElement('input');
        input.type = category.type === 'number' ? 'number' : (category.type === 'date' ? 'date' : 'text');
        input.className = 'form-control';
        input.placeholder = `Enter ${category.type} value`;
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

function waitForElement(selector, parent, timeout = 1000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function checkElement() {
            const element = parent.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (Date.now() - startTime >= timeout) {
                reject(new Error('Element not found'));
            } else {
                setTimeout(checkElement, 50);
            }
        }
        
        checkElement();
    });
}

function getAllCategories() {
    const categories = [];
    const groupElements = document.querySelectorAll('#groups .card');
    
    groupElements.forEach(groupEl => {
        const rows = groupEl.querySelectorAll('tbody tr');
        rows.forEach(rowEl => {
            const fieldNameInput = rowEl.querySelector('td:nth-child(1) input');
            const fieldTypeSelect = rowEl.querySelector('td:nth-child(2) select');
            const listItemInput = rowEl.querySelector('td:nth-child(5) textarea');

            if (fieldNameInput && fieldTypeSelect && fieldNameInput.value) {
                const category = {
                    category: formatFieldName(fieldNameInput.value),
                    type: fieldTypeSelect.value,
                    options: fieldTypeSelect.value === 'dropdown' && listItemInput 
                        ? listItemInput.value.split('\n').map(o => o.trim()).filter(o => o !== '')
                        : []
                };
                categories.push(category);
            }
        });
    });
    
    return categories;
}

function getConditionsConfig() {
    const conditions = [];
    document.querySelectorAll('#conditions .card').forEach(conditionEl => {
        const condition = {
            name: conditionEl.querySelector('.condition-name')?.value || '',
            if: [],
            then: []
        };

        // Handle triggers
        conditionEl.querySelectorAll('.condition-triggers > div').forEach(triggerEl => {
            const categorySelect = triggerEl.querySelector('.trigger-category');
            const valuesElement = triggerEl.querySelector('.trigger-values > *');
            
            if (categorySelect?.value) {
                let values = [];
                if (valuesElement) {
                    if (valuesElement.tagName === 'SELECT') {
                        values = Array.from(valuesElement.selectedOptions).map(opt => opt.value);
                    } else if (valuesElement.type === 'checkbox') {
                        values = [valuesElement.checked ? 'Yes' : 'No'];
                    } else {
                        values = valuesElement.value.split(',').map(v => v.trim()).filter(v => v);
                    }
                }

                condition.if.push({
                    category: categorySelect.value,
                    values: values
                });
            }
        });

        // Handle actions
        conditionEl.querySelectorAll('.condition-actions > div').forEach(actionEl => {
            const typeSelect = actionEl.querySelector('.action-type');
            const categorySelect = actionEl.querySelector('.action-category');
            const valuesElement = actionEl.querySelector('.action-values > *:first-child');
            const wholeCategoryCheckbox = actionEl.querySelector('.action-values input[type="checkbox"]');
            
            if (typeSelect?.value && categorySelect?.value) {
                const action = {
                    type: typeSelect.value,
                    category: categorySelect.value,
                    values: [],
                    applyToWholeCategory: wholeCategoryCheckbox?.checked || false
                };

                if (!action.applyToWholeCategory && valuesElement) {
                    if (valuesElement.tagName === 'SELECT') {
                        action.values = Array.from(valuesElement.selectedOptions).map(opt => opt.value);
                    } else if (valuesElement.type === 'checkbox') {
                        action.values = [valuesElement.checked ? 'Yes' : 'No'];
                    } else {
                        action.values = valuesElement.value.split(',').map(v => v.trim()).filter(v => v);
                    }
                }

                condition.then.push(action);
            }
        });

        conditions.push(condition);
    });

    return conditions;
}

function renderConfig(config) {
    groupsContainer.innerHTML = '';
    config.groups.forEach(group => {
        createGroup();
        const groupEl = groupsContainer.lastElementChild;
        groupEl.querySelector('.card-header input[placeholder="Group Heading"]').value = group.heading;
        groupEl.querySelector('.card-header input[placeholder="Icon Name"]').value = group.icon;

        // Collapse the group
        const cardBody = groupEl.querySelector('.card-body');
        const toggleButton = groupEl.querySelector('.toggle-group');
        if (cardBody && toggleButton) {
            cardBody.style.display = 'none';
            toggleButton.innerHTML = '<span class="material-symbols-outlined">expand_circle_down</span>'
        }

        group.categories.forEach(category => {
            createField(groupEl);
            const rowEl = groupEl.querySelector('tbody tr:last-child');
            rowEl.querySelector('td:nth-child(1) input').value = category.category;
            const fieldTypeSelect = rowEl.querySelector('td:nth-child(2) select');
            fieldTypeSelect.value = category.type;
            rowEl.querySelector('td:nth-child(3) input[type="checkbox"]').checked = category.required;
            rowEl.querySelector('td:nth-child(4) input[type="checkbox"]').checked = category.optional || false;
            const listItemInput = rowEl.querySelector('td:nth-child(5) textarea');
            if (category.type === 'dropdown') {
                listItemInput.value = category.options.join('\n');
                listItemInput.style.display = 'block';
            } else {
                listItemInput.style.display = 'none';
            }
            rowEl.querySelector('td:nth-child(6) textarea').value = category.description;
        });
    });

    // Clear existing conditions
    conditionsContainer.innerHTML = '';
    
    // Handle conditions
    if (config.conditions) {
        const renderConditions = async () => {
            for (const condition of config.conditions) {
                // Create condition
                addCondition(condition.name || '');
                const conditionEl = conditionsContainer.lastElementChild;
                
                // Handle triggers ("if" conditions)
                for (let i = 0; i < condition.if.length; i++) {
                    const trigger = condition.if[i];
                    
                    if (i > 0) {
                        addTrigger(conditionEl.id);
                    }
                    
                    const triggerEl = conditionEl.querySelectorAll('.condition-triggers > div')[i];
                    const categorySelect = triggerEl.querySelector('.trigger-category');
                    
                    // Set category and trigger change event
                    categorySelect.value = trigger.category;
                    categorySelect.dispatchEvent(new Event('change'));
                    
                    try {
                        // Wait for values container to be populated
                        const valuesElement = await waitForElement('.trigger-values > *', triggerEl);
                        
                        // Set the values
                        if (valuesElement.tagName === 'SELECT') {
                            // For dropdowns, set multiple selections
                            trigger.values.forEach(value => {
                                const option = Array.from(valuesElement.options)
                                    .find(opt => opt.value === value);
                                if (option) {
                                    option.selected = true;
                                }
                            });
                        } else if (valuesElement.type === 'checkbox') {
                            // For checkboxes
                            valuesElement.checked = trigger.values.includes('Yes');
                        } else {
                            // For other input types
                            valuesElement.value = trigger.values.join(', ');
                        }
                    } catch (error) {
                        console.error('Error setting trigger values:', error);
                    }
                }
                
                // Handle actions ("then" conditions)
                for (let i = 0; i < condition.then.length; i++) {
                    const action = condition.then[i];
                    
                    if (i > 0) {
                        addAction(conditionEl.id);
                    }
                    
                    const actionEl = conditionEl.querySelectorAll('.condition-actions > div')[i];
                    const typeSelect = actionEl.querySelector('.action-type');
                    const categorySelect = actionEl.querySelector('.action-category');
                    
                    // Set type and category
                    typeSelect.value = action.type;
                    categorySelect.value = action.category;
                    categorySelect.dispatchEvent(new Event('change'));
                    
                    try {
                        // Wait for values container to be populated
                        const valuesElement = await waitForElement('.action-values > *:first-child', actionEl);
                        const wholeCategoryCheckbox = actionEl.querySelector('.action-values input[type="checkbox"]');
                        
                        if (action.applyToWholeCategory && wholeCategoryCheckbox) {
                            wholeCategoryCheckbox.checked = true;
                        } else if (valuesElement) {
                            if (valuesElement.tagName === 'SELECT') {
                                // For dropdowns, set multiple selections
                                action.values.forEach(value => {
                                    const option = Array.from(valuesElement.options)
                                        .find(opt => opt.value === value);
                                    if (option) {
                                        option.selected = true;
                                    }
                                });
                            } else if (valuesElement.type === 'checkbox') {
                                // For checkboxes
                                valuesElement.checked = action.values.includes('Yes');
                            } else {
                                // For other input types
                                valuesElement.value = action.values.join(', ');
                            }
                        }
                    } catch (error) {
                        console.error('Error setting action values:', error);
                    }
                }
                
                // Collapse the condition
                const cardBody = conditionEl.querySelector('.card-body');
                const toggleButton = conditionEl.querySelector('.toggle-condition');
                if (cardBody && toggleButton) {
                    cardBody.style.display = 'none';
                    toggleButton.innerHTML = '<span class="material-symbols-outlined expand_circle_down">expand_circle_down</span>';
                }
            }
        };
        
        // Execute the async rendering
        renderConditions().catch(error => {
            console.error('Error rendering conditions:', error);
        });
    }
}

// Expose necessary functions
window.initializeConditions = initializeConditions;
window.getConditionsConfig = getConditionsConfig;
window.addCondition = addCondition;
window.addTrigger = addTrigger;
window.addAction = addAction;
window.updateTriggerValues = updateTriggerValues;
window.updateActionValues = updateActionValues;
window.toggleCondition = toggleCondition;
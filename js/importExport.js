/**
 * @module importExport
 * @description A module that handles the import and export of the form config from the dom to a .js or .json file.
 */

/**
 * @func getFormConfig Gets the form config from the DOM.
 * @returns {Object} The form config object.
 */

function getFormConfig() {
    const config = { 
        groups: [],
        conditions: []
    };
    
    document.querySelectorAll('#groups .card').forEach(groupEl => {
        const group = {
            heading: groupEl.querySelector('.card-header input[placeholder="Group Heading"]')?.value || '',
            icon: groupEl.querySelector('.card-header input[placeholder="Icon Name"]')?.value || '',
            categories: []
        };

        groupEl.querySelectorAll('tbody tr').forEach(rowEl => {
            const fieldNameInput = rowEl.querySelector('td:nth-child(1) input');
            const fieldTypeSelect = rowEl.querySelector('td:nth-child(2) select');
            const requiredCheckbox = rowEl.querySelector('td:nth-child(3) input[type="checkbox"]');
            const optionsInput = rowEl.querySelector('td:nth-child(4) textarea') || rowEl.querySelector('td:nth-child(4) input');
            const description = rowEl.querySelector('td:nth-child(5) textarea');

            if (fieldNameInput && fieldTypeSelect) {
                const fieldType = fieldTypeSelect.value;
                const category = {
                    category: formatFieldName(fieldNameInput.value),
                    type: fieldType,
                    required: requiredCheckbox ? requiredCheckbox.checked : false,
                    options: getOptions(fieldType, optionsInput),
                    description: description ? description.value : ''
                };
                group.categories.push(category);
            }
        });

        config.groups.push(group);
    });

    config.conditions = getConditionsConfig();

    return config;
}

function getOptions(fieldType, optionsInput) {
    if (!optionsInput) {
        console.warn('Options input is null or undefined');
        return [];
    }

    switch (fieldType) {
        case 'dropdown':
            if (optionsInput.tagName.toLowerCase() === 'textarea') {
                return optionsInput.value.split('\n').map(o => o.trim()).filter(o => o !== '');
            } else if (optionsInput.tagName.toLowerCase() === 'input') {
                return optionsInput.value.split(',').map(o => o.trim()).filter(o => o !== '');
            } else {
                console.warn('Unexpected options input type:', optionsInput.tagName);
                return [];
            }
        case 'checkbox':
            return ['Yes', 'No'];
        default:
            return [];
    }
}

function exportConfig(format) {
    const config = getFormConfig();
    let content, filename, type;

    if (format === 'js') {
        content = `window.formConfig = ${formatJsObject(config)};`;
        filename = 'form_config.js';
        type = 'application/javascript';
    } else {
        content = JSON.stringify(config, null, 4);  // Use 4 spaces for JSON indentation
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

function formatJsObject(obj, indent = 0) {
    const indentStr = ' '.repeat(4 * indent);
    let result = '{\n';
    const entries = Object.entries(obj);
    entries.forEach(([key, value], index) => {
        result += `${indentStr}    ${key}: `;
        if (typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                if (value.length === 0) {
                    result += '[]';
                } else {
                    result += '[\n';
                    value.forEach((item, itemIndex) => {
                        if (typeof item === 'object' && item !== null) {
                            result += `${indentStr}        ${formatJsObject(item, indent + 2)}`;
                        } else {
                            result += `${indentStr}        ${JSON.stringify(item)}`;
                        }
                        if (itemIndex < value.length - 1) {
                            result += ',';
                        }
                        result += '\n';
                    });
                    result += `${indentStr}    ]`;
                }
            } else {
                result += formatJsObject(value, indent + 1);
            }
        } else {
            result += JSON.stringify(value);
        }
        if (index < entries.length - 1) {
            result += ',';
        }
        result += '\n';
    });
    result += `${indentStr}}`;
    return result;
}
/**
 * @func importConfig Imports a .js or .json file into the renderConfig function
 * @param {string} file filepath to the .js or .json file to import into the renderConfig function
 * @returns {void}
 */
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

/**
 * @func renderConfig Renders the form config object to the DOM
 * @param {Object} config The form config object
 * @returns {void}
 */
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
            const optionsInput = rowEl.querySelector('td:nth-child(4) textarea');
            if (category.type === 'dropdown') {
                optionsInput.value = category.options.join('\n');
                optionsInput.style.display = 'block';
            } else {
                optionsInput.style.display = 'none';
            }
            rowEl.querySelector('td:nth-child(5) textarea').value = category.description;
        });
    });

    // Render conditions
    conditionsContainer.innerHTML = '';
    if (config.conditions) {
        config.conditions.forEach(condition => {
            addCondition(condition.name || '');
            const conditionEl = conditionsContainer.lastElementChild;
            
            // Collapse the condition
            const conditionCardBody = conditionEl.querySelector('.card-body');
            const conditionToggleButton = conditionEl.querySelector('.toggle-condition');
            if (conditionCardBody && conditionToggleButton) {
                conditionCardBody.style.display = 'none';
                conditionToggleButton.innerHTML = '<span class="material-symbols-outlined expand_circle_down">expand_circle_down</span>';
            }

            condition.if.forEach((trigger, index) => {
                if (index > 0) addTrigger(conditionEl.id);
                const triggerEl = conditionEl.querySelectorAll('.condition-triggers > div')[index];
                triggerEl.querySelector('.trigger-category').value = trigger.category;
                updateTriggerValues(triggerEl.querySelector('.trigger-category'));
                const valuesElement = triggerEl.querySelector('.trigger-values > *');
                if (valuesElement.tagName === 'SELECT') {
                    trigger.values.forEach(value => {
                        const option = valuesElement.querySelector(`option[value="${value}"]`);
                        if (option) option.selected = true;
                    });
                } else {
                    valuesElement.value = trigger.values.join(', ');
                }
            });

            condition.then.forEach((action, index) => {
                if (index > 0) addAction(conditionEl.id);
                const actionEl = conditionEl.querySelectorAll('.condition-actions > div')[index];
                actionEl.querySelector('.action-type').value = action.type;
                actionEl.querySelector('.action-category').value = action.category;
                updateActionValues(actionEl.querySelector('.action-category'));
                const valuesElement = actionEl.querySelector('.action-values > *:first-child');
                const wholeCategoryCheckbox = actionEl.querySelector('.action-values input[type="checkbox"]');
                
                if (action.applyToWholeCategory) {
                    wholeCategoryCheckbox.checked = true;
                } else {
                    if (valuesElement.tagName === 'SELECT') {
                        action.values.forEach(value => {
                            const option = valuesElement.querySelector(`option[value="${value}"]`);
                            if (option) option.selected = true;
                        });
                    } else {
                        valuesElement.value = action.values.join(', ');
                    }
                }
            });
        });
    }
}

/**
 * Expose functions
 * @type {{getFormConfig: getFormConfig, exportConfig: exportConfig, importConfig: importConfig, renderConfig: renderConfig}}
 * @description Exposes the getFormConfig, exportConfig, importConfig, and renderConfig functions.
 */
// Expose necessary functions
window.getFormConfig = getFormConfig;
window.exportConfig = exportConfig;
window.importConfig = importConfig;
window.renderConfig = renderConfig;
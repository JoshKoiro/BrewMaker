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
            const optionsInput = rowEl.querySelector('td:nth-child(4) input');

            if (fieldNameInput && fieldTypeSelect) {
                const fieldType = fieldTypeSelect.value;
                const category = {
                    category: formatFieldName(fieldNameInput.value),
                    type: fieldType,
                    required: requiredCheckbox ? requiredCheckbox.checked : false,
                    options: (fieldType === 'select' && optionsInput) 
                        ? optionsInput.value.split(',').map(o => o.trim()).filter(o => o !== '') 
                        : []
                };
                group.categories.push(category);
            }
        });

        config.groups.push(group);
    });

    config.conditions = getConditionsConfig();

    return config;
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
        groupEl.querySelector('.card-header input[placeholder="Group Heading"]').value = group.heading;
        groupEl.querySelector('.card-header input[placeholder="Icon Name"]').value = group.icon;

        // Collapse the group
        const groupCardBody = groupEl.querySelector('.card-body');
        const groupToggleButton = groupEl.querySelector('.toggle-group');
        if (groupCardBody && groupToggleButton) {
            groupCardBody.style.display = 'none';
            groupToggleButton.textContent = 'Expand';
        }

        group.categories.forEach(category => {
            createField(groupEl);
            const rowEl = groupEl.querySelector('tbody tr:last-child');
            rowEl.querySelector('td:nth-child(1) input').value = category.category;
            const fieldTypeSelect = rowEl.querySelector('td:nth-child(2) select');
            fieldTypeSelect.value = category.type;
            rowEl.querySelector('td:nth-child(3) input[type="checkbox"]').checked = category.required;
            const optionsInput = rowEl.querySelector('td:nth-child(4) input');
            optionsInput.value = category.options.join(', ');
            toggleOptionsInput(fieldTypeSelect);
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
                conditionToggleButton.textContent = 'Expand';
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

// Helper function to format field names
function formatFieldName(name) {
    return name.toLowerCase().replace(/\s+/g, '_');
}

// Expose necessary functions
window.getFormConfig = getFormConfig;
window.exportConfig = exportConfig;
window.importConfig = importConfig;
window.renderConfig = renderConfig;
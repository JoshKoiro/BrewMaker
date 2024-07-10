function getFormConfig() {
    const config = { 
        groups: [],
        conditions: []
    };
    
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

    // Render conditions
    conditionsContainer.innerHTML = '';
    if (config.conditions) {
        config.conditions.forEach(condition => {
            addCondition();
            const conditionEl = conditionsContainer.lastElementChild;
            
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

// Expose necessary functions
window.getFormConfig = getFormConfig;
window.exportConfig = exportConfig;
window.importConfig = importConfig;
window.renderConfig = renderConfig;
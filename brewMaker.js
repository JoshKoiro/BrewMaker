document.addEventListener('DOMContentLoaded', function () {
    let formConfig = { groups: [] };
    const fieldsTable = document.getElementById('fields-table').getElementsByTagName('tbody')[0];

    document.getElementById('add-field').addEventListener('click', () => {
        const row = fieldsTable.insertRow();
        row.innerHTML = `
            <td><input type="text" class="form-control field-name"></td>
            <td>
                <select class="form-control field-type">
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                </select>
            </td>
            <td><input type="checkbox" class="field-required"></td>
            <td><input type="text" class="form-control field-options" placeholder="Comma-separated"></td>
            <td><button type="button" class="btn btn-danger btn-sm remove-field">Remove</button></td>
        `;

        row.querySelector('.remove-field').addEventListener('click', () => {
            fieldsTable.deleteRow(row.rowIndex - 1);
        });
    });

    document.getElementById('add-heading').addEventListener('click', () => {
        const headingTitle = document.getElementById('heading-title').value;
        const headingIcon = document.getElementById('heading-icon').value;
        const categories = Array.from(fieldsTable.rows).map(row => {
            return {
                category: row.querySelector('.field-name').value,
                type: row.querySelector('.field-type').value,
                required: row.querySelector('.field-required').checked,
                options: row.querySelector('.field-options').value.split(',')
            };
        });

        formConfig.groups.push({
            heading: headingTitle,
            icon: headingIcon,
            categories: categories
        });

        document.getElementById('heading-title').value = '';
        document.getElementById('heading-icon').value = '';
        fieldsTable.innerHTML = '';
    });

    document.getElementById('export-config').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(formConfig, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formConfig.json';
        a.click();
    });

    document.getElementById('import-config-btn').addEventListener('click', () => {
        document.getElementById('import-config').click();
    });

    document.getElementById('import-config').addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            formConfig = JSON.parse(e.target.result);
            document.getElementById('output').textContent = JSON.stringify(formConfig, null, 2);
        };
        reader.readAsText(file);
    });
});

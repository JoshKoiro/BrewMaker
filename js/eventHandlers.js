const formBuilder = document.getElementById('formBuilder');
const groupsContainer = document.getElementById('groups');
const addGroupBtn = document.getElementById('addGroup');
const exportJSBtn = document.getElementById('exportJS');
const exportJSONBtn = document.getElementById('exportJSON');
const importFileInput = document.getElementById('importFile');

function initializeEventListeners() {
    addGroupBtn.addEventListener('click', createGroup);
    exportJSBtn.addEventListener('click', () => exportConfig('js'));
    exportJSONBtn.addEventListener('click', () => exportConfig('json'));
    importFileInput.addEventListener('change', (e) => importConfig(e.target.files[0]));
}

// Call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEventListeners);
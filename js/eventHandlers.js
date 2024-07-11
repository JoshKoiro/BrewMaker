const formBuilder = document.getElementById('formBuilder');
const groupsContainer = document.getElementById('groups');
const addGroupBtn = document.getElementById('addGroup');
const exportJSBtn = document.getElementById('exportJS');
const exportJSONBtn = document.getElementById('exportJSON');
const importFileInput = document.getElementById('importFile');
const darkModeToggle = document.getElementById('darkModeToggle');

function initializeEventListeners() {
    addGroupBtn.addEventListener('click', createGroup);
    exportJSBtn.addEventListener('click', () => exportConfig('js'));
    exportJSONBtn.addEventListener('click', () => exportConfig('json'));
    importFileInput.addEventListener('change', (e) => importConfig(e.target.files[0]));

    // Initialize conditions
    initializeConditions();

    // Dark mode toggle
    darkModeToggle.addEventListener('click', toggleDarkMode);

    // Load saved dark mode preference
    if (localStorage.getItem('darkMode') === 'dark') {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        updateDarkModeButton(true);
    }
}

function toggleDarkMode() {
    const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const newMode = isDarkMode ? 'light' : 'dark';
    const button = document.getElementById('darkModeToggle');
    if (newMode === 'dark') {
        button.innerHTML = '<i class="material-symbols-outlined light_mode">light_mode</i>'
    } else {
        button.innerHTML = '<i class="material-symbols-outlined dark_mode">dark_mode</i>'
    }
    document.documentElement.setAttribute('data-bs-theme', newMode);
    localStorage.setItem('darkMode', newMode);
    updateDarkModeButton(!isDarkMode);
}

function updateDarkModeButton(isDarkMode) {
    const button = document.getElementById('darkModeToggle');
    if (isDarkMode) {
        button.innerHTML = '<i class="material-symbols-outlined light_mode">light_mode</i>'
    } else {
       button.innerHTML = '<i class="material-symbols-outlined dark_mode">dark_mode</i>'
    }
}

// Call this function when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEventListeners);
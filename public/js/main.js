import { LocalStorageStrategy } from './modules/storage/localStorageStrategy.js';
import { StorageManager } from './modules/storage/storageManager.js';
import { Notifications } from './modules/notifications/notifications.js';

/**
 * Initialize the storage manager with the LocalStorage strategy.
 */
const storageManager = new StorageManager(new LocalStorageStrategy());

/**
 * Data arrays for dropdown options. Quite possibly these will come from separate date files in the future.
 * @type {Array<string>}
 */
const senates = ['UBC Vancouver', 'UBC Okanagan'];
const departments = ['Computer Science', 'English', 'Law'];
const courses = {
    'Computer Science': ['CPSC201', 'CPSC210', 'CPSC301'],
    'English': ['ENGL101', 'ENGL201', 'ENGL301'],
    'Law': ['LAW401', 'LAW402', 'LAW403']
};

/**
 * Get DOM elements for interactive components.
 */
const senateElement     = document.getElementById('senate');
const departmentElement = document.getElementById('department');
const courseElement     = document.getElementById('course');
const optionsDiv        = document.getElementById('options');
const optionSelect      = document.getElementById('option-select');
const optionSave        = document.getElementById('option-save');

/**
 * Load saved values from local storage or use defaults.
 * @type {string}
 */
let selectedSenate     = storageManager.load('senate') || 'UBC Vancouver';
let selectedDepartment = storageManager.load('department') || 'Computer Science';
let selectedCourse     = storageManager.load('course') || 'CPSC210';

/**
 * Set the text content of the interactive elements.
 */
senateElement.textContent     = selectedSenate.toUpperCase();
departmentElement.textContent = selectedDepartment.toUpperCase();
courseElement.textContent     = selectedCourse;

/**
 * Add event listeners to the interactive elements.
 */
senateElement.addEventListener('click', () => {
    showOptions(senates, 'senate');
});

departmentElement.addEventListener('click', () => {
    showOptions(departments, 'department');
});

courseElement.addEventListener('click', () => {
    showOptions(courses[selectedDepartment], 'course');
});

/**
 * Event listener for saving the selected option.
 */
optionSave.addEventListener('click', () => {
    const selectedOption = optionSelect.value;
    const type = optionSelect.dataset.type;

    if (type === 'senate') {
        selectedSenate = selectedOption;
        senateElement.textContent = selectedSenate.toUpperCase();
        storageManager.save('senate', selectedSenate);
    } else if (type === 'department') {
        selectedDepartment = selectedOption;
        departmentElement.textContent = selectedDepartment.toUpperCase();
        storageManager.save('department', selectedDepartment);

        // Update course selection based on new department
        selectedCourse = courses[selectedDepartment][0];
        courseElement.textContent = selectedCourse;
        storageManager.save('course', selectedCourse);
    } else if (type === 'course') {
        selectedCourse = selectedOption;
        courseElement.textContent = selectedCourse;
        storageManager.save('course', selectedCourse);
    }

    // Show a notification for the saved selection
    Notifications.show(`${type.charAt(0).toUpperCase() + type.slice(1)} saved: ${selectedOption}`, 'info');
    // Hide the options div
    optionsDiv.classList.add('hidden');
});

/**
 * Function to display options in a dropdown.
 * @param {Array<string>} options - Array of options to display.
 * @param {string} type - The type of options (senate, department, course).
 */
function showOptions(options, type) {
    optionSelect.innerHTML = ''; // Clear existing options
    const currentSelection = type === 'senate' ? selectedSenate : type === 'department' ? selectedDepartment : selectedCourse;

    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        if (option === currentSelection) {
            opt.selected = true; // Set the option as selected if it matches the current selection
        }
        optionSelect.appendChild(opt);
    });
    optionSelect.dataset.type = type; // Set the type in the dataset
    optionsDiv.classList.remove('hidden'); // Show the options div
}

// Add this at the beginning of your main.js file
if (window.location.pathname === '/welcome') {
    window.location.href = '/welcome.html';
}
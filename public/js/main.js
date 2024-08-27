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
const senateElement     = document.getElementById('senate-display');
const departmentElement = document.getElementById('department-display');
const courseElement     = document.getElementById('course-display');
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

import { StorageManager } from '../modules/storage/storageManager.js';

class Onboarding {
    constructor() {
        this.storageManager = new StorageManager();
        this.currentStep = 'welcome';
        this.steps = ['welcome', 'senate', 'department', 'course'];
        this.init();
    }

    init() {
        this.cacheDOMElements();
        this.bindEvents();
        this.populateDropdowns();
    }

    cacheDOMElements() {
        this.startButton = document.getElementById('start-onboarding');
        this.nextSenateButton = document.getElementById('next-senate');
        this.nextDepartmentButton = document.getElementById('next-department');
        this.finishButton = document.getElementById('finish-onboarding');
        this.senateSelect = document.getElementById('senate');
        this.departmentSelect = document.getElementById('department');
        this.courseSelect = document.getElementById('course');
    }

    bindEvents() {
        this.startButton.addEventListener('click', () => this.nextStep());
        this.nextSenateButton.addEventListener('click', () => this.nextStep());
        this.nextDepartmentButton.addEventListener('click', () => this.nextStep());
        this.finishButton.addEventListener('click', () => this.finishOnboarding());

        this.senateSelect.addEventListener('change', () => this.enableNextButton(this.nextSenateButton));
        this.departmentSelect.addEventListener('change', () => this.enableNextButton(this.nextDepartmentButton));
        this.courseSelect.addEventListener('change', () => this.enableNextButton(this.finishButton));
    }

    populateDropdowns() {
        // Populate senate options
        const senateOptions = ['Vancouver Senate', 'Okanagan Senate'];
        this.populateDropdown(this.senateSelect, senateOptions);

        // Populate department options (example data)
        const departmentOptions = ['Computer Science', 'Mathematics', 'Physics'];
        this.populateDropdown(this.departmentSelect, departmentOptions);

        // Populate course options (example data)
        const courseOptions = ['CPSC 110', 'CPSC 121', 'MATH 100'];
        this.populateDropdown(this.courseSelect, courseOptions);
    }

    populateDropdown(selectElement, options) {
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    nextStep() {
        const currentStepElement = document.getElementById(`${this.currentStep}-selection`);
        if (currentStepElement) {
            currentStepElement.hidden = true;
        }

        const currentIndex = this.steps.indexOf(this.currentStep);
        if (currentIndex < this.steps.length - 1) {
            this.currentStep = this.steps[currentIndex + 1];
            const nextStepElement = document.getElementById(`${this.currentStep}-selection`);
            if (nextStepElement) {
                nextStepElement.hidden = false;
            }
        }
    }

    enableNextButton(button) {
        button.disabled = false;
    }

    finishOnboarding() {
        const selectedSenate = this.senateSelect.value;
        const selectedDepartment = this.departmentSelect.value;
        const selectedCourse = this.courseSelect.value;

        this.storageManager.save('senate', selectedSenate);
        this.storageManager.save('department', selectedDepartment);
        this.storageManager.save('course', selectedCourse);

        // Set the onboardingComplete flag
        this.storageManager.save('onboardingComplete', true);

        // Redirect to the main application page
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Onboarding();
});

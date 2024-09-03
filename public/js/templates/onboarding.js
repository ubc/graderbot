import { StorageManager } from '../modules/storage/storageManager.js';

class Onboarding {
    constructor() {
        this.storageManager = new StorageManager();
        this.currentStep = 'welcome';
        this.steps = ['welcome', 'senate', 'department', 'course'];
        this.mockData = {
            'UBC Vancouver': {
                'Applied Science': {
                    'Biomedical Engineering': [
                        'BME 101', 'BME 102', 'BME 201'
                    ],
                    'Electrical and Computer Engineering': [
                        'ECE 101', 'ECE 201', 'ECE 301'
                    ]
                },
                'Arts': {
                    'Anthropology': [
                        'ANTH 101', 'ANTH 201', 'ANTH 301'
                    ],
                    'History': [
                        'HIST 101', 'HIST 201', 'HIST 301'
                    ]
                },
                'Education': {
                    'Educational and Counselling Psychology, and Special Education': [
                        'ECPS 101', 'ECPS 201', 'ECPS 301'
                    ],
                    'Curriculum and Pedagogy': [
                        'EDCP 101', 'EDCP 201', 'EDCP 301'
                    ]
                },
                'Forestry': {
                    'Forest Sciences': [
                        'FRST 101', 'FRST 201', 'FRST 301'
                    ],
                    'Wood Science': [
                        'WOOD 101', 'WOOD 201', 'WOOD 301'
                    ]
                },
                'Medicine': {
                    'Endocrinology': [
                        'ENDO 101', 'ENDO 201', 'ENDO 301'
                    ],
                    'Medicine': [
                        'MED 101', 'MED 201', 'MED 301'
                    ]
                },
                'Science': {
                    'Earth, Ocean, and Atmosphere Science': [
                        'EOAS 101', 'EOAS 201', 'EOAS 301'
                    ],
                    'Computer Science': [
                        'CPSC 101', 'CPSC 201', 'CPSC 301'
                    ]
                },
            },
            'UBC Okanagan': {
                'Arts and Social Sciences': {
                    'History and Sociology': [
                        'HISO 101', 'HISO 201', 'HISO 301'
                    ],
                    'Psychology': [
                        'PSYC 101', 'PSYC 201', 'PSYC 301'
                    ]
                },
                'Science': {
                    'Chemistry': [
                        'CHEM 101', 'CHEM 201', 'CHEM 301'
                    ],
                    'Earth, Environmental and Geographic Sciences': [
                        'EENG 101', 'EENG 201', 'EENG 301'
                    ]
                },
            }
        };
        this.init();
    }

    init() {
        this.cacheDOMElements();
        this.bindEvents();
        this.populateSenateDropdown();
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

        this.senateSelect.addEventListener('change', () => {
            this.enableNextButton(this.nextSenateButton);
            this.populateDepartmentDropdown();
        });
        this.departmentSelect.addEventListener('change', () => {
            this.enableNextButton(this.nextDepartmentButton);
            this.populateCourseDropdown();
        });
        this.courseSelect.addEventListener('change', () => this.enableNextButton(this.finishButton));
    }

    mockAPICall(endpoint, data = null) {
        return new Promise((resolve) => {
            setTimeout(() => {
                switch(endpoint) {
                    case 'getSenates':
                        resolve(Object.keys(this.mockData));
                        break;
                    case 'getDepartments':
                        resolve(this.getFlattenedDepartments(this.mockData[data]));
                        break;
                    case 'getCourses':
                        const [senate, department] = data.split('|');
                        resolve(this.getCoursesByDepartment(senate, department));
                        break;
                }
            }, 300); // Simulate network delay
        });
    }

    getFlattenedDepartments(senateData) {
        const flattenedDepartments = [];
        for (const [faculty, departments] of Object.entries(senateData)) {
            flattenedDepartments.push({ faculty, departments: Object.keys(departments) });
        }
        return flattenedDepartments;
    }

    getCoursesByDepartment(senate, department) {
        for (const faculty of Object.values(this.mockData[senate])) {
            if (department in faculty) {
                return faculty[department];
            }
        }
        return [];
    }

    async populateSenateDropdown() {
        const senates = await this.mockAPICall('getSenates');
        this.populateDropdown(this.senateSelect, senates);
    }

    async populateDepartmentDropdown() {
        const selectedSenate = this.senateSelect.value;
        const departments = await this.mockAPICall('getDepartments', selectedSenate);
        this.populateGroupedDropdown(this.departmentSelect, departments);
    }

    async populateCourseDropdown() {
        const selectedSenate = this.senateSelect.value;
        const selectedDepartment = this.departmentSelect.value;
        const courses = await this.mockAPICall('getCourses', `${selectedSenate}|${selectedDepartment}`);
        this.populateDropdown(this.courseSelect, courses);
    }

    populateDropdown(selectElement, options) {
        selectElement.innerHTML = '<option value="">Please select</option>';
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            selectElement.appendChild(optionElement);
        });
    }

    populateGroupedDropdown(selectElement, groups) {
        selectElement.innerHTML = '<option value="">Please select</option>';
        groups.forEach(group => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = group.faculty;
            group.departments.forEach(department => {
                const option = document.createElement('option');
                option.value = department;
                option.textContent = department;
                optgroup.appendChild(option);
            });
            selectElement.appendChild(optgroup);
        });
    }

    nextStep() {
        const currentStepElement = document.getElementById(`${this.currentStep}-selection`);
        if (currentStepElement) {
            currentStepElement.hidden = true;
        }

        this.startButton.hidden = true;

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

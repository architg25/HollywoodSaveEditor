/**
 * Hollywood Save Editor - HollyJson Style Implementation
 * Recreates the exact functionality and workflow of HollyJson
 */

import { SaveFormatManager, NewSaveAdapter } from './saveFormat.js';
import { NameResolver } from './nameResolver.js';

class HollyJsonApp {
    constructor() {
        this.saveData = null;
        this.adapter = null;
        this.nameResolver = new NameResolver();
        this.formatManager = new SaveFormatManager();

        // Character management
        this.allCharacters = [];
        this.filteredCharacters = [];
        this.selectedCharacter = null;

        // Studio info
        this.studioInfo = {};

        // Filter states (matching HollyJson)
        this.filters = {
            studio: '',
            search: '',
            profession: '',
            showOnlyDead: false,
            showOnlyTalent: false
        };

        // Available data
        this.studioList = [];
        this.professionList = [];

        // HollyJson trait labels
        this.availableTraits = [
            "HARDWORKING", "LAZY", "DISCIPLINED", "UNDISCIPLINED",
            "PERFECTIONIST", "INDIFFERENT", "HOTHEADED", "CALM",
            "LEADER", "TEAM_PLAYER", "OPEN_MINDED", "RACIST",
            "MISOGYNIST", "XENOPHOBE", "DEMANDING", "MODEST",
            "ARROGANT", "SIMPLE", "HEARTBREAKER", "CHASTE",
            "CHEERY", "MELANCHOLIC", "ALCOHOLIC", "LUDOMANIAC",
            "JUNKIE", "UNWANTED_ACTOR", "UNTOUCHABLE", "STERILE",
            "IMAGE_VIVID", "IMAGE_SOPHISTIC", "IMMORTAL", "SUPER_IMMORTAL"
        ];

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadNameMap();
        this.populateTraitSelector();
    }

    /**
     * Setup all event listeners (HollyJson style)
     */
    setupEventListeners() {
        // File loading
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const filePickerBtn = document.getElementById('filePickerBtn');

        dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        dropZone.addEventListener('drop', this.handleFileDrop.bind(this));
        dropZone.addEventListener('click', () => fileInput.click());

        filePickerBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Studio controls
        document.getElementById('budgetInput').addEventListener('change', this.updateStudioInfo.bind(this));
        document.getElementById('cashInput').addEventListener('change', this.updateStudioInfo.bind(this));
        document.getElementById('reputationInput').addEventListener('change', this.updateStudioInfo.bind(this));
        document.getElementById('influenceInput').addEventListener('change', this.updateStudioInfo.bind(this));

        // Filter controls
        document.getElementById('studioFilter').addEventListener('change', this.updateFilters.bind(this));
        document.getElementById('searchInput').addEventListener('input', this.updateFilters.bind(this));
        document.getElementById('professionFilter').addEventListener('change', this.updateFilters.bind(this));
        document.getElementById('showOnlyDead').addEventListener('change', this.updateFilters.bind(this));
        document.getElementById('showOnlyTalent').addEventListener('change', this.updateFilters.bind(this));

        // Character table selection
        document.getElementById('characterTable').addEventListener('click', this.handleCharacterSelection.bind(this));

        // Character detail editing
        this.setupCharacterDetailListeners();

        // Bulk operations (Macros)
        this.setupMacroListeners();

        // Download
        document.getElementById('downloadBtn').addEventListener('click', this.downloadSave.bind(this));
    }

    setupCharacterDetailListeners() {
        // Character info
        document.getElementById('charName').addEventListener('change', this.updateSelectedCharacter.bind(this));
        document.getElementById('charStudio').addEventListener('change', this.updateSelectedCharacter.bind(this));
        document.getElementById('charMood').addEventListener('change', this.updateSelectedCharacter.bind(this));
        document.getElementById('charAttitude').addEventListener('change', this.updateSelectedCharacter.bind(this));
        document.getElementById('charIsDead').addEventListener('change', this.updateSelectedCharacter.bind(this));
        document.getElementById('charAge').addEventListener('change', this.updateSelectedCharacter.bind(this));

        // Profession
        document.getElementById('charLimit').addEventListener('change', this.updateSelectedCharacter.bind(this));
        document.getElementById('charSkill').addEventListener('change', this.updateSelectedCharacter.bind(this));

        // Contract
        document.getElementById('contractDaysLeft').addEventListener('change', this.updateSelectedCharacter.bind(this));
        document.getElementById('contractYears').addEventListener('change', this.updateSelectedCharacter.bind(this));
        document.getElementById('contractInitFee').addEventListener('change', this.updateSelectedCharacter.bind(this));
        document.getElementById('contractMonthlySalary').addEventListener('change', this.updateSelectedCharacter.bind(this));
        document.getElementById('contractWeeklySalary').addEventListener('change', this.updateSelectedCharacter.bind(this));

        // Single character action buttons (↑)
        document.getElementById('maxMoodAttSingleBtn').addEventListener('click', () => this.setMaxMoodAttSingle());
        document.getElementById('maxLimitSingleBtn').addEventListener('click', () => this.setMaxLimitSingle());
        document.getElementById('maxSkillSingleBtn').addEventListener('click', () => this.setMaxSkillSingle());
        document.getElementById('maxDaysSingleBtn').addEventListener('click', () => this.setMaxDaysSingle());

        // Traits
        document.getElementById('addTraitBtn').addEventListener('click', this.addTrait.bind(this));
    }

    setupMacroListeners() {
        // Macros popup toggle
        document.getElementById('macrosBtn').addEventListener('click', this.toggleMacrosPopup.bind(this));

        // Bulk macro operations
        document.getElementById('maxMoodAttBtn').addEventListener('click', () => this.bulkSetMaxMoodAtt());
        document.getElementById('maxDaysBtn').addEventListener('click', () => this.bulkSetMaxDays());
        document.getElementById('maxSkillBtn').addEventListener('click', () => this.bulkSetMaxSkill());
        document.getElementById('maxLimitBtn').addEventListener('click', () => this.bulkSetMaxLimit());

        // Age setting
        document.getElementById('setYoungBtn').addEventListener('click', () => this.bulkSetAge('Y'));
        document.getElementById('setMidBtn').addEventListener('click', () => this.bulkSetAge('M'));
        document.getElementById('setOldBtn').addEventListener('click', () => this.bulkSetAge('O'));

        // Close popup when clicking outside
        document.addEventListener('click', (e) => {
            const popup = document.getElementById('macrosPopup');
            const btn = document.getElementById('macrosBtn');
            if (!popup.contains(e.target) && !btn.contains(e.target)) {
                popup.style.display = 'none';
            }
        });
    }

    /**
     * File loading (matching HollyJson behavior)
     */
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('dragover');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.loadSaveFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadSaveFile(file);
        }
    }

    async loadSaveFile(file) {
        try {
            const text = await file.text();
            const saveData = JSON.parse(text);

            const validation = this.formatManager.validateSave(saveData);

            if (!validation.isValid) {
                this.showMessage('Failed to load save: ' + validation.error, 'error');
                return;
            }

            this.saveData = saveData;
            this.adapter = this.formatManager.createAdapter(saveData);

            // Load all data
            this.loadCharacters();
            this.loadStudioInfo();
            this.populateStudioLists();
            this.populateProfessionList();

            // Show editor
            this.showEditor();
            this.refreshCharacterList();

            this.showMessage(`Save loaded successfully! Found ${this.allCharacters.length} characters.`, 'success');

        } catch (error) {
            this.showMessage('Failed to parse save file: ' + error.message, 'error');
        }
    }

    /**
     * Data loading (HollyJson style)
     */
    loadCharacters() {
        const rawCharacters = this.adapter.getCharacters();

        this.allCharacters = rawCharacters.map(char => ({
            // Core character data
            id: char.id,
            firstNameId: char.firstNameId,
            lastNameId: char.lastNameId,
            birthDate: char.birthDate,
            deathDate: char.deathDate,
            gender: char.gender,
            studioId: char.studioId || 'NONE',

            // Character state (newSave format uses string values)
            mood: parseFloat(char.mood || 0),
            attitude: parseFloat(char.attitude || 0),

            // Skills and limits (newSave has both "limit" and "Limit")
            limit: parseFloat(char.Limit || char.limit || 0),
            professions: char.professions || {},

            // Traits/Labels (newSave uses "labels" array)
            labels: char.labels || [],

            // Contract (can be null in newSave)
            contract: char.contract || {},

            // Calculated fields
            age: this.calculateAge(char),
            isDead: char.deathDate && char.deathDate !== '01-01-0001',

            // Helper fields for display
            primaryProfession: this.getPrimaryProfession(char.professions),

            // Reference to original for editing
            _original: char
        }));
    }

    loadStudioInfo() {
        this.studioInfo = this.adapter.getStudioInfo();
        this.populateStudioControls();
    }

    populateStudioControls() {
        document.getElementById('budgetInput').value = this.studioInfo.budget || 0;
        document.getElementById('cashInput').value = this.studioInfo.cash || 0;
        document.getElementById('reputationInput').value = (this.studioInfo.reputation || 0).toFixed(1);
        document.getElementById('influenceInput').value = this.studioInfo.influence || 0;
    }

    populateStudioLists() {
        // Get unique studios
        const studios = new Set(['All']);
        this.allCharacters.forEach(char => {
            if (char.studioId && char.studioId !== 'NONE') {
                studios.add(char.studioId);
            }
        });

        this.studioList = Array.from(studios);

        // Populate filter dropdown
        const studioFilter = document.getElementById('studioFilter');
        studioFilter.innerHTML = '<option value="">All Studios</option>';

        this.studioList.forEach(studio => {
            if (studio !== 'All') {
                const option = document.createElement('option');
                option.value = studio;
                option.textContent = this.getStudioDisplayName(studio);
                studioFilter.appendChild(option);
            }
        });

        // Populate character studio dropdown
        const charStudio = document.getElementById('charStudio');
        charStudio.innerHTML = '<option value="">Select Studio</option>';

        this.studioList.forEach(studio => {
            if (studio !== 'All') {
                const option = document.createElement('option');
                option.value = studio;
                option.textContent = this.getStudioDisplayName(studio);
                charStudio.appendChild(option);
            }
        });
    }

    populateProfessionList() {
        // Get unique professions
        const professions = new Set(['All']);

        this.allCharacters.forEach(char => {
            if (char.primaryProfession) {
                professions.add(char.primaryProfession);
            }
        });

        this.professionList = Array.from(professions);

        // Populate filter dropdown
        const professionFilter = document.getElementById('professionFilter');
        professionFilter.innerHTML = '<option value="">All Professions</option>';

        this.professionList.forEach(prof => {
            if (prof !== 'All') {
                const option = document.createElement('option');
                option.value = prof;
                option.textContent = this.formatProfessionName(prof);
                professionFilter.appendChild(option);
            }
        });
    }

    populateTraitSelector() {
        const availableTraits = document.getElementById('availableTraits');
        availableTraits.innerHTML = '<option value="">Select trait...</option>';

        this.availableTraits.forEach(trait => {
            const option = document.createElement('option');
            option.value = trait;
            option.textContent = trait.replace(/_/g, ' ');
            availableTraits.appendChild(option);
        });
    }

    /**
     * Character filtering (HollyJson logic)
     */
    updateFilters() {
        this.filters.studio = document.getElementById('studioFilter').value;
        this.filters.search = document.getElementById('searchInput').value.toLowerCase();
        this.filters.profession = document.getElementById('professionFilter').value;
        this.filters.showOnlyDead = document.getElementById('showOnlyDead').checked;
        this.filters.showOnlyTalent = document.getElementById('showOnlyTalent').checked;

        this.applyFilters();
        this.refreshCharacterList();
    }

    applyFilters() {
        this.filteredCharacters = this.allCharacters.filter(char => {
            // Studio filter
            if (this.filters.studio && char.studioId !== this.filters.studio) {
                return false;
            }

            // Search filter
            if (this.filters.search) {
                const name = this.getCharacterDisplayName(char).toLowerCase();
                if (!name.includes(this.filters.search)) {
                    return false;
                }
            }

            // Profession filter
            if (this.filters.profession && char.primaryProfession !== this.filters.profession) {
                return false;
            }

            // Dead filter
            if (this.filters.showOnlyDead && !char.isDead) {
                return false;
            }

            // Talent filter
            if (this.filters.showOnlyTalent && !this.isCharacterTalent(char)) {
                return false;
            }

            return true;
        });

        // If current selection is not in filtered list, select first one
        if (this.selectedCharacter && !this.filteredCharacters.find(c => c.id === this.selectedCharacter.id)) {
            this.selectedCharacter = this.filteredCharacters.length > 0 ? this.filteredCharacters[0] : null;
            this.populateCharacterDetails();
        }
    }

    /**
     * Character list display (HollyJson table)
     */
    refreshCharacterList() {
        const tbody = document.getElementById('characterTableBody');
        tbody.innerHTML = '';

        this.filteredCharacters.forEach(char => {
            const row = this.createCharacterRow(char);
            tbody.appendChild(row);
        });

        // Select first character if none selected
        if (!this.selectedCharacter && this.filteredCharacters.length > 0) {
            this.selectCharacter(this.filteredCharacters[0]);
        }
    }

    createCharacterRow(character) {
        const row = document.createElement('tr');
        row.dataset.characterId = character.id;

        if (this.selectedCharacter && this.selectedCharacter.id === character.id) {
            row.classList.add('selected');
        }

        const skill = character.professions[character.primaryProfession] || 0;
        const contract = character.contract || {};
        const daysLeft = contract.DaysLeft || contract.daysLeft || 0;
        const contractType = contract.contractType || 0;
        const daysDisplay = contractType === 2 ? '∞' : daysLeft.toString();

        row.innerHTML = `
            <td title="${this.getCharacterDisplayName(character)}">${this.getCharacterDisplayName(character)}</td>
            <td title="${this.formatProfessionName(character.primaryProfession)}">${this.formatProfessionName(character.primaryProfession)}</td>
            <td>${character.limit.toFixed(2)}</td>
            <td>${parseFloat(skill).toFixed(2)}</td>
            <td>${character.age || 'Unknown'}</td>
            <td>${daysDisplay}</td>
        `;

        return row;
    }

    handleCharacterSelection(e) {
        const row = e.target.closest('tr');
        if (!row || !row.dataset.characterId) return;

        const characterId = parseInt(row.dataset.characterId);
        const character = this.filteredCharacters.find(c => c.id === characterId);

        if (character) {
            this.selectCharacter(character);
        }
    }

    selectCharacter(character) {
        this.selectedCharacter = character;

        // Update table selection
        document.querySelectorAll('#characterTableBody tr').forEach(row => {
            row.classList.toggle('selected',
                parseInt(row.dataset.characterId) === character.id);
        });

        this.populateCharacterDetails();
    }

    /**
     * Character detail editing (HollyJson right panel)
     */
    populateCharacterDetails() {
        if (!this.selectedCharacter) {
            this.clearCharacterDetails();
            return;
        }

        const char = this.selectedCharacter;

        // Character info
        document.getElementById('charName').value = this.getCharacterDisplayName(char);
        document.getElementById('charStudio').value = char.studioId || '';
        document.getElementById('charMood').value = char.mood.toFixed(2);
        document.getElementById('charAttitude').value = char.attitude.toFixed(2);
        document.getElementById('charIsDead').checked = char.isDead;
        document.getElementById('charAge').value = char.age || '';
        document.getElementById('charBirthDate').textContent = this.formatDate(char.birthDate);

        // Profession
        document.getElementById('professionTitle').textContent = this.formatProfessionName(char.primaryProfession);
        document.getElementById('charLimit').value = char.limit.toFixed(1);

        const skill = char.professions[char.primaryProfession] || 0;
        document.getElementById('charSkill').value = parseFloat(skill).toFixed(2);

        // Contract (can be null in newSave)
        const contract = char.contract || {};
        document.getElementById('contractStartDate').textContent = this.formatDate(contract.dateOfSigning);
        document.getElementById('contractDaysLeft').value = contract.DaysLeft || contract.daysLeft || 0;
        document.getElementById('contractYears').value = contract.amount || 0;
        document.getElementById('contractInitFee').value = contract.initialFee || 0;
        document.getElementById('contractMonthlySalary').value = contract.monthlySalary || 0;
        document.getElementById('contractWeeklySalary').value = contract.weightToSalary || 0;

        // Traits
        this.populateCharacterTraits();
    }

    clearCharacterDetails() {
        // Clear all detail inputs
        document.getElementById('charName').value = '';
        document.getElementById('charStudio').value = '';
        document.getElementById('charMood').value = '';
        document.getElementById('charAttitude').value = '';
        document.getElementById('charIsDead').checked = false;
        document.getElementById('charAge').value = '';
        document.getElementById('charBirthDate').textContent = '';
        document.getElementById('professionTitle').textContent = 'None';
        document.getElementById('charLimit').value = '';
        document.getElementById('charSkill').value = '';
        document.getElementById('contractStartDate').textContent = '';
        document.getElementById('contractDaysLeft').value = '';
        document.getElementById('contractYears').value = '';
        document.getElementById('contractInitFee').value = '';
        document.getElementById('contractMonthlySalary').value = '';
        document.getElementById('contractWeeklySalary').value = '';
        document.getElementById('characterTraits').innerHTML = '';
    }

    populateCharacterTraits() {
        const traitsContainer = document.getElementById('characterTraits');
        traitsContainer.innerHTML = '';

        if (!this.selectedCharacter || !this.selectedCharacter.labels) return;

        this.selectedCharacter.labels.forEach(trait => {
            const traitItem = document.createElement('div');
            traitItem.className = 'trait-item';
            traitItem.innerHTML = `
                <span>${trait.replace(/_/g, ' ')}</span>
                <button onclick="window.hollyjsonApp.removeTrait('${trait}')">−</button>
            `;
            traitsContainer.appendChild(traitItem);
        });
    }

    updateSelectedCharacter(e) {
        if (!this.selectedCharacter) return;

        const field = e.target.id;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

        // Update character data based on field
        switch (field) {
            case 'charMood':
                this.selectedCharacter.mood = parseFloat(value) || 0;
                // newSave format stores mood/attitude as strings
                this.selectedCharacter._original.mood = this.selectedCharacter.mood.toFixed(3);
                break;
            case 'charAttitude':
                this.selectedCharacter.attitude = parseFloat(value) || 0;
                // newSave format stores mood/attitude as strings
                this.selectedCharacter._original.attitude = this.selectedCharacter.attitude.toFixed(3);
                break;
            case 'charIsDead':
                this.selectedCharacter.isDead = value;
                this.selectedCharacter.deathDate = value ? '01-01-1930' : '01-01-0001';
                this.selectedCharacter._original.deathDate = this.selectedCharacter.deathDate;
                break;
            case 'charAge':
                this.updateCharacterAge(parseInt(value));
                break;
            case 'charStudio':
                this.selectedCharacter.studioId = value;
                this.selectedCharacter._original.studioId = value;
                break;
            case 'charLimit':
                this.selectedCharacter.limit = parseFloat(value) || 0;
                // newSave format uses both "limit" and "Limit" (capital L)
                this.selectedCharacter._original.limit = this.selectedCharacter.limit.toFixed(3);
                this.selectedCharacter._original.Limit = this.selectedCharacter.limit.toFixed(3);
                break;
            case 'charSkill':
                const profession = this.selectedCharacter.primaryProfession;
                if (profession) {
                    this.selectedCharacter.professions[profession] = parseFloat(value) || 0;
                    // newSave format stores professions as strings with 3 decimal places
                    this.selectedCharacter._original.professions[profession] = (parseFloat(value) || 0).toFixed(3);
                }
                break;
            case 'contractDaysLeft':
                // Ensure contract object exists (can be null in newSave)
                if (!this.selectedCharacter.contract) {
                    this.selectedCharacter.contract = {};
                    this.selectedCharacter._original.contract = {};
                }
                this.selectedCharacter.contract.DaysLeft = parseInt(value) || 0;
                this.selectedCharacter._original.contract.DaysLeft = parseInt(value) || 0;
                break;
            case 'contractYears':
                if (!this.selectedCharacter.contract) {
                    this.selectedCharacter.contract = {};
                    this.selectedCharacter._original.contract = {};
                }
                this.selectedCharacter.contract.amount = parseInt(value) || 0;
                this.selectedCharacter._original.contract.amount = parseInt(value) || 0;
                break;
            case 'contractInitFee':
                if (!this.selectedCharacter.contract) {
                    this.selectedCharacter.contract = {};
                    this.selectedCharacter._original.contract = {};
                }
                this.selectedCharacter.contract.initialFee = parseInt(value) || 0;
                this.selectedCharacter._original.contract.initialFee = parseInt(value) || 0;
                break;
            case 'contractMonthlySalary':
                if (!this.selectedCharacter.contract) {
                    this.selectedCharacter.contract = {};
                    this.selectedCharacter._original.contract = {};
                }
                this.selectedCharacter.contract.monthlySalary = parseInt(value) || 0;
                this.selectedCharacter._original.contract.monthlySalary = parseInt(value) || 0;
                break;
            case 'contractWeeklySalary':
                if (!this.selectedCharacter.contract) {
                    this.selectedCharacter.contract = {};
                    this.selectedCharacter._original.contract = {};
                }
                this.selectedCharacter.contract.weightToSalary = parseInt(value) || 0;
                this.selectedCharacter._original.contract.weightToSalary = parseInt(value) || 0;
                break;
        }

        // Refresh the character list to show updated values
        this.refreshCharacterList();
    }

    updateCharacterAge(newAge) {
        if (!this.selectedCharacter || !newAge) return;

        const gameYear = this.formatManager.extractGameYear(this.saveData) || 1929;
        const newBirthYear = gameYear - newAge;

        // Parse existing birth date to keep day/month
        const birthDateParts = this.selectedCharacter.birthDate.split('-');
        if (birthDateParts.length === 3) {
            const newBirthDate = `${birthDateParts[0]}-${birthDateParts[1]}-${newBirthYear}`;
            this.selectedCharacter.birthDate = newBirthDate;
            this.selectedCharacter._original.birthDate = newBirthDate;
            this.selectedCharacter.age = newAge;

            // Update display
            document.getElementById('charBirthDate').textContent = this.formatDate(newBirthDate);
        }
    }

    /**
     * Studio management
     */
    updateStudioInfo(e) {
        const field = e.target.id.replace('Input', '');
        const value = parseFloat(e.target.value) || 0;

        this.studioInfo[field] = value;

        // Update in original save data (simplified)
        // In a full implementation, this would update the actual save structure
        this.showMessage(`Studio ${field} updated to ${value}`, 'success');
    }

    /**
     * Bulk operations (HollyJson Macros)
     */
    toggleMacrosPopup() {
        const popup = document.getElementById('macrosPopup');
        popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
    }

    bulkSetMaxMoodAtt() {
        this.filteredCharacters.forEach(char => {
            char.mood = 1.0;
            char.attitude = 1.0;
            // newSave format stores as strings
            char._original.mood = '1.000';
            char._original.attitude = '1.000';
        });

        this.populateCharacterDetails();
        this.showMessage(`Set max mood and attitude for ${this.filteredCharacters.length} characters`, 'success');
    }

    bulkSetMaxDays() {
        this.filteredCharacters.forEach(char => {
            // Ensure contract exists (can be null in newSave)
            if (!char.contract) {
                char.contract = {};
            }
            if (!char._original.contract) {
                char._original.contract = {};
            }
            char.contract.DaysLeft = 9999;
            char._original.contract.DaysLeft = 9999;
        });

        this.refreshCharacterList();
        this.populateCharacterDetails();
        this.showMessage(`Set max contract days for ${this.filteredCharacters.length} characters`, 'success');
    }

    bulkSetMaxSkill() {
        this.filteredCharacters.forEach(char => {
            if (char.primaryProfession && char.professions[char.primaryProfession] !== undefined) {
                char.professions[char.primaryProfession] = char.limit;
                char._original.professions[char.primaryProfession] = char.limit.toFixed(3);
            }
        });

        this.refreshCharacterList();
        this.populateCharacterDetails();
        this.showMessage(`Set skills to limit for ${this.filteredCharacters.length} characters`, 'success');
    }

    bulkSetMaxLimit() {
        this.filteredCharacters.forEach(char => {
            char.limit = 1.0;
            char._original.limit = '1.000';
            char._original.Limit = '1.000';
        });

        this.refreshCharacterList();
        this.populateCharacterDetails();
        this.showMessage(`Set max limit for ${this.filteredCharacters.length} characters`, 'success');
    }

    bulkSetAge(ageGroup) {
        let targetAge;
        switch (ageGroup) {
            case 'Y': targetAge = 25; break; // Young
            case 'M': targetAge = 45; break; // Mid
            case 'O': targetAge = 65; break; // Old
            default: return;
        }

        const gameYear = this.formatManager.extractGameYear(this.saveData) || 1929;

        this.filteredCharacters.forEach(char => {
            const newBirthYear = gameYear - targetAge;
            const birthDateParts = char.birthDate.split('-');
            if (birthDateParts.length === 3) {
                const newBirthDate = `${birthDateParts[0]}-${birthDateParts[1]}-${newBirthYear}`;
                char.birthDate = newBirthDate;
                char._original.birthDate = newBirthDate;
                char.age = targetAge;
            }
        });

        this.refreshCharacterList();
        this.populateCharacterDetails();
        this.showMessage(`Set age to ${ageGroup === 'Y' ? 'Young' : ageGroup === 'M' ? 'Mid' : 'Old'} for ${this.filteredCharacters.length} characters`, 'success');
    }

    /**
     * Single character actions (↑ buttons)
     */
    setMaxMoodAttSingle() {
        if (!this.selectedCharacter) return;

        this.selectedCharacter.mood = 1.0;
        this.selectedCharacter.attitude = 1.0;
        // newSave format stores as strings
        this.selectedCharacter._original.mood = '1.000';
        this.selectedCharacter._original.attitude = '1.000';

        this.populateCharacterDetails();
        this.showMessage('Set max mood and attitude', 'success');
    }

    setMaxLimitSingle() {
        if (!this.selectedCharacter) return;

        this.selectedCharacter.limit = 1.0;
        this.selectedCharacter._original.limit = '1.000';
        this.selectedCharacter._original.Limit = '1.000';

        this.populateCharacterDetails();
        this.refreshCharacterList();
        this.showMessage('Set max limit', 'success');
    }

    setMaxSkillSingle() {
        if (!this.selectedCharacter || !this.selectedCharacter.primaryProfession) return;

        const profession = this.selectedCharacter.primaryProfession;
        this.selectedCharacter.professions[profession] = this.selectedCharacter.limit;
        this.selectedCharacter._original.professions[profession] = this.selectedCharacter.limit.toFixed(3);

        this.populateCharacterDetails();
        this.refreshCharacterList();
        this.showMessage('Set skill to limit', 'success');
    }

    setMaxDaysSingle() {
        if (!this.selectedCharacter) return;

        // Ensure contract exists (can be null in newSave)
        if (!this.selectedCharacter.contract) {
            this.selectedCharacter.contract = {};
        }
        if (!this.selectedCharacter._original.contract) {
            this.selectedCharacter._original.contract = {};
        }

        this.selectedCharacter.contract.DaysLeft = 9999;
        this.selectedCharacter._original.contract.DaysLeft = 9999;

        this.populateCharacterDetails();
        this.refreshCharacterList();
        this.showMessage('Set max contract days', 'success');
    }

    /**
     * Trait management
     */
    addTrait() {
        if (!this.selectedCharacter) return;

        const traitSelect = document.getElementById('availableTraits');
        const trait = traitSelect.value;

        if (!trait || this.selectedCharacter.labels.includes(trait)) return;

        this.selectedCharacter.labels.push(trait);
        if (!this.selectedCharacter._original.labels) {
            this.selectedCharacter._original.labels = [];
        }
        this.selectedCharacter._original.labels.push(trait);

        this.populateCharacterTraits();
        traitSelect.value = '';
        this.showMessage(`Added trait: ${trait.replace(/_/g, ' ')}`, 'success');
    }

    removeTrait(trait) {
        if (!this.selectedCharacter) return;

        const index = this.selectedCharacter.labels.indexOf(trait);
        if (index > -1) {
            this.selectedCharacter.labels.splice(index, 1);

            const origIndex = this.selectedCharacter._original.labels.indexOf(trait);
            if (origIndex > -1) {
                this.selectedCharacter._original.labels.splice(origIndex, 1);
            }

            this.populateCharacterTraits();
            this.showMessage(`Removed trait: ${trait.replace(/_/g, ' ')}`, 'success');
        }
    }

    /**
     * Save export
     */
    downloadSave() {
        try {
            const modifiedSave = JSON.parse(JSON.stringify(this.saveData));
            const blob = new Blob([JSON.stringify(modifiedSave, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'hollywood_save_edited.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showMessage('Save file downloaded successfully', 'success');
        } catch (error) {
            this.showMessage('Failed to download save: ' + error.message, 'error');
        }
    }

    /**
     * Helper functions
     */
    async loadNameMap() {
        try {
            const response = await fetch('data/CHARACTER_NAMES.json');
            if (response.ok) {
                const nameData = await response.json();
                this.nameResolver.loadNames(nameData);
            }
        } catch (error) {
            console.warn('Could not load default name map:', error);
        }
    }

    calculateAge(character) {
        const gameYear = this.formatManager.extractGameYear(this.saveData);
        if (!character.birthDate || !gameYear) return null;

        try {
            const birthMatch = character.birthDate.match(/(\d{2})-(\d{2})-(\d{4})/);
            if (birthMatch) {
                const birthYear = parseInt(birthMatch[3]);
                return gameYear - birthYear;
            }
        } catch (error) {
            console.warn('Error calculating age:', error);
        }
        return null;
    }

    getPrimaryProfession(professions) {
        if (!professions) return '';

        // Find the profession with the highest value
        let maxProfession = '';
        let maxValue = -1;

        for (const [profession, value] of Object.entries(professions)) {
            const numValue = parseFloat(value);
            if (numValue > maxValue) {
                maxValue = numValue;
                maxProfession = profession;
            }
        }

        return maxProfession;
    }

    isCharacterTalent(character) {
        // A character is considered talent if they have any meaningful profession skill
        if (!character.professions) return false;

        const talentProfessions = ['Actor', 'Director', 'Producer', 'Scriptwriter', 'FilmEditor'];
        return talentProfessions.some(prof =>
            character.professions[prof] && parseFloat(character.professions[prof]) > 0
        );
    }

    getCharacterDisplayName(character) {
        const firstName = this.nameResolver.getName(character.firstNameId) || `Unknown(${character.firstNameId})`;
        const lastName = this.nameResolver.getName(character.lastNameId) || `Unknown(${character.lastNameId})`;
        return `${firstName} ${lastName}`;
    }

    getStudioDisplayName(studioId) {
        const studioMappings = {
            'PL': 'Player Studio',
            'EM': 'Evergreen Movies',
            'GB': 'Gerstein Bros.',
            'MA': 'Marginese',
            'SU': 'Supreme',
            'HE': 'Hephaestus',
            'NONE': 'No Studio'
        };
        return studioMappings[studioId] || studioId;
    }

    formatProfessionName(profession) {
        const professionMappings = {
            'Actor': 'Actor',
            'Director': 'Director',
            'Producer': 'Producer',
            'Scriptwriter': 'Writer',
            'FilmEditor': 'Editor'
        };
        return professionMappings[profession] || profession || 'None';
    }

    formatDate(dateString) {
        if (!dateString || dateString === '01-01-0001') return '';

        try {
            const parts = dateString.split('-');
            if (parts.length === 3) {
                return `${parts[0]}/${parts[1]}/${parts[2]}`;
            }
        } catch (error) {
            console.warn('Error formatting date:', error);
        }
        return dateString;
    }

    showEditor() {
        document.getElementById('loadSection').style.display = 'none';
        document.getElementById('editorSection').style.display = 'flex';
    }

    showMessage(text, type = 'info', duration = 3000) {
        const messagesContainer = document.getElementById('statusMessages');
        const message = document.createElement('div');
        message.className = `status-message ${type}`;
        message.textContent = text;

        messagesContainer.appendChild(message);

        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, duration);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.hollyjsonApp = new HollyJsonApp();
});
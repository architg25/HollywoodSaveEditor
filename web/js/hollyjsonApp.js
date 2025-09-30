/**
 * Hollywood Save Editor - HollyJson Style Implementation
 * Recreates the exact functionality and workflow of HollyJson
 */

// Classes are now loaded via script tags

class HollyJsonApp {
    constructor() {
        this.saveData = null;
        this.adapter = null;
        this.nameResolver = new NameResolver();
        this.formatManager = new SaveFormatManager();
        this.originalFileName = null;

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

        this.availableSkills = [
            "ACTION", "DRAMA", "HISTORICAL", "THRILLER", "ROMANCE",
            "DETECTIVE", "COMEDY", "ADVENTURE", "COM", "ART",
            "INDOOR", "OUTDOOR"
        ];

        // Studio mappings for cinema management
        this.studioMappings = {
            'PL': 'Player Studio',
            'EM': 'Evergreen Movies',
            'GB': 'Gerstein Bros.',
            'MA': 'Marginese',
            'SU': 'Supreme',
            'HE': 'Hephaestus'
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadNameMap();
        this.populateTraitSelector();
        this.populateSkillSelector();
    }

    /**
     * Setup all event listeners (HollyJson style)
     */
    setupEventListeners() {
        // File loading
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const filePickerBtn = document.getElementById('filePickerBtn');

        // Simple drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.loadSaveFile(files[0]);
            }
        });

        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        // File input handling
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadSaveFile(file);
            }
        });

        // Try to set default directory for Windows (this has limited browser support)
        this.setupFileInputDefaults(fileInput);

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

        // Skills
        document.getElementById('addSkillBtn').addEventListener('click', this.addSkill.bind(this));
    }

    setupMacroListeners() {
        // Bulk operations
        document.getElementById('maxMoodAttBtn').addEventListener('click', () => this.bulkSetMaxMoodAtt());
        document.getElementById('maxContractDaysBtn').addEventListener('click', () => this.bulkSetMaxContractDays());
        document.getElementById('maxSkillBtn').addEventListener('click', () => this.bulkSetMaxSkill());
        document.getElementById('maxLimitBtn').addEventListener('click', () => this.bulkSetMaxLimit());
        document.getElementById('setContractForSkillsBtn').addEventListener('click', () => this.bulkSetContractForSkills());

        // New age input system
        document.getElementById('setBulkAgeBtn').addEventListener('click', () => this.bulkSetAgeFromInput());

        // Salary input system
        document.getElementById('setBulkSalaryBtn').addEventListener('click', () => this.bulkSetSalaryFromInput());

        // Tab system
        document.getElementById('charactersTabBtn').addEventListener('click', () => this.switchTab('characters'));
        document.getElementById('miscTabBtn').addEventListener('click', () => this.switchTab('misc'));

        // Cinema management
        document.getElementById('applyCinemaChanges').addEventListener('click', () => this.applyCinemaChanges());
        document.getElementById('maxPlayerOwnership').addEventListener('click', () => this.maxPlayerOwnership());
        document.getElementById('distributeEvenly').addEventListener('click', () => this.distributeEvenly());
        document.getElementById('editTotalSlots').addEventListener('input', () => this.updateCinemaCalculations());
        document.getElementById('editIndependentSlots').addEventListener('input', () => this.updateCinemaCalculations());
    }

    /**
     * Setup file input with default directory hint
     */
    setupFileInputDefaults(fileInput) {
        // Unfortunately, browsers don't allow setting default directories for security
        // But we can add a title attribute with the path as a hint
        const defaultPath = '%USERPROFILE%\\AppData\\LocalLow\\Weappy\\Hollywood Animal\\Saves\\Profiles\\0';
        fileInput.title = `Default save location: ${defaultPath}`;
        fileInput.setAttribute('webkitdirectory', '');
        fileInput.removeAttribute('webkitdirectory'); // Remove immediately, just testing
    }

    /**
     * File loading
     */

    async loadSaveFile(file) {
        try {

            const text = await file.text();
            const saveData = JSON.parse(text);

            const validation = this.formatManager.validateSave(saveData);

            if (!validation.isValid) {
                this.showMessage('Save validation failed: ' + validation.error, 'error');
                return;
            }

            this.saveData = saveData;
            this.originalFileName = file.name;
            this.adapter = this.formatManager.createAdapter(saveData);

            // Load all data
            this.loadCharacters();
            this.loadStudioInfo();
            this.populateStudioLists();
            this.populateProfessionList();

            // Initialize filters and show all characters initially
            this.filteredCharacters = [...this.allCharacters];

            // Show editor
            this.showEditor();
            this.refreshCharacterList();
            this.loadCinemaData();

            this.showMessage(`Save loaded! Found ${this.allCharacters.length} characters.`, 'success');

        } catch (error) {
            this.showMessage('Error loading save file: ' + error.message, 'error');
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
            portraitBaseId: char.portraitBaseId,

            // Character state (newSave format uses string values)
            mood: parseFloat(char.mood || 0),
            attitude: parseFloat(char.attitude || 0),

            // Skills and limits (newSave has both "limit" and "Limit")
            limit: parseFloat(char.Limit || char.limit || 0),
            professions: char.professions || {},

            // Traits/Labels (newSave uses "labels" array)
            labels: char.labels || [],

            // Skills (whiteTagsNEW)
            whiteTagsNEW: char.whiteTagsNEW || {},

            // Blocked skills (blackTags)
            blackTags: char.blackTags || [],

            // Known sins
            aSins: char.aSins || [],

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
        // Studio display info
        document.getElementById('studioNameDisplay').textContent = this.studioInfo.studioName || 'Unknown Studio';
        document.getElementById('gameDateDisplay').textContent = this.formatDate(this.studioInfo.gameDate) || 'Unknown Date';

        // Editable studio values
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

    populateSkillSelector() {
        const availableSkills = document.getElementById('availableSkills');
        availableSkills.innerHTML = '<option value="">Add skill...</option>';

        this.availableSkills.forEach(skill => {
            const option = document.createElement('option');
            option.value = skill;
            option.textContent = skill.replace(/_/g, ' ');
            availableSkills.appendChild(option);
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

        // Character portrait
        this.updateCharacterPortrait(char);

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

        // Skills
        this.populateCharacterSkills();

        // Sins
        this.populateCharacterSins();
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
        document.getElementById('characterSkills').innerHTML = '';
        document.getElementById('characterSins').innerHTML = '';
        document.getElementById('charPortrait').textContent = '👤';
    }

    updateCharacterPortrait(char) {
        const portraitElement = document.getElementById('charPortrait');

        // Since we don't have access to the actual portrait files,
        // we'll create a fallback display using character data

        if (char.portraitBaseId) {
            // Generate a consistent emoji based on portraitBaseId
            const portraitEmojis = ['👨', '👩', '🧑', '👦', '👧', '🧒', '👴', '👵', '🧓', '👱‍♂️', '👱‍♀️', '👲', '🧔', '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲'];
            const emojiIndex = char.portraitBaseId % portraitEmojis.length;
            let emoji = portraitEmojis[emojiIndex];

            // Modify based on gender
            if (char.gender === 1) { // Female
                if (emoji.includes('👨')) emoji = emoji.replace('👨', '👩');
                else if (emoji === '👦') emoji = '👧';
                else if (emoji === '👴') emoji = '👵';
            } else { // Male
                if (emoji.includes('👩')) emoji = emoji.replace('👩', '👨');
                else if (emoji === '👧') emoji = '👦';
                else if (emoji === '👵') emoji = '👴';
            }

            portraitElement.textContent = emoji;
            portraitElement.title = `Portrait ID: ${char.portraitBaseId}`;
        } else {
            // Fallback to generic based on gender
            portraitElement.textContent = char.gender === 1 ? '👩' : '👨';
            portraitElement.title = 'No portrait ID';
        }
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

    populateCharacterSkills() {
        const skillsContainer = document.getElementById('characterSkills');
        skillsContainer.innerHTML = '';

        if (!this.selectedCharacter) return;

        // Check for skills in whiteTagsNEW (newSave format)
        const skills = this.selectedCharacter.whiteTagsNEW || {};

        if (Object.keys(skills).length === 0) {
            const noSkillsMsg = document.createElement('div');
            noSkillsMsg.className = 'skill-item';
            noSkillsMsg.innerHTML = '<span style="color: #888; font-style: italic;">No skills learned yet</span>';
            skillsContainer.appendChild(noSkillsMsg);
            return;
        }

        Object.keys(skills).forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            const skillValue = skills[skill];

            // Show skill name and value if available
            let displayText = skill.replace(/_/g, ' ');
            if (skillValue && typeof skillValue === 'object' && skillValue.value) {
                displayText += ` (${parseFloat(skillValue.value).toFixed(2)})`;
            }

            skillItem.innerHTML = `
                <span>${displayText}</span>
                <button onclick="window.hollyjsonApp.removeSkill('${skill}')">−</button>
            `;
            skillsContainer.appendChild(skillItem);
        });
    }

    populateCharacterSins() {
        const sinsContainer = document.getElementById('characterSins');
        sinsContainer.innerHTML = '';

        if (!this.selectedCharacter || !this.selectedCharacter.aSins) return;

        this.selectedCharacter.aSins.forEach(sin => {
            const sinItem = document.createElement('div');
            sinItem.className = 'sin-item';
            sinItem.innerHTML = `<span>${sin.replace(/_/g, ' ')}</span>`;
            sinsContainer.appendChild(sinItem);
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
        if (!this.saveData || !this.saveData.stateJson) {
            this.showMessage('No save data loaded', 'error');
            return;
        }

        const field = e.target.id.replace('Input', '');
        const value = parseFloat(e.target.value) || 0;

        // Update local studio info
        this.studioInfo[field] = value;

        // Update the actual save data
        const state = this.saveData.stateJson;

        switch(field) {
            case 'budget':
                state.budget = value;
                break;
            case 'cash':
                state.cash = value;
                break;
            case 'reputation':
                state.reputation = value.toString(); // Reputation is stored as string
                break;
            case 'influence':
                state.influence = value;
                break;
        }

        this.showMessage(`Studio ${field} updated to ${value.toLocaleString()}`, 'success');
    }

    /**
     * Bulk operations
     */

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

    bulkSetMaxContractDays() {
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

    bulkSetContractForSkills() {
        // Actually add all available skills to characters
        const currentDate = new Date().toISOString();

        this.filteredCharacters.forEach(char => {
            // Ensure whiteTagsNEW exists
            if (!char.whiteTagsNEW) {
                char.whiteTagsNEW = {};
            }
            if (!char._original.whiteTagsNEW) {
                char._original.whiteTagsNEW = {};
            }

            // Add all available skills
            this.availableSkills.forEach(skill => {
                if (!char.whiteTagsNEW[skill]) {
                    // Create skill object matching the game's format
                    const skillData = {
                        overallValues: [],
                        id: skill,
                        dateAdded: currentDate,
                        movieId: 0,
                        value: '1.000', // Max skill value
                        IsOverall: false
                    };

                    char.whiteTagsNEW[skill] = skillData;
                    char._original.whiteTagsNEW[skill] = skillData;
                }
            });
        });

        this.refreshCharacterList();
        this.populateCharacterDetails();
        this.showMessage(`Added all available skills to ${this.filteredCharacters.length} characters`, 'success');
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

    bulkSetAgeFromInput() {
        const ageInput = document.getElementById('bulkAgeInput');
        const targetAge = parseInt(ageInput.value);

        if (!targetAge || targetAge < 18 || targetAge > 99) {
            this.showMessage('Please enter a valid age between 18 and 99', 'error');
            return;
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
        this.showMessage(`Set age to ${targetAge} for ${this.filteredCharacters.length} characters`, 'success');
    }

    bulkSetSalaryFromInput() {
        const salaryInput = document.getElementById('bulkSalaryInput');
        const targetSalary = parseInt(salaryInput.value);

        if (!targetSalary || targetSalary < 0) {
            this.showMessage('Please enter a valid salary amount', 'error');
            return;
        }

        this.filteredCharacters.forEach(char => {
            char.monthlySalary = targetSalary;
            char._original.monthlySalary = targetSalary;
        });

        this.refreshCharacterList();
        this.populateCharacterDetails();
        this.showMessage(`Set monthly salary to $${targetSalary.toLocaleString()} for ${this.filteredCharacters.length} characters`, 'success');
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

    addSkill() {
        if (!this.selectedCharacter) return;

        const skillSelect = document.getElementById('availableSkills');
        const skill = skillSelect.value;

        if (!skill || this.selectedCharacter.whiteTagsNEW.hasOwnProperty(skill)) return;

        // Create skill object matching the game's format
        const skillData = {
            overallValues: [],
            id: skill,
            dateAdded: new Date().toISOString(),
            movieId: 0,
            value: '1.000', // Max skill value
            IsOverall: false
        };

        this.selectedCharacter.whiteTagsNEW[skill] = skillData;
        if (!this.selectedCharacter._original.whiteTagsNEW) {
            this.selectedCharacter._original.whiteTagsNEW = {};
        }
        this.selectedCharacter._original.whiteTagsNEW[skill] = skillData;

        this.populateCharacterSkills();
        skillSelect.value = '';
        this.showMessage(`Added skill: ${skill.replace(/_/g, ' ')}`, 'success');
    }

    removeSkill(skill) {
        if (!this.selectedCharacter) return;

        if (this.selectedCharacter.whiteTagsNEW.hasOwnProperty(skill)) {
            delete this.selectedCharacter.whiteTagsNEW[skill];

            if (this.selectedCharacter._original.whiteTagsNEW &&
                this.selectedCharacter._original.whiteTagsNEW.hasOwnProperty(skill)) {
                delete this.selectedCharacter._original.whiteTagsNEW[skill];
            }

            this.populateCharacterSkills();
            this.showMessage(`Removed skill: ${skill.replace(/_/g, ' ')}`, 'success');
        }
    }

    /**
     * Save export
     */
    async downloadSave() {
        try {
            const modifiedSave = JSON.parse(JSON.stringify(this.saveData));
            const jsonContent = JSON.stringify(modifiedSave, null, 2);

            // Generate a smart filename
            const studioName = this.studioInfo.studioName || 'Studio';
            const gameDate = this.studioInfo.gameDate || '';
            const timestamp = new Date().toISOString().slice(0, 10);

            let suggestedName;
            if (this.originalFileName) {
                // Keep original name without modification
                suggestedName = this.originalFileName;
            } else {
                suggestedName = `${studioName}_${gameDate}_${timestamp}.json`.replace(/[^a-zA-Z0-9-_.]/g, '_');
            }

            // Try to use File System Access API if supported
            if ('showSaveFilePicker' in window) {
                try {
                    const fileHandle = await window.showSaveFilePicker({
                        suggestedName: suggestedName,
                        types: [{
                            description: 'Hollywood Animal Save Files',
                            accept: {'application/json': ['.json']},
                        }],
                        startIn: 'documents' // Best we can do for default directory
                    });

                    const writable = await fileHandle.createWritable();
                    await writable.write(jsonContent);
                    await writable.close();

                    this.showMessage('Save file saved successfully', 'success');
                    return;
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.warn('File System Access API failed:', error);
                    } else {
                        return; // User cancelled
                    }
                }
            }

            // Fallback to regular download
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = suggestedName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showMessage('Save file downloaded successfully', 'success');
        } catch (error) {
            this.showMessage('Failed to save: ' + error.message, 'error');
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

    /**
     * Tab System Methods
     */
    switchTab(tabName) {
        // Hide all tabs completely
        document.getElementById('charactersTab').classList.remove('active');
        document.getElementById('charactersTab').style.display = 'none';
        document.getElementById('miscTab').style.display = 'none';

        // Remove active class from all buttons
        document.getElementById('charactersTabBtn').classList.remove('active');
        document.getElementById('miscTabBtn').classList.remove('active');

        // Show selected tab
        if (tabName === 'characters') {
            document.getElementById('charactersTab').style.display = 'flex';
            document.getElementById('charactersTab').classList.add('active');
            document.getElementById('charactersTabBtn').classList.add('active');
        } else if (tabName === 'misc') {
            document.getElementById('miscTab').style.display = 'block';
            document.getElementById('miscTabBtn').classList.add('active');
        }
    }

    /**
     * Cinema Management Methods
     */
    loadCinemaData() {
        if (!this.saveData || !this.saveData.stateJson) {
            return;
        }

        // Check if cinema data exists in the save file
        // Looking for allCinemas, ownedCinemas or similar structures
        let cinemaData = null;

        // Search for cinema-related fields in the save data
        const searchCinemaData = (obj, path = '') => {
            if (!obj || typeof obj !== 'object') return null;

            for (const key in obj) {
                if (key.toLowerCase().includes('cinema') || key.toLowerCase().includes('owned')) {
                    console.log(`Found potential cinema data at ${path}.${key}:`, obj[key]);
                    return obj[key];
                }

                if (typeof obj[key] === 'object') {
                    const found = searchCinemaData(obj[key], `${path}.${key}`);
                    if (found) return found;
                }
            }
            return null;
        };

        cinemaData = searchCinemaData(this.saveData);

        if (!cinemaData) {
            // Cinema management not available for this save file format
            this.currentCinemaData = {
                studioSlots: { 'PL': 0 },
                independentSlots: 0,
                totalSlots: 0,
                available: false,
                message: 'Cinema management not available - data structure not found in this save file'
            };
        } else {
            // TODO: Parse the actual cinema data structure when found
            this.currentCinemaData = {
                studioSlots: { 'PL': 0 },
                independentSlots: 0,
                totalSlots: 0,
                available: false,
                message: 'Cinema data structure found but not yet implemented'
            };
        }

        this.updateCinemaDisplay();
        this.loadCinemaHistory();
    }

    updateCinemaDisplay() {
        if (!this.currentCinemaData) return;

        const { studioSlots, independentSlots, totalSlots, available, message } = this.currentCinemaData;

        if (!available && message) {
            // Show message that cinema management is not available
            document.getElementById('totalCinemaSlots').textContent = 'N/A';
            document.getElementById('independentSlots').textContent = 'N/A';
            document.getElementById('independentPercentage').textContent = '(N/A)';

            const studiosGrid = document.getElementById('studiosGrid');
            studiosGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: var(--text-muted); font-style: italic;">${message}</div>`;
            return;
        }

        // Update overview header
        document.getElementById('totalCinemaSlots').textContent = totalSlots.toLocaleString();
        document.getElementById('independentSlots').textContent = independentSlots.toLocaleString();

        const independentPercentage = totalSlots > 0 ? ((independentSlots / totalSlots) * 100).toFixed(1) : '0.0';
        document.getElementById('independentPercentage').textContent = `(${independentPercentage}%)`;

        // Update studios grid
        const studiosGrid = document.getElementById('studiosGrid');
        studiosGrid.innerHTML = '';

        Object.keys(this.studioMappings).forEach(studioId => {
            const slots = studioSlots[studioId] || 0;
            const percentage = totalSlots > 0 ? ((slots / totalSlots) * 100).toFixed(1) : '0.0';

            const studioItem = document.createElement('div');
            studioItem.className = 'studio-item';

            studioItem.innerHTML = `
                <div class="studio-name">${this.studioMappings[studioId]}</div>
                <div class="studio-slots">${slots.toLocaleString()}</div>
                <div class="studio-percentage">(${percentage}%)</div>
            `;

            studiosGrid.appendChild(studioItem);
        });

        // Update edit fields
        document.getElementById('editTotalSlots').value = totalSlots;
        document.getElementById('editIndependentSlots').value = independentSlots;

        // Populate studio editing grid
        this.populateStudioEditingGrid();
    }

    populateStudioEditingGrid() {
        const studioEditingGrid = document.getElementById('studioEditingGrid');
        studioEditingGrid.innerHTML = '';

        Object.keys(this.studioMappings).forEach(studioId => {
            const slots = this.currentCinemaData.studioSlots[studioId] || 0;

            const studioEditField = document.createElement('div');
            studioEditField.className = 'studio-edit-field';

            studioEditField.innerHTML = `
                <label for="edit-${studioId}">${this.studioMappings[studioId]}:</label>
                <input type="number" id="edit-${studioId}" class="cinema-input" min="0" value="${slots}">
            `;

            studioEditingGrid.appendChild(studioEditField);

            // Add event listener for real-time calculation
            const input = studioEditField.querySelector(`#edit-${studioId}`);
            input.addEventListener('input', () => this.updateCinemaCalculations());
        });
    }

    updateCinemaCalculations() {
        const totalSlots = parseInt(document.getElementById('editTotalSlots').value) || 0;
        const independentSlots = parseInt(document.getElementById('editIndependentSlots').value) || 0;

        // Calculate used studio slots
        let usedStudioSlots = 0;
        Object.keys(this.studioMappings).forEach(studioId => {
            const studioInput = document.getElementById(`edit-${studioId}`);
            if (studioInput) {
                usedStudioSlots += parseInt(studioInput.value) || 0;
            }
        });

        // Auto-adjust if total doesn't match
        const calculatedTotal = usedStudioSlots + independentSlots;
        if (calculatedTotal !== totalSlots) {
            document.getElementById('editTotalSlots').value = calculatedTotal;
        }
    }

    applyCinemaChanges() {
        if (!this.currentCinemaData) {
            this.showMessage('No cinema data to modify', 'error');
            return;
        }

        // Get new values from inputs
        const newIndependentSlots = parseInt(document.getElementById('editIndependentSlots').value) || 0;
        const newStudioSlots = {};

        Object.keys(this.studioMappings).forEach(studioId => {
            const studioInput = document.getElementById(`edit-${studioId}`);
            newStudioSlots[studioId] = studioInput ? (parseInt(studioInput.value) || 0) : 0;
        });

        // Update all movies to maintain consistency
        let updatedCount = 0;
        this.saveData.stateJson.movies.forEach(movie => {
            if (movie.stageResults && movie.stageResults.Release) {
                const releaseData = movie.stageResults.Release;
                const movieStudioId = movie.studioId || 'PL';

                if (releaseData.ourSlotsLastWeekCurrScreening !== undefined) {
                    // Update slots for this movie's studio
                    releaseData.ourSlotsLastWeekCurrScreening = newStudioSlots[movieStudioId].toString();
                    releaseData.otherSlotsLastWeekCurrScreening = newIndependentSlots.toString();

                    // Update history entries if they exist
                    if (releaseData.releaseSlotsHistory && releaseData.releaseSlotsHistory.length > 0) {
                        const latestHistory = releaseData.releaseSlotsHistory[releaseData.releaseSlotsHistory.length - 1];
                        latestHistory.Item1 = newStudioSlots[movieStudioId].toString();
                        latestHistory.Item2 = newIndependentSlots.toString();
                    }

                    updatedCount++;
                }
            }
        });

        // Update current data
        this.currentCinemaData.studioSlots = newStudioSlots;
        this.currentCinemaData.independentSlots = newIndependentSlots;
        this.currentCinemaData.totalSlots = newIndependentSlots + Object.values(newStudioSlots).reduce((sum, slots) => sum + slots, 0);

        this.updateCinemaDisplay();
        this.showMessage(`Updated cinema distribution across ${updatedCount} movies`, 'success');
    }

    maxPlayerOwnership() {
        if (!this.currentCinemaData) {
            this.showMessage('No cinema data loaded', 'error');
            return;
        }

        const totalSlots = this.currentCinemaData.totalSlots;

        // Set player to own all slots
        document.getElementById('edit-PL').value = totalSlots;

        // Set all other studios to 0
        Object.keys(this.studioMappings).forEach(studioId => {
            if (studioId !== 'PL') {
                const input = document.getElementById(`edit-${studioId}`);
                if (input) input.value = 0;
            }
        });

        // Set independent to 0
        document.getElementById('editIndependentSlots').value = 0;

        this.updateCinemaCalculations();
        this.showMessage(`Set Player Studio to own all ${totalSlots.toLocaleString()} cinema slots`, 'info');
    }

    distributeEvenly() {
        if (!this.currentCinemaData) {
            this.showMessage('No cinema data loaded', 'error');
            return;
        }

        const totalSlots = this.currentCinemaData.totalSlots;
        const studioCount = Object.keys(this.studioMappings).length;
        const slotsPerStudio = Math.floor(totalSlots / (studioCount + 1)); // +1 for independent
        const remainder = totalSlots % (studioCount + 1);

        // Distribute evenly among all studios
        Object.keys(this.studioMappings).forEach(studioId => {
            const input = document.getElementById(`edit-${studioId}`);
            if (input) input.value = slotsPerStudio;
        });

        // Give remainder to independent cinemas
        document.getElementById('editIndependentSlots').value = slotsPerStudio + remainder;

        this.updateCinemaCalculations();
        this.showMessage(`Distributed ${totalSlots.toLocaleString()} slots evenly among all studios and independents`, 'info');
    }

    loadCinemaHistory() {
        const historyList = document.getElementById('cinemaHistoryList');
        historyList.innerHTML = '';

        if (!this.saveData.stateJson.movies) return;

        // Get movies with release data, sorted by development date
        const moviesWithCinemas = this.saveData.stateJson.movies
            .filter(movie => movie.stageResults && movie.stageResults.Release &&
                           movie.stageResults.Release.ourSlotsLastWeekCurrScreening)
            .sort((a, b) => (b.developmentEndDate || b.id || 0) - (a.developmentEndDate || a.id || 0))
            .slice(0, 10); // Show last 10 movies

        moviesWithCinemas.forEach(movie => {
            const releaseData = movie.stageResults.Release;
            const studioSlots = parseInt(releaseData.ourSlotsLastWeekCurrScreening) || 0;
            const independentSlots = parseInt(releaseData.otherSlotsLastWeekCurrScreening) || 0;
            const totalSlots = studioSlots + independentSlots;

            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            const movieName = document.createElement('span');
            movieName.className = 'movie-name';
            movieName.textContent = movie.movieDetails?.title || `Movie ${movie.id}`;

            const cinemaData = document.createElement('span');
            cinemaData.className = 'cinema-data';
            const studioPercentage = totalSlots > 0 ? ((studioSlots / totalSlots) * 100).toFixed(1) : '0.0';
            cinemaData.textContent = `${studioSlots.toLocaleString()}/${totalSlots.toLocaleString()} (${studioPercentage}%)`;

            historyItem.appendChild(movieName);
            historyItem.appendChild(cinemaData);
            historyList.appendChild(historyItem);
        });

        if (moviesWithCinemas.length === 0) {
            historyList.innerHTML = '<div style="padding: 10px; text-align: center; color: var(--text-muted); font-size: 10px;">No cinema distribution history found</div>';
        }
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
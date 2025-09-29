/**
 * Hollywood Save Editor - Main Application
 * Combines the best of hollywood_animal_editor and HollyJson
 */

import { HollywoodDataModel } from './dataModel.js';
import { NameResolver } from './nameResolver.js';

class HollywoodSaveEditor {
    constructor() {
        this.dataModel = new HollywoodDataModel();
        this.nameResolver = new NameResolver();
        this.currentTab = 'studio';
        this.selectedCharacters = new Set();
        this.currentFilters = {};
        this.currentSort = 'skill-desc';

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadNameMap();
        this.populateTraitSelectors();
        this.hideEditorSection();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // File loading
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const filePickerBtn = document.getElementById('filePickerBtn');
        const nameMapInput = document.getElementById('nameMapInput');

        dropZone.addEventListener('dragover', this.handleDragOver.bind(this));
        dropZone.addEventListener('drop', this.handleFileDrop.bind(this));
        dropZone.addEventListener('click', () => fileInput.click());

        filePickerBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        nameMapInput.addEventListener('change', this.handleNameMapLoad.bind(this));

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Global controls
        document.getElementById('globalSearch').addEventListener('input', this.handleGlobalSearch.bind(this));
        document.getElementById('clearFilters').addEventListener('click', this.clearFilters.bind(this));
        document.getElementById('undoBtn').addEventListener('click', this.undo.bind(this));
        document.getElementById('redoBtn').addEventListener('click', this.redo.bind(this));
        document.getElementById('downloadBtn').addEventListener('click', this.downloadSave.bind(this));

        // Character table controls
        document.getElementById('selectAll').addEventListener('change', this.toggleSelectAll.bind(this));
        document.getElementById('studioFilter').addEventListener('change', this.applyFilters.bind(this));
        document.getElementById('traitFilter').addEventListener('change', this.applyFilters.bind(this));
        document.getElementById('aliveOnlyFilter').addEventListener('change', this.applyFilters.bind(this));
        document.getElementById('sortBy').addEventListener('change', this.applySorting.bind(this));

        // Studio controls
        document.getElementById('budgetInput').addEventListener('change', this.updateStudioInfo.bind(this));
        document.getElementById('cashInput').addEventListener('change', this.updateStudioInfo.bind(this));
        document.getElementById('reputationInput').addEventListener('change', this.updateStudioInfo.bind(this));
        document.getElementById('influenceInput').addEventListener('change', this.updateStudioInfo.bind(this));

        // Bulk operation controls
        this.setupBulkOperationListeners();

        // Modal controls
        document.getElementById('closeModal').addEventListener('click', this.closeCharacterModal.bind(this));
        document.getElementById('cancelModalBtn').addEventListener('click', this.closeCharacterModal.bind(this));
        document.getElementById('saveModalBtn').addEventListener('click', this.saveCharacterModal.bind(this));

        // Character detail tabs
        document.querySelectorAll('.detail-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchDetailTab(e.target.dataset.detailTab);
            });
        });
    }

    setupBulkOperationListeners() {
        // Bulk mood and attitude
        const bulkMoodSlider = document.getElementById('bulkMood');
        const bulkAttitudeSlider = document.getElementById('bulkAttitude');

        bulkMoodSlider.addEventListener('input', (e) => {
            document.getElementById('bulkMoodValue').textContent = e.target.value;
        });

        bulkAttitudeSlider.addEventListener('input', (e) => {
            document.getElementById('bulkAttitudeValue').textContent = e.target.value;
        });

        document.getElementById('applyBulkMoodBtn').addEventListener('click', this.applyBulkMoodAttitude.bind(this));
        document.getElementById('setSkillToLimitBtn').addEventListener('click', this.setSkillToLimit.bind(this));
        document.getElementById('setSkillToCapBtn').addEventListener('click', this.setSkillToCap.bind(this));
        document.getElementById('addTraitBtn').addEventListener('click', this.addTrait.bind(this));
        document.getElementById('removeTraitBtn').addEventListener('click', this.removeTrait.bind(this));
        document.getElementById('applyBulkAgeBtn').addEventListener('click', this.applyBulkAge.bind(this));
    }

    /**
     * Load default name map
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

    /**
     * Populate trait selectors with available traits
     */
    populateTraitSelectors() {
        const traitFilter = document.getElementById('traitFilter');
        const bulkTraitSelect = document.getElementById('bulkTraitSelect');

        this.dataModel.availableTraits.forEach(trait => {
            // Filter dropdown
            const filterOption = document.createElement('option');
            filterOption.value = trait;
            filterOption.textContent = trait.replace(/_/g, ' ');
            traitFilter.appendChild(filterOption);

            // Bulk operations dropdown
            const bulkOption = document.createElement('option');
            bulkOption.value = trait;
            bulkOption.textContent = trait.replace(/_/g, ' ');
            bulkTraitSelect.appendChild(bulkOption);
        });
    }

    /**
     * File handling
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

    handleNameMapLoad(e) {
        const file = e.target.files[0];
        if (file) {
            this.loadNameMapFile(file);
        }
    }

    async loadNameMapFile(file) {
        try {
            const text = await file.text();
            const nameData = JSON.parse(text);
            this.nameResolver.loadNames(nameData);
            this.showMessage('Name map loaded successfully', 'success');

            // Refresh character display if save is loaded
            if (this.dataModel.saveData) {
                this.refreshCharacterDisplay();
            }
        } catch (error) {
            this.showMessage('Failed to load name map: ' + error.message, 'error');
        }
    }

    async loadSaveFile(file) {
        try {
            this.showLoading();

            const text = await file.text();
            const saveData = JSON.parse(text);

            const result = this.dataModel.loadSave(saveData);

            if (result.success) {
                this.showEditorSection();
                this.updateSaveInfo(result);
                this.populateStudioInfo();
                this.populateStudioFilter();
                this.refreshCharacterDisplay();
                this.showMessage(`Save loaded: ${result.characterCount} characters found`, 'success');

                if (result.validation.warnings.length > 0) {
                    result.validation.warnings.forEach(warning => {
                        this.showMessage(warning, 'warning');
                    });
                }
            } else {
                this.showMessage('Failed to load save: ' + result.error, 'error');
            }
        } catch (error) {
            this.showMessage('Failed to parse save file: ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * UI Management
     */
    showEditorSection() {
        document.getElementById('loadSection').style.display = 'none';
        document.getElementById('editorSection').style.display = 'block';
        document.getElementById('downloadBtn').style.display = 'inline-flex';
    }

    hideEditorSection() {
        document.getElementById('loadSection').style.display = 'block';
        document.getElementById('editorSection').style.display = 'none';
        document.getElementById('downloadBtn').style.display = 'none';
    }

    updateSaveInfo(result) {
        document.getElementById('saveInfo').style.display = 'flex';
        document.getElementById('saveVersion').textContent = `v${result.validation.version}`;
        document.getElementById('characterCount').textContent = `${result.characterCount} characters`;
        if (result.gameYear) {
            document.getElementById('gameYear').textContent = `Year: ${result.gameYear}`;
        }
    }

    populateStudioInfo() {
        const studioInfo = this.dataModel.studioInfo;
        document.getElementById('budgetInput').value = studioInfo.budget || 0;
        document.getElementById('cashInput').value = studioInfo.cash || 0;
        document.getElementById('reputationInput').value = studioInfo.reputation || 0;
        document.getElementById('influenceInput').value = studioInfo.influence || 0;
    }

    populateStudioFilter() {
        const studioFilter = document.getElementById('studioFilter');

        // Clear existing options except "All Studios"
        while (studioFilter.children.length > 1) {
            studioFilter.removeChild(studioFilter.lastChild);
        }

        // Get unique studios from characters
        const studios = new Set();
        this.dataModel.characters.forEach(char => {
            if (char.studioId) {
                studios.add(char.studioId);
            }
        });

        // Add studio options
        studios.forEach(studioId => {
            const option = document.createElement('option');
            option.value = studioId;
            option.textContent = this.dataModel.studioMappings[studioId] || studioId;
            studioFilter.appendChild(option);
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-tab`);
        });

        // Refresh content for character tabs
        if (tabName !== 'studio' && tabName !== 'bulk') {
            this.refreshCharacterDisplay();
        }
    }

    switchDetailTab(tabName) {
        // Update detail tab buttons
        document.querySelectorAll('.detail-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.detailTab === tabName);
        });

        // Update detail tab content
        document.querySelectorAll('.detail-pane').forEach(pane => {
            pane.classList.toggle('active', pane.id === `${tabName}-detail`);
        });
    }

    /**
     * Character display and filtering
     */
    refreshCharacterDisplay() {
        if (this.currentTab === 'studio' || this.currentTab === 'bulk') return;

        let characters = [];

        switch (this.currentTab) {
            case 'actors':
                characters = this.dataModel.getCharactersByProfession('Actor');
                break;
            case 'directors':
                characters = this.dataModel.getCharactersByProfession('Director');
                break;
            case 'producers':
                characters = this.dataModel.getCharactersByProfession('Producer');
                break;
            case 'writers':
                characters = this.dataModel.getCharactersByProfession('Scriptwriter');
                break;
            case 'editors':
                characters = this.dataModel.getCharactersByProfession('FilmEditor');
                break;
            case 'executives':
                // Handle executives differently - they use different profession keys
                characters = this.dataModel.characters.filter(char => {
                    const professions = char.professions || {};
                    return Object.keys(professions).some(key =>
                        key.startsWith('Cpt') || key.startsWith('Lieut')
                    );
                });
                break;
        }

        // Apply filters
        characters = this.applyCurrentFilters(characters);

        // Apply sorting
        characters = this.applySortToCharacters(characters);

        // Update display
        this.updateCharacterTable(characters);
    }

    applyCurrentFilters(characters) {
        return this.dataModel.filterCharacters({
            ...this.currentFilters,
            profession: this.getProfessionForCurrentTab()
        }).filter(char => characters.includes(char));
    }

    getProfessionForCurrentTab() {
        const professionMap = {
            'actors': 'Actor',
            'directors': 'Director',
            'producers': 'Producer',
            'writers': 'Scriptwriter',
            'editors': 'FilmEditor'
        };
        return professionMap[this.currentTab];
    }

    applySortToCharacters(characters) {
        const [sortBy, direction] = this.currentSort.split('-');

        return characters.sort((a, b) => {
            let aVal, bVal;

            switch (sortBy) {
                case 'skill':
                    const profession = this.getProfessionForCurrentTab();
                    aVal = parseFloat(a.professions[profession] || 0);
                    bVal = parseFloat(b.professions[profession] || 0);
                    break;
                case 'age':
                    aVal = a.age || 0;
                    bVal = b.age || 0;
                    break;
                case 'name':
                    const aName = this.getCharacterDisplayName(a);
                    const bName = this.getCharacterDisplayName(b);
                    aVal = aName.toLowerCase();
                    bVal = bName.toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (direction === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
    }

    updateCharacterTable(characters) {
        const tbody = document.getElementById('characterTableBody');
        tbody.innerHTML = '';

        characters.forEach(character => {
            const row = this.createCharacterRow(character);
            tbody.appendChild(row);
        });
    }

    createCharacterRow(character) {
        const row = document.createElement('tr');
        const profession = this.getProfessionForCurrentTab();
        const skill = character.professions[profession] || '0.000';
        const limit = character.limit || character.Limit || '0.000';

        // Get ART/COM values
        const whiteTags = character.whiteTagsNEW || {};
        const artValue = whiteTags.ART?.value || '0.000';
        const comValue = whiteTags.COM?.value || '0.000';

        row.innerHTML = `
            <td>
                <input type="checkbox" class="character-select"
                       data-character-id="${character.id}"
                       ${this.selectedCharacters.has(character.id) ? 'checked' : ''}>
            </td>
            <td>
                <button class="character-name-btn" data-character-id="${character.id}">
                    ${this.getCharacterDisplayName(character)}
                </button>
            </td>
            <td>${character.age || 'Unknown'}</td>
            <td>
                <input type="range" min="0" max="1" step="0.01" value="${skill}"
                       class="skill-slider" data-character-id="${character.id}" data-profession="${profession}">
                <span class="skill-value">${this.formatSkillValue(skill)}</span>
            </td>
            <td>
                <input type="range" min="0" max="1" step="0.01" value="${limit}"
                       class="limit-slider" data-character-id="${character.id}">
                <span class="limit-value">${this.formatSkillValue(limit)}</span>
            </td>
            <td>${this.formatSkillValue(artValue)}</td>
            <td>${this.formatSkillValue(comValue)}</td>
            <td>${this.dataModel.studioMappings[character.studioId] || character.studioId || 'Unknown'}</td>
            <td>
                <button class="btn btn-ghost btn-sm edit-btn" data-character-id="${character.id}">
                    Edit
                </button>
            </td>
        `;

        // Add event listeners for the row
        this.setupCharacterRowListeners(row, character);

        return row;
    }

    setupCharacterRowListeners(row, character) {
        // Character selection
        const checkbox = row.querySelector('.character-select');
        checkbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectedCharacters.add(character.id);
            } else {
                this.selectedCharacters.delete(character.id);
            }
            this.updateSelectAllState();
        });

        // Character name click (open detail modal)
        const nameBtn = row.querySelector('.character-name-btn');
        nameBtn.addEventListener('click', () => {
            this.openCharacterModal(character);
        });

        // Skill slider
        const skillSlider = row.querySelector('.skill-slider');
        const skillValue = row.querySelector('.skill-value');
        skillSlider.addEventListener('input', (e) => {
            skillValue.textContent = this.formatSkillValue(e.target.value);
        });
        skillSlider.addEventListener('change', (e) => {
            this.updateCharacterSkill(character.id, e.target.dataset.profession, e.target.value);
        });

        // Limit slider
        const limitSlider = row.querySelector('.limit-slider');
        const limitValueSpan = row.querySelector('.limit-value');
        limitSlider.addEventListener('input', (e) => {
            limitValueSpan.textContent = this.formatSkillValue(e.target.value);
        });
        limitSlider.addEventListener('change', (e) => {
            this.updateCharacterLimit(character.id, e.target.value);
        });

        // Edit button
        const editBtn = row.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            this.openCharacterModal(character);
        });
    }

    getCharacterDisplayName(character) {
        const firstName = this.nameResolver.getName(character.firstNameId) || `Unknown(${character.firstNameId})`;
        const lastName = this.nameResolver.getName(character.lastNameId) || `Unknown(${character.lastNameId})`;
        return `${firstName} ${lastName}`;
    }

    formatSkillValue(value) {
        const num = parseFloat(value);
        return (num * 10).toFixed(1);
    }

    /**
     * Character editing
     */
    updateCharacterSkill(characterId, profession, value) {
        const character = this.dataModel.characters.find(c => c.id === characterId);
        if (character) {
            const oldValue = character.professions[profession];
            character.professions[profession] = parseFloat(value).toFixed(3);
            character._original.professions[profession] = parseFloat(value).toFixed(3);

            this.dataModel.recordChange({
                type: 'skill_change',
                characterId: characterId,
                profession: profession,
                oldValue: oldValue,
                newValue: value
            });
        }
    }

    updateCharacterLimit(characterId, value) {
        const character = this.dataModel.characters.find(c => c.id === characterId);
        if (character) {
            const oldLimit = character.limit;
            const oldLimitCap = character.Limit;

            character.limit = parseFloat(value).toFixed(3);
            character.Limit = parseFloat(value).toFixed(3);
            character._original.limit = parseFloat(value).toFixed(3);
            character._original.Limit = parseFloat(value).toFixed(3);

            this.dataModel.recordChange({
                type: 'limit_change',
                characterId: characterId,
                oldLimit: oldLimit,
                oldLimitCap: oldLimitCap,
                newValue: value
            });
        }
    }

    /**
     * Studio management
     */
    updateStudioInfo(e) {
        const field = e.target.id.replace('Input', '');
        const value = parseFloat(e.target.value) || 0;

        const oldValue = this.dataModel.studioInfo[field];
        this.dataModel.studioInfo[field] = value;

        // Update in original save data
        if (this.dataModel.adapter && this.dataModel.adapter.saveData) {
            // This would need to be implemented based on actual save structure
            // For now, just record the change
            this.dataModel.recordChange({
                type: 'studio_change',
                field: field,
                oldValue: oldValue,
                newValue: value
            });
        }
    }

    /**
     * Filtering and searching
     */
    handleGlobalSearch(e) {
        this.currentFilters.search = e.target.value;
        this.refreshCharacterDisplay();
    }

    applyFilters() {
        const studioFilter = document.getElementById('studioFilter').value;
        const traitFilter = document.getElementById('traitFilter').value;
        const aliveOnly = document.getElementById('aliveOnlyFilter').checked;

        this.currentFilters = {
            ...(studioFilter && { studio: studioFilter }),
            ...(traitFilter && { trait: traitFilter }),
            ...(aliveOnly && { alive: true }),
            ...this.currentFilters.search && { search: this.currentFilters.search }
        };

        this.refreshCharacterDisplay();
    }

    applySorting(e) {
        this.currentSort = e.target.value;
        this.refreshCharacterDisplay();
    }

    clearFilters() {
        this.currentFilters = {};
        document.getElementById('globalSearch').value = '';
        document.getElementById('studioFilter').value = '';
        document.getElementById('traitFilter').value = '';
        document.getElementById('aliveOnlyFilter').checked = false;
        this.refreshCharacterDisplay();
    }

    /**
     * Selection management
     */
    toggleSelectAll(e) {
        const isChecked = e.target.checked;

        document.querySelectorAll('.character-select').forEach(checkbox => {
            checkbox.checked = isChecked;
            const characterId = parseInt(checkbox.dataset.characterId);

            if (isChecked) {
                this.selectedCharacters.add(characterId);
            } else {
                this.selectedCharacters.delete(characterId);
            }
        });
    }

    updateSelectAllState() {
        const checkboxes = document.querySelectorAll('.character-select');
        const selectAllCheckbox = document.getElementById('selectAll');

        if (checkboxes.length === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
            return;
        }

        const checkedCount = document.querySelectorAll('.character-select:checked').length;

        if (checkedCount === 0) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = false;
        } else if (checkedCount === checkboxes.length) {
            selectAllCheckbox.indeterminate = false;
            selectAllCheckbox.checked = true;
        } else {
            selectAllCheckbox.indeterminate = true;
            selectAllCheckbox.checked = false;
        }
    }

    /**
     * Bulk operations (HollyJson style features)
     */
    applyBulkMoodAttitude() {
        const mood = parseFloat(document.getElementById('bulkMood').value);
        const attitude = parseFloat(document.getElementById('bulkAttitude').value);

        if (this.selectedCharacters.size === 0) {
            this.showMessage('No characters selected', 'warning');
            return;
        }

        this.dataModel.bulkSetMoodAndAttitude(mood, attitude, Array.from(this.selectedCharacters));
        this.showMessage(`Updated mood and attitude for ${this.selectedCharacters.size} characters`, 'success');
    }

    setSkillToLimit() {
        const profession = document.getElementById('bulkSkillProfession').value;

        if (this.selectedCharacters.size === 0) {
            this.showMessage('No characters selected', 'warning');
            return;
        }

        this.dataModel.bulkSetSkillToLimit(profession, Array.from(this.selectedCharacters));
        this.refreshCharacterDisplay();
        this.showMessage(`Set ${profession} skill to limit for ${this.selectedCharacters.size} characters`, 'success');
    }

    setSkillToCap() {
        // This would set skill to maximum (1.0)
        const profession = document.getElementById('bulkSkillProfession').value;

        if (this.selectedCharacters.size === 0) {
            this.showMessage('No characters selected', 'warning');
            return;
        }

        // Implementation would be similar to setSkillToLimit but with max value
        this.showMessage('Set skill to cap functionality would be implemented here', 'info');
    }

    addTrait() {
        const trait = document.getElementById('bulkTraitSelect').value;

        if (this.selectedCharacters.size === 0) {
            this.showMessage('No characters selected', 'warning');
            return;
        }

        this.dataModel.bulkAddTrait(trait, Array.from(this.selectedCharacters));
        this.showMessage(`Added trait "${trait}" to ${this.selectedCharacters.size} characters`, 'success');
    }

    removeTrait() {
        const trait = document.getElementById('bulkTraitSelect').value;

        if (this.selectedCharacters.size === 0) {
            this.showMessage('No characters selected', 'warning');
            return;
        }

        this.dataModel.bulkRemoveTrait(trait, Array.from(this.selectedCharacters));
        this.showMessage(`Removed trait "${trait}" from ${this.selectedCharacters.size} characters`, 'success');
    }

    applyBulkAge() {
        const age = parseInt(document.getElementById('bulkAge').value);

        if (this.selectedCharacters.size === 0) {
            this.showMessage('No characters selected', 'warning');
            return;
        }

        // Implementation would update birthDate based on game year and target age
        this.showMessage('Bulk age setting functionality would be implemented here', 'info');
    }

    /**
     * Character detail modal
     */
    openCharacterModal(character) {
        const modal = document.getElementById('characterModal');
        const nameElement = document.getElementById('modalCharacterName');

        nameElement.textContent = this.getCharacterDisplayName(character);

        // Populate modal content based on character data
        this.populateCharacterModal(character);

        modal.style.display = 'flex';
    }

    populateCharacterModal(character) {
        // This would populate all the detailed character editing forms
        // Implementation would include basic info, skills, traits, and advanced JSON editor
    }

    closeCharacterModal() {
        document.getElementById('characterModal').style.display = 'none';
    }

    saveCharacterModal() {
        // Save changes from modal and close
        this.closeCharacterModal();
        this.refreshCharacterDisplay();
    }

    /**
     * Undo/Redo functionality
     */
    undo() {
        if (this.dataModel.undo()) {
            this.refreshCharacterDisplay();
            this.populateStudioInfo();
            this.showMessage('Change undone', 'success');
        } else {
            this.showMessage('Nothing to undo', 'info');
        }
    }

    redo() {
        if (this.dataModel.redo()) {
            this.refreshCharacterDisplay();
            this.populateStudioInfo();
            this.showMessage('Change redone', 'success');
        } else {
            this.showMessage('Nothing to redo', 'info');
        }
    }

    /**
     * Save export
     */
    downloadSave() {
        try {
            const modifiedSave = this.dataModel.exportSave();
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
     * UI helpers
     */
    showLoading() {
        document.body.classList.add('loading');
    }

    hideLoading() {
        document.body.classList.remove('loading');
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
    new HollywoodSaveEditor();
});
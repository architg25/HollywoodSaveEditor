/**
 * Enhanced Data Model for Hollywood Animal Save Editor
 * Combines hollywood_animal_editor's structure with HollyJson's advanced features
 */

import { SaveFormatManager, NewSaveAdapter } from './saveFormat.js';

/**
 * Main data model class
 */
export class HollywoodDataModel {
    constructor() {
        this.saveData = null;
        this.adapter = null;
        this.characters = [];
        this.studioInfo = {};
        this.gameYear = null;
        this.formatManager = new SaveFormatManager();

        // HollyJson-style features
        this.changeHistory = [];
        this.currentChangeIndex = -1;
        this.maxHistorySize = 50;

        // Character labels/traits from HollyJson
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

        // Profession mappings
        this.professionTypes = {
            'Actor': 'actors',
            'Director': 'directors',
            'Producer': 'producers',
            'Scriptwriter': 'writers',
            'FilmEditor': 'editors',
            'Cinematographer': 'cinematographers',
            'Composer': 'composers'
        };

        // Studio mappings
        this.studioMappings = {
            'PL': 'Player Studio',
            'EM': 'Evergreen Movies',
            'GB': 'Gerstein Bros.',
            'MA': 'Marginese',
            'SU': 'Supreme',
            'HE': 'Hephaestus'
        };
    }

    /**
     * Load save data
     * @param {Object} saveData - Parsed save JSON
     * @returns {Object} Load result
     */
    loadSave(saveData) {
        try {
            const validation = this.formatManager.validateSave(saveData);

            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.error
                };
            }

            this.saveData = saveData;
            this.adapter = this.formatManager.createAdapter(saveData);
            this.gameYear = validation.gameYear;

            // Load all data
            this.loadCharacters();
            this.loadStudioInfo();

            // Clear change history
            this.changeHistory = [];
            this.currentChangeIndex = -1;

            return {
                success: true,
                validation: validation,
                characterCount: this.characters.length,
                gameYear: this.gameYear
            };

        } catch (error) {
            return {
                success: false,
                error: `Failed to load save: ${error.message}`
            };
        }
    }

    /**
     * Load and enhance character data
     */
    loadCharacters() {
        const rawCharacters = this.adapter.getCharacters();

        this.characters = rawCharacters.map(char => ({
            // Basic character data
            id: char.id,
            firstNameId: char.firstNameId,
            lastNameId: char.lastNameId,
            birthDate: char.birthDate,
            deathDate: char.deathDate,
            gender: char.gender,

            // Enhanced data
            age: this.adapter.calculateAge(char),
            professions: char.professions || {},
            traits: this.adapter.getCharacterTraits(char),
            whiteTagsNEW: this.adapter.normalizeWhiteTags(char),
            contract: this.adapter.getCharacterContract(char),

            // Limits (keep both for compatibility)
            limit: char.limit,
            Limit: char.Limit,

            // Movies participation
            movies: char.movies || {},

            // Studio assignment
            studioId: char.studioId,

            // Additional data for advanced features
            mood: char.mood || 0,
            attitude: char.attitude || 0,

            // Keep reference to original for editing
            _original: char
        }));
    }

    /**
     * Load studio information
     */
    loadStudioInfo() {
        this.studioInfo = this.adapter.getStudioInfo();
    }

    /**
     * Get characters by profession
     * @param {string} profession - Profession type
     * @returns {Array} Filtered characters
     */
    getCharactersByProfession(profession) {
        return this.characters.filter(char =>
            char.professions && char.professions[profession]
        );
    }

    /**
     * Get characters by studio
     * @param {string} studioId - Studio ID
     * @returns {Array} Filtered characters
     */
    getCharactersByStudio(studioId) {
        return this.characters.filter(char => char.studioId === studioId);
    }

    /**
     * Get characters by trait
     * @param {string} trait - Trait name
     * @returns {Array} Filtered characters
     */
    getCharactersByTrait(trait) {
        return this.characters.filter(char =>
            char.traits && char.traits.includes(trait)
        );
    }

    /**
     * Get living characters
     * @returns {Array} Living characters
     */
    getLivingCharacters() {
        return this.characters.filter(char =>
            !char.deathDate || char.deathDate === '01-01-0001'
        );
    }

    /**
     * Get dead characters
     * @returns {Array} Dead characters
     */
    getDeadCharacters() {
        return this.characters.filter(char =>
            char.deathDate && char.deathDate !== '01-01-0001'
        );
    }

    /**
     * Advanced filtering with multiple criteria
     * @param {Object} filters - Filter criteria
     * @returns {Array} Filtered characters
     */
    filterCharacters(filters) {
        let filtered = [...this.characters];

        if (filters.profession) {
            filtered = filtered.filter(char =>
                char.professions && char.professions[filters.profession]
            );
        }

        if (filters.studio) {
            filtered = filtered.filter(char => char.studioId === filters.studio);
        }

        if (filters.trait) {
            filtered = filtered.filter(char =>
                char.traits && char.traits.includes(filters.trait)
            );
        }

        if (filters.alive !== undefined) {
            if (filters.alive) {
                filtered = this.getLivingCharacters().filter(char =>
                    filtered.includes(char)
                );
            } else {
                filtered = this.getDeadCharacters().filter(char =>
                    filtered.includes(char)
                );
            }
        }

        if (filters.ageMin !== undefined) {
            filtered = filtered.filter(char =>
                char.age !== null && char.age >= filters.ageMin
            );
        }

        if (filters.ageMax !== undefined) {
            filtered = filtered.filter(char =>
                char.age !== null && char.age <= filters.ageMax
            );
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(char => {
                const firstName = this.getCharacterName(char.firstNameId) || '';
                const lastName = this.getCharacterName(char.lastNameId) || '';
                const fullName = `${firstName} ${lastName}`.toLowerCase();
                return fullName.includes(searchLower);
            });
        }

        return filtered;
    }

    /**
     * HollyJson-style bulk operations
     */

    /**
     * Set all characters' mood and attitude
     * @param {number} mood - Mood value (0-1)
     * @param {number} attitude - Attitude value (0-1)
     * @param {Array} characterIds - Character IDs (optional, defaults to all)
     */
    bulkSetMoodAndAttitude(mood, attitude, characterIds = null) {
        const targets = characterIds ?
            this.characters.filter(char => characterIds.includes(char.id)) :
            this.characters;

        const changes = targets.map(char => ({
            type: 'bulk_mood_attitude',
            characterId: char.id,
            oldMood: char.mood,
            oldAttitude: char.attitude,
            newMood: mood,
            newAttitude: attitude
        }));

        this.recordChange({
            type: 'bulk_operation',
            operation: 'set_mood_attitude',
            changes: changes
        });

        targets.forEach(char => {
            char.mood = mood;
            char.attitude = attitude;
            char._original.mood = mood;
            char._original.attitude = attitude;
        });
    }

    /**
     * Set skill to limit for characters
     * @param {string} profession - Profession type
     * @param {Array} characterIds - Character IDs (optional)
     */
    bulkSetSkillToLimit(profession, characterIds = null) {
        const targets = characterIds ?
            this.characters.filter(char => characterIds.includes(char.id)) :
            this.getCharactersByProfession(profession);

        const changes = targets.map(char => {
            const oldSkill = char.professions[profession];
            const newSkill = char.limit || char.Limit;
            return {
                type: 'bulk_skill_to_limit',
                characterId: char.id,
                profession: profession,
                oldSkill: oldSkill,
                newSkill: newSkill
            };
        });

        this.recordChange({
            type: 'bulk_operation',
            operation: 'set_skill_to_limit',
            changes: changes
        });

        targets.forEach(char => {
            if (char.professions[profession] && (char.limit || char.Limit)) {
                const newValue = char.limit || char.Limit;
                char.professions[profession] = newValue;
                char._original.professions[profession] = newValue;
            }
        });
    }

    /**
     * Add trait to multiple characters
     * @param {string} trait - Trait to add
     * @param {Array} characterIds - Character IDs
     */
    bulkAddTrait(trait, characterIds) {
        const targets = this.characters.filter(char => characterIds.includes(char.id));

        const changes = targets.map(char => ({
            type: 'bulk_add_trait',
            characterId: char.id,
            trait: trait,
            hadTrait: char.traits.includes(trait)
        }));

        this.recordChange({
            type: 'bulk_operation',
            operation: 'add_trait',
            changes: changes
        });

        targets.forEach(char => {
            if (!char.traits.includes(trait)) {
                char.traits.push(trait);
                if (!char._original.traits) char._original.traits = [];
                char._original.traits.push(trait);
            }
        });
    }

    /**
     * Remove trait from multiple characters
     * @param {string} trait - Trait to remove
     * @param {Array} characterIds - Character IDs
     */
    bulkRemoveTrait(trait, characterIds) {
        const targets = this.characters.filter(char => characterIds.includes(char.id));

        const changes = targets.map(char => ({
            type: 'bulk_remove_trait',
            characterId: char.id,
            trait: trait,
            hadTrait: char.traits.includes(trait)
        }));

        this.recordChange({
            type: 'bulk_operation',
            operation: 'remove_trait',
            changes: changes
        });

        targets.forEach(char => {
            const index = char.traits.indexOf(trait);
            if (index > -1) {
                char.traits.splice(index, 1);
                const origIndex = char._original.traits.indexOf(trait);
                if (origIndex > -1) {
                    char._original.traits.splice(origIndex, 1);
                }
            }
        });
    }

    /**
     * Change history management (undo/redo functionality)
     */

    /**
     * Record a change for undo/redo
     * @param {Object} change - Change data
     */
    recordChange(change) {
        // Remove any changes after current index (if we're not at the end)
        if (this.currentChangeIndex < this.changeHistory.length - 1) {
            this.changeHistory = this.changeHistory.slice(0, this.currentChangeIndex + 1);
        }

        // Add new change
        this.changeHistory.push({
            ...change,
            timestamp: new Date().toISOString()
        });

        // Update current index
        this.currentChangeIndex = this.changeHistory.length - 1;

        // Trim history if too large
        if (this.changeHistory.length > this.maxHistorySize) {
            this.changeHistory.shift();
            this.currentChangeIndex--;
        }
    }

    /**
     * Undo last change
     * @returns {boolean} Whether undo was successful
     */
    undo() {
        if (this.currentChangeIndex < 0) return false;

        const change = this.changeHistory[this.currentChangeIndex];
        this.applyReverseChange(change);
        this.currentChangeIndex--;
        return true;
    }

    /**
     * Redo next change
     * @returns {boolean} Whether redo was successful
     */
    redo() {
        if (this.currentChangeIndex >= this.changeHistory.length - 1) return false;

        this.currentChangeIndex++;
        const change = this.changeHistory[this.currentChangeIndex];
        this.applyChange(change);
        return true;
    }

    /**
     * Apply a change (for redo)
     * @param {Object} change - Change to apply
     */
    applyChange(change) {
        // Implementation depends on change type
        // This would be expanded based on specific change types
        console.log('Applying change:', change);
    }

    /**
     * Apply reverse of a change (for undo)
     * @param {Object} change - Change to reverse
     */
    applyReverseChange(change) {
        // Implementation depends on change type
        // This would be expanded based on specific change types
        console.log('Reversing change:', change);
    }

    /**
     * Get character name by ID (requires name mapping)
     * @param {string} nameId - Name ID
     * @returns {string} Character name
     */
    getCharacterName(nameId) {
        // This will be connected to the name mapping system
        return `Name_${nameId}`;
    }

    /**
     * Export modified save data
     * @returns {Object} Modified save data
     */
    exportSave() {
        // Update original save data with modifications
        // This ensures we preserve all original structure while applying changes
        return JSON.parse(JSON.stringify(this.saveData));
    }
}
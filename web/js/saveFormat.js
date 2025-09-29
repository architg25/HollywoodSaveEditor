/**
 * Hollywood Animal NewSave Format Manager
 * Handles detection and validation of newSave formats with version flexibility
 */

class SaveFormatManager {
    constructor() {
        this.knownVersions = [
            '0.8.50EA', '0.8.51EA', '0.8.52EA', '0.8.53EA', '0.8.54EA'
        ];
        this.minSupportedVersion = '0.8.50EA';
    }

    /**
     * Validate newSave format from JSON data
     * @param {Object} saveData - Parsed JSON save data
     * @returns {Object} Validation result
     */
    validateSave(saveData) {
        try {
            // Check for required top-level structure
            if (!saveData.currentMeta || !saveData.stateJson) {
                return {
                    isValid: false,
                    error: 'Invalid save file structure: missing currentMeta or stateJson'
                };
            }

            const version = saveData.currentMeta.lastSaveVersion || saveData.currentMeta.firstSaveVersion;

            if (!version) {
                return {
                    isValid: false,
                    error: 'Cannot determine save file version'
                };
            }

            // Check if version is supported (flexible version checking)
            const isKnownVersion = this.knownVersions.includes(version);
            const isLikelySupported = this.isVersionLikelySupported(version);

            // Additional validation checks
            const validation = this.validateSaveStructure(saveData);

            return {
                isValid: validation.isValid,
                version: version,
                isKnownVersion: isKnownVersion,
                isLikelySupported: isLikelySupported,
                characterCount: validation.characterCount,
                gameDate: this.extractGameDate(saveData),
                gameYear: this.extractGameYear(saveData),
                warnings: validation.warnings,
                error: validation.error
            };

        } catch (error) {
            return {
                isValid: false,
                error: `Save validation failed: ${error.message}`
            };
        }
    }

    /**
     * Check if version is likely supported based on patterns
     * @param {string} version - Version string
     * @returns {boolean} Whether version is likely supported
     */
    isVersionLikelySupported(version) {
        // Support 0.8.5x and newer versions
        const versionMatch = version.match(/^0\.8\.(\d+)/);
        if (versionMatch) {
            const minor = parseInt(versionMatch[1]);
            return minor >= 50; // Support 0.8.50 and newer
        }
        return false;
    }

    /**
     * Validate save file structure for newSave format
     * @param {Object} saveData - Parsed save data
     * @returns {Object} Validation result
     */
    validateSaveStructure(saveData) {
        const warnings = [];
        let characterCount = 0;

        try {
            // Find characters array using breadth-first search
            const charactersArray = this.findCharactersArray(saveData);

            if (!charactersArray) {
                return {
                    isValid: false,
                    error: 'Could not find characters array in save file'
                };
            }

            characterCount = charactersArray.length;

            // Check for common required fields
            if (characterCount > 0) {
                const sampleChar = charactersArray[0];
                const requiredFields = ['id', 'professions', 'birthDate'];

                for (const field of requiredFields) {
                    if (!(field in sampleChar)) {
                        warnings.push(`Missing expected field: ${field}`);
                    }
                }

                // NewSave specific validations
                if (!sampleChar.limit && !sampleChar.Limit) {
                    warnings.push('Missing limit fields (expected in newSave format)');
                }

                // Check for whiteTagsNEW vs whiteTagsNew
                if (sampleChar.whiteTagsNew && !sampleChar.whiteTagsNEW) {
                    warnings.push('Found whiteTagsNew instead of whiteTagsNEW - will normalize');
                }
            }

            return {
                isValid: true,
                characterCount: characterCount,
                warnings: warnings
            };

        } catch (error) {
            return {
                isValid: false,
                error: `Validation failed: ${error.message}`
            };
        }
    }

    /**
     * Find characters array using breadth-first search
     * @param {Object} data - Data object to search
     * @returns {Array|null} Characters array or null
     */
    findCharactersArray(data) {
        const queue = [data];
        const visited = new Set();

        while (queue.length > 0) {
            const current = queue.shift();

            if (!current || typeof current !== 'object' || visited.has(current)) {
                continue;
            }

            visited.add(current);

            // Check if current object has a characters array
            if (Array.isArray(current.characters)) {
                // Validate it contains character-like objects
                if (current.characters.length > 0 &&
                    current.characters[0].hasOwnProperty('id') &&
                    current.characters[0].hasOwnProperty('professions')) {
                    return current.characters;
                }
            }

            // Add child objects to queue
            for (const key in current) {
                if (current.hasOwnProperty(key) && typeof current[key] === 'object') {
                    queue.push(current[key]);
                }
            }
        }

        return null;
    }

    /**
     * Extract game date from save data
     * @param {Object} saveData - Save data
     * @returns {string|null} Game date
     */
    extractGameDate(saveData) {
        try {
            // newSave format stores current game date in latest log entry
            if (saveData.stateJson.logs && saveData.stateJson.logs.length > 0) {
                const latestLog = saveData.stateJson.logs[saveData.stateJson.logs.length - 1];
                if (latestLog.timestamp) {
                    return latestLog.timestamp;
                }
            }

            // Fallback: look for any date with game year (1929+)
            if (saveData.stateJson.nextGenCharacterTimers?.Talent?.Actor) {
                return saveData.stateJson.nextGenCharacterTimers.Talent.Actor;
            }

            return null;
        } catch (error) {
            console.warn('Could not extract game date:', error);
            return null;
        }
    }

    /**
     * Extract game year for age calculations
     * @param {Object} saveData - Save data
     * @returns {number|null} Game year
     */
    extractGameYear(saveData) {
        try {
            const gameDate = this.extractGameDate(saveData);
            if (gameDate) {
                const match = gameDate.match(/(\d{4})/);
                return match ? parseInt(match[1]) : null;
            }
            return null;
        } catch (error) {
            console.warn('Could not extract game year:', error);
            return null;
        }
    }

    /**
     * Get newSave capabilities
     * @returns {Object} Capabilities object
     */
    getCapabilities() {
        return {
            characterEditing: true,
            studioManagement: true,
            nameResolution: true,
            traitManagement: true,
            bulkOperations: true,
            contractEditing: true,
            movieIntegration: true,
            executiveManagement: true,
            whiteTagsNEW: true,
            advancedFiltering: true,
            ageCalculation: true
        };
    }

    /**
     * Create newSave adapter
     * @param {Object} saveData - Save data
     * @returns {NewSaveAdapter} Format adapter
     */
    createAdapter(saveData) {
        return new NewSaveAdapter(saveData);
    }
}

/**
 * NewSave format adapter with enhanced features from HollyJson
 */
class NewSaveAdapter {
    constructor(saveData) {
        this.saveData = saveData;
        this.formatManager = new SaveFormatManager();
        this.characters = this.findCharacters();
        this.gameYear = this.formatManager.extractGameYear(saveData);
    }

    findCharacters() {
        return this.formatManager.findCharactersArray(this.saveData) || [];
    }

    getCharacters() {
        return this.characters;
    }

    getStudioInfo() {
        try {
            const state = this.saveData.stateJson;

            // newSave format has studio info directly in stateJson
            return {
                budget: state.budget || 0,
                cash: state.cash || 0,
                reputation: parseFloat(state.reputation || 0),
                influence: state.influence || 0,
                boutiqueLevel: state.boutiqueLevel || 0
            };
        } catch (error) {
            console.warn('Could not extract studio info:', error);
            return {};
        }
    }

    /**
     * Helper to find values in nested objects
     * @param {Object} obj - Object to search
     * @param {Array} paths - Array of dot-notation paths
     * @returns {*} Found value or undefined
     */
    findValue(obj, paths) {
        for (const path of paths) {
            const value = this.getNestedValue(obj, path);
            if (value !== undefined) return value;
        }
        return undefined;
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Get character with enhanced data (age calculation, trait management)
     * @param {number} characterId - Character ID
     * @returns {Object|null} Enhanced character data
     */
    getEnhancedCharacter(characterId) {
        const character = this.characters.find(c => c.id === characterId);
        if (!character) return null;

        return {
            ...character,
            age: this.calculateAge(character),
            traits: this.getCharacterTraits(character),
            whiteTagsNEW: this.normalizeWhiteTags(character),
            skills: this.getCharacterSkills(character),
            contract: this.getCharacterContract(character)
        };
    }

    /**
     * Calculate character age
     * @param {Object} character - Character data
     * @returns {number|null} Age or null
     */
    calculateAge(character) {
        if (!character.birthDate || !this.gameYear) return null;

        try {
            const birthMatch = character.birthDate.match(/(\d{2})-(\d{2})-(\d{4})/);
            if (birthMatch) {
                const birthYear = parseInt(birthMatch[3]);
                return this.gameYear - birthYear;
            }
        } catch (error) {
            console.warn('Error calculating age for character:', character.id, error);
        }
        return null;
    }

    /**
     * Get character traits/labels
     * @param {Object} character - Character data
     * @returns {Array} Array of traits
     */
    getCharacterTraits(character) {
        return character.traits || character.labels || [];
    }

    /**
     * Normalize whiteTagsNEW vs whiteTagsNew
     * @param {Object} character - Character data
     * @returns {Object} Normalized white tags
     */
    normalizeWhiteTags(character) {
        return character.whiteTagsNEW || character.whiteTagsNew || {};
    }

    /**
     * Get character skills from professions
     * @param {Object} character - Character data
     * @returns {Object} Skills object
     */
    getCharacterSkills(character) {
        return character.professions || {};
    }

    /**
     * Get character contract information
     * @param {Object} character - Character data
     * @returns {Object} Contract data
     */
    getCharacterContract(character) {
        return character.contract || {};
    }
}
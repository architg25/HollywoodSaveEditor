/**
 * Name Resolver for Hollywood Animal Characters
 * Handles mapping character name IDs to actual names
 */

export class NameResolver {
    constructor() {
        this.names = {};
    }

    /**
     * Load names from CHARACTER_NAMES.json data
     * @param {Object} nameData - Name data from JSON file
     */
    loadNames(nameData) {
        if (nameData.locStrings && Array.isArray(nameData.locStrings)) {
            this.names = nameData.locStrings;
        }
    }

    /**
     * Get character name by ID
     * @param {string|number} nameId - Name ID
     * @returns {string|null} Character name or null if not found
     */
    getName(nameId) {
        const id = parseInt(nameId);
        return this.names[id] || null;
    }

    /**
     * Check if names are loaded
     * @returns {boolean} Whether names are available
     */
    hasNames() {
        return Object.keys(this.names).length > 0;
    }

    /**
     * Get total number of names available
     * @returns {number} Number of names
     */
    getNameCount() {
        return Object.keys(this.names).length;
    }
}
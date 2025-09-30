/**
 * Interactive Field Discovery Tool for Hollywood Animal Save Editor
 * Helps you quickly find and understand save file fields
 */

class FieldDiscovery {
    constructor(saveData) {
        this.saveData = saveData;
        this.cache = new Map();
        this.setupQuickSearches();
    }

    /**
     * Search for fields by name, value, or pattern
     */
    search(query, options = {}) {
        const {
            caseSensitive = false,
            exactMatch = false,
            includeValues = true,
            maxResults = 50
        } = options;

        const results = [];
        this._searchRecursive(this.saveData, query, '', results, {
            caseSensitive, exactMatch, includeValues, maxResults
        });

        return results.slice(0, maxResults);
    }

    /**
     * Find all instances of a specific field name
     */
    findFieldName(fieldName) {
        return this.search(fieldName, { exactMatch: true, includeValues: false });
    }

    /**
     * Find fields with specific value patterns
     */
    findByValue(value, type = null) {
        const results = [];
        this._findByValueRecursive(this.saveData, value, type, '', results);
        return results;
    }

    /**
     * Get field statistics (useful for understanding data ranges)
     */
    getFieldStats(fieldPath) {
        const values = this.getAllValuesAtPath(fieldPath);

        if (values.length === 0) return null;

        const stats = {
            count: values.length,
            type: typeof values[0],
            unique: [...new Set(values)].length
        };

        if (typeof values[0] === 'number') {
            stats.min = Math.min(...values);
            stats.max = Math.max(...values);
            stats.avg = values.reduce((a, b) => a + b, 0) / values.length;
        }

        if (typeof values[0] === 'string') {
            stats.minLength = Math.min(...values.map(v => v.length));
            stats.maxLength = Math.max(...values.map(v => v.length));
            stats.samples = values.slice(0, 5);
        }

        return stats;
    }

    /**
     * Quick searches for common game elements
     */
    setupQuickSearches() {
        this.quickSearches = {
            // Character-related
            characters: () => this.findFieldName('characters'),
            names: () => this.search('name', { caseSensitive: false }),
            skills: () => this.search('profession', { caseSensitive: false }),

            // Studio-related
            money: () => this.search('budget|cash|salary|fee', { caseSensitive: false }),
            dates: () => this.search('date|time', { caseSensitive: false }),

            // Movie-related
            movies: () => this.findFieldName('movies'),
            genres: () => this.search('genre', { caseSensitive: false }),

            // Policy-related
            policies: () => this.search('policy|milestone', { caseSensitive: false }),

            // IDs and references
            ids: () => this.search('id$', { exactMatch: false }),

            // Arrays (useful for bulk operations)
            arrays: () => this.findArrays(),

            // Numbers (useful for cheats/modifications)
            numbers: () => this.findNumbers(),

            // Booleans (useful for feature toggles)
            booleans: () => this.findBooleans()
        };
    }

    /**
     * Generate quick reference guide
     */
    generateQuickReference() {
        const reference = {
            // Most common modification paths
            commonPaths: {
                'Character Name': 'stateJson.characters[].firstNameId',
                'Character Skill': 'stateJson.characters[].professions[profession]',
                'Character Limit': 'stateJson.characters[].limit',
                'Character Mood': 'stateJson.characters[].mood',
                'Character Contract Days': 'stateJson.characters[].contract.DaysLeft',
                'Studio Budget': 'stateJson.budget',
                'Studio Cash': 'stateJson.cash',
                'Studio Reputation': 'stateJson.reputation',
                'Studio Influence': 'stateJson.influence',
                'Active Policy': 'stateJson.ACTIVE_POLICY',
                'Boutique Level': 'stateJson.boutiqueLevel'
            },

            // Field patterns to watch for
            patterns: {
                'IDs': 'Usually end with "Id" or "ID"',
                'Dates': 'Usually contain "date" or "Date" in field name',
                'Money': 'Usually "budget", "cash", "salary", "fee" fields',
                'Skills': 'Usually in "professions" object',
                'Limits': 'Usually "limit" or "Limit" fields',
                'Contracts': 'Usually in "contract" object'
            },

            // Quick search commands
            searches: Object.keys(this.quickSearches).map(key => ({
                command: `discovery.quickSearches.${key}()`,
                description: `Find ${key}-related fields`
            }))
        };

        return reference;
    }

    /**
     * Interactive explorer for unknown structures
     */
    explore(path = '') {
        const obj = path ? this._getByPath(this.saveData, path) : this.saveData;

        if (!obj || typeof obj !== 'object') {
            return { error: 'Invalid path or not an object' };
        }

        const exploration = {
            currentPath: path,
            type: Array.isArray(obj) ? 'array' : 'object',
            fields: {}
        };

        if (Array.isArray(obj)) {
            exploration.length = obj.length;
            exploration.sampleElements = obj.slice(0, 3).map((item, index) => ({
                index,
                type: typeof item,
                preview: this._preview(item)
            }));
        } else {
            for (const [key, value] of Object.entries(obj)) {
                exploration.fields[key] = {
                    type: typeof value,
                    isArray: Array.isArray(value),
                    hasChildren: typeof value === 'object' && value !== null,
                    preview: this._preview(value),
                    path: path ? `${path}.${key}` : key
                };
            }
        }

        return exploration;
    }

    // Helper methods
    _searchRecursive(obj, query, currentPath, results, options) {
        if (results.length >= options.maxResults) return;

        if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                const fieldPath = currentPath ? `${currentPath}.${key}` : key;

                // Check field name match
                const searchKey = options.caseSensitive ? key : key.toLowerCase();
                const searchQuery = options.caseSensitive ? query : query.toLowerCase();

                const matches = options.exactMatch ?
                    searchKey === searchQuery :
                    searchKey.includes(searchQuery);

                if (matches) {
                    results.push({
                        fieldName: key,
                        path: fieldPath,
                        value: options.includeValues ? this._preview(value) : undefined,
                        type: typeof value
                    });
                }

                // Recurse into objects/arrays
                if (typeof value === 'object' && value !== null) {
                    this._searchRecursive(value, query, fieldPath, results, options);
                }
            }
        }
    }

    _preview(value) {
        if (value === null || value === undefined) return value;
        if (typeof value === 'string' && value.length > 50) return value.substring(0, 50) + '...';
        if (Array.isArray(value)) return `[Array(${value.length})]`;
        if (typeof value === 'object') return `{Object with ${Object.keys(value).length} keys}`;
        return value;
    }

    _getByPath(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    getAllValuesAtPath(fieldPath) {
        // Implementation for getting all values at a specific path
        const values = [];
        this._collectValuesAtPath(this.saveData, fieldPath, '', values);
        return values;
    }

    _collectValuesAtPath(obj, targetPath, currentPath, results) {
        if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                const fieldPath = currentPath ? `${currentPath}.${key}` : key;

                if (fieldPath === targetPath) {
                    results.push(value);
                }

                if (typeof value === 'object' && value !== null) {
                    this._collectValuesAtPath(value, targetPath, fieldPath, results);
                }
            }
        }
    }

    findArrays() {
        const arrays = [];
        this._findArraysRecursive(this.saveData, '', arrays);
        return arrays;
    }

    _findArraysRecursive(obj, currentPath, results) {
        if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                const fieldPath = currentPath ? `${currentPath}.${key}` : key;

                if (Array.isArray(value)) {
                    results.push({
                        path: fieldPath,
                        length: value.length,
                        elementType: value.length > 0 ? typeof value[0] : 'unknown'
                    });
                }

                if (typeof value === 'object' && value !== null) {
                    this._findArraysRecursive(value, fieldPath, results);
                }
            }
        }
    }

    findNumbers() {
        const numbers = [];
        this._findByTypeRecursive(this.saveData, 'number', '', numbers);
        return numbers;
    }

    findBooleans() {
        const booleans = [];
        this._findByTypeRecursive(this.saveData, 'boolean', '', booleans);
        return booleans;
    }

    _findByTypeRecursive(obj, targetType, currentPath, results) {
        if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                const fieldPath = currentPath ? `${currentPath}.${key}` : key;

                if (typeof value === targetType) {
                    results.push({
                        path: fieldPath,
                        value: value
                    });
                }

                if (typeof value === 'object' && value !== null) {
                    this._findByTypeRecursive(value, targetType, fieldPath, results);
                }
            }
        }
    }

    _findByValueRecursive(obj, targetValue, targetType, currentPath, results) {
        if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
                const fieldPath = currentPath ? `${currentPath}.${key}` : key;

                const matches = targetType ?
                    (typeof value === targetType && value === targetValue) :
                    value === targetValue;

                if (matches) {
                    results.push({
                        path: fieldPath,
                        value: value
                    });
                }

                if (typeof value === 'object' && value !== null) {
                    this._findByValueRecursive(value, targetValue, targetType, fieldPath, results);
                }
            }
        }
    }
}

// Browser console helper
window.createFieldDiscovery = (saveData) => {
    window.discovery = new FieldDiscovery(saveData);
    console.log('🔍 Field Discovery Tool ready!');
    console.log('Try: discovery.search("policy") or discovery.quickSearches.money()');
    console.log('Quick reference: discovery.generateQuickReference()');
    return window.discovery;
};
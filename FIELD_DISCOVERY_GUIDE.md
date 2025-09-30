# Field Discovery Guide for Hollywood Animal Save Editor

## 🚀 Quick Start

### 1. Enable Field Discovery in Browser Console

```javascript
// After loading a save file in the editor
createFieldDiscovery(window.hollyjsonApp.saveData);

// Now you can use discovery commands
discovery.search('policy');
discovery.quickSearches.money();
discovery.explore('stateJson.characters[0]');
```

### 2. Common Discovery Commands

```javascript
// Find all policy-related fields
discovery.search('policy');

// Find all money-related fields
discovery.quickSearches.money();

// Explore character structure
discovery.explore('stateJson.characters[0]');

// Find all boolean flags (for feature toggles)
discovery.quickSearches.booleans();

// Get quick reference of common paths
discovery.generateQuickReference();
```

## 🔍 Field Discovery Methods

### **Basic Search**
```javascript
// Search for fields containing "budget"
discovery.search('budget');

// Case-sensitive search
discovery.search('Budget', { caseSensitive: true });

// Exact field name match
discovery.search('boutiqueLevel', { exactMatch: true });
```

### **Value-Based Search**
```javascript
// Find all fields with value "true"
discovery.findByValue(true);

// Find all fields with value 0
discovery.findByValue(0);

// Find all numeric fields with specific value
discovery.findByValue(1000, 'number');
```

### **Structure Exploration**
```javascript
// Explore top-level structure
discovery.explore();

// Explore specific sections
discovery.explore('stateJson');
discovery.explore('stateJson.characters');
discovery.explore('stateJson.characters[0]');
discovery.explore('stateJson.milestones');
```

### **Quick Searches**
```javascript
discovery.quickSearches.characters();  // Find character-related fields
discovery.quickSearches.money();       // Find money-related fields
discovery.quickSearches.policies();    // Find policy-related fields
discovery.quickSearches.movies();      // Find movie-related fields
discovery.quickSearches.arrays();      // Find all arrays
discovery.quickSearches.numbers();     // Find all numeric fields
discovery.quickSearches.booleans();    // Find all boolean fields
```

## 📊 Field Analysis

### **Get Field Statistics**
```javascript
// Analyze character limits
discovery.getFieldStats('stateJson.characters[].limit');

// Analyze studio budget values
discovery.getFieldStats('stateJson.budget');

// Results include: min, max, avg, count, type, unique values
```

### **Quick Reference**
```javascript
const ref = discovery.generateQuickReference();
console.log(ref.commonPaths);  // Common modification paths
console.log(ref.patterns);     // Field naming patterns
console.log(ref.searches);     // Available quick searches
```

## 🛠️ Rapid Feature Development Workflow

### **Step 1: Discovery (2-5 minutes)**
```javascript
// Example: Adding a new cheat feature for experience points
discovery.search('xp');
discovery.search('experience');
discovery.search('skill');
discovery.quickSearches.numbers();
```

### **Step 2: Structure Analysis (1-2 minutes)**
```javascript
// Explore the area you found
discovery.explore('stateJson.characters[0].professions');
discovery.getFieldStats('stateJson.characters[].professions.ACTOR');
```

### **Step 3: Quick Testing (5-10 minutes)**
```javascript
// Test modification directly in console
const testChar = window.hollyjsonApp.saveData.stateJson.characters[0];
console.log('Before:', testChar.professions.ACTOR);
testChar.professions.ACTOR = 1.0;
console.log('After:', testChar.professions.ACTOR);
```

### **Step 4: Implementation (10-15 minutes)**
Use the discovered paths in your HTML/JS implementation.

## 📝 Common Field Patterns

### **Character Data**
```javascript
// Characters are in: stateJson.characters[]
// Each character has:
// - id, firstNameId, lastNameId
// - mood, attitude, limit
// - professions{} object
// - contract{} object
// - labels[] array (traits)
// - whiteTagsNEW{} object (skills)
```

### **Studio Data**
```javascript
// Studio info is in: stateJson.*
// Common fields:
// - budget, cash, reputation, influence
// - studioName, gameDate
// - boutiqueLevel, ACTIVE_POLICY
```

### **Movie Data**
```javascript
// Movies are in: stateJson.movies[]
// Each movie has:
// - id, name, studioId
// - currentStage, stageResults{}
// - genreIdsAndFractions[]
```

### **Policy Data**
```javascript
// Policies are in: stateJson.milestones{}
// Pattern: POLICY_{TYPE}_{LEVEL}
// Also: stateJson.ACTIVE_POLICY
// Boutique specific: stateJson.boutiqueLevel
```

## 🎯 Feature Development Examples

### **Example 1: Money Cheat**
```javascript
// 1. Discovery
discovery.quickSearches.money();
// Result: Found budget, cash, reputation fields

// 2. Implementation paths
const paths = {
    budget: 'stateJson.budget',
    cash: 'stateJson.cash',
    reputation: 'stateJson.reputation'
};
```

### **Example 2: Character Enhancement**
```javascript
// 1. Discovery
discovery.explore('stateJson.characters[0]');
// Result: Found limit, mood, attitude, professions

// 2. Implementation paths
const charPaths = {
    limit: 'stateJson.characters[].limit',
    mood: 'stateJson.characters[].mood',
    skill: 'stateJson.characters[].professions[profession]'
};
```

### **Example 3: Feature Unlocking**
```javascript
// 1. Discovery
discovery.quickSearches.booleans();
discovery.search('unlock');
discovery.search('milestone');

// 2. Implementation - create unlock system
const unlockFeature = (featureName) => {
    // Pattern discovered: milestone system
    const milestoneId = `UNLOCK_${featureName.toUpperCase()}`;
    // Implementation follows...
};
```

## 💡 Pro Tips

1. **Always start with discovery** - Don't guess field names
2. **Use explore() liberally** - Understand structure before modifying
3. **Test in console first** - Verify changes work before implementing
4. **Check multiple save files** - Field presence can vary
5. **Document your findings** - Add to commonPaths for future use

## 🔧 Browser Console Integration

Add this to your browser console for even faster development:

```javascript
// Quick aliases
const find = (query) => discovery.search(query);
const explore = (path) => discovery.explore(path);
const quickRef = () => discovery.generateQuickReference();

// Feature testing helper
const testModification = (path, value) => {
    const current = getByPath(window.hollyjsonApp.saveData, path);
    console.log(`Before: ${path} = ${current}`);
    setByPath(window.hollyjsonApp.saveData, path, value);
    console.log(`After: ${path} = ${value}`);
};
```

This field discovery system will cut your feature development time from hours to minutes by eliminating the guesswork!
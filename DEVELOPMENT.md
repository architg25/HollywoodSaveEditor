# HollywoodSaveEditor Development Guide

## What We've Built

A comprehensive save editor for Hollywood Animal that combines:
- **hollywood_animal_editor's** web-based simplicity and cross-platform compatibility
- **HollyJson's** advanced editing features like bulk operations, trait management, and sophisticated UI

## Features Implemented

### 🏗️ Core Architecture
- **NewSave Format Support**: Focused on newSave format (0.8.50EA+) with flexible version detection
- **Unified Data Model**: Clean abstraction layer for save data manipulation
- **Change History**: Full undo/redo functionality for all operations

### 🎭 Character Management
- **Multi-Role Support**: Actors, Directors, Producers, Writers, Editors, Executives
- **Enhanced Editing**: Direct skill/limit editing with real-time sliders
- **Age Calculation**: Automatic age calculation from birth date and game year
- **Name Resolution**: Integration with CHARACTER_NAMES.json

### Executives (corporate and lieutenants)
- Identification: entries where `professions` has keys starting with `Cpt` (e.g., `CptHR`, `CptLawyer`, `CptFinancier`, `CptPR`) or `Lieut` (e.g., `LieutRelease`, `LieutTech`).
- Displayed Department mapping (non-exhaustive):
    - `CptHR` → HR, `CptLawyer` → Legal, `CptFinancier` → Finance, `CptPR` → PR
    - `LieutRelease` → Distribution, `LieutTech` → Engineering (others may appear in different saves)
- Columns: Department, Level (`level` when present), EXP (`xp`), Happiness (`mood`, 0–1 saved; shown as 0–100), Morale (`attitude`, 0–1 saved; shown as 0–100), Upgrade-Money (`BonusCardMoney` → 0–50%), Upgrade-Influence (`BonusCardInfluencePoints` → 0–50%).
- Age editing uses shared behavior: change updates only the year in `birthDate`.


### ⚡ Bulk Operations (HollyJson Style)
- **Mood & Attitude**: Mass set mood and attitude for selected characters
- **Skills Management**: Set skill to limit, set skill to cap
- **Trait Management**: Add/remove traits from multiple characters
- **Age Setting**: Bulk age changes

### 🏢 Studio Management
- **Financial Controls**: Budget, cash, reputation, influence editing
- **Real-time Updates**: Immediate reflection of changes

### 🔍 Advanced Filtering & Search
- **Multi-criteria Filtering**: By profession, studio, traits, alive/dead status
- **Global Search**: Search by character names
- **Smart Sorting**: Multiple sorting options (skill, age, name)

### 🎨 Modern Interface
- **Responsive Design**: Works on desktop, tablet, mobile
- **Tabbed Interface**: Clean organization of different editing modes
- **Modal Dialogs**: Detailed character editing (framework in place)
- **Status Messages**: User feedback for all operations

## Project Structure

```
HollywoodSaveEditor/
├── web/
│   ├── index.html          # Main interface
│   ├── css/
│   │   └── style.css       # Modern, responsive styling
│   ├── js/
│   │   ├── app.js          # Main application controller
│   │   ├── saveFormat.js   # Save format detection & validation
│   │   ├── dataModel.js    # Data management & bulk operations
│   │   └── nameResolver.js # Character name mapping
│   └── data/
│       └── CHARACTER_NAMES.json # Character names database
├── docs/               # Documentation
├── python_scripts/     # Helper scripts (future)
└── README.md          # User documentation
```

## How to Run

```bash
# Start development server
cd HollywoodSaveEditor
python3 -m http.server 8000

# Open in browser
http://localhost:8000/web/
```

## Technical Highlights

### 1. Flexible Save Format Detection
```javascript
// Automatically detects newSave versions with future compatibility
isVersionLikelySupported(version) {
    const versionMatch = version.match(/^0\.8\.(\d+)/);
    if (versionMatch) {
        const minor = parseInt(versionMatch[1]);
        return minor >= 50; // Support 0.8.50 and newer
    }
    return false;
}
```

### 2. Unified Character Enhancement
```javascript
// Enriches character data with calculated fields
getEnhancedCharacter(characterId) {
    return {
        ...character,
        age: this.calculateAge(character),
        traits: this.getCharacterTraits(character),
        whiteTagsNEW: this.normalizeWhiteTags(character),
        skills: this.getCharacterSkills(character)
    };
}
```

### 3. HollyJson-Style Bulk Operations
```javascript
// Mass operations with change tracking
bulkSetMoodAndAttitude(mood, attitude, characterIds) {
    const changes = targets.map(char => ({
        type: 'bulk_mood_attitude',
        characterId: char.id,
        oldMood: char.mood,
        newMood: mood
    }));

    this.recordChange({ type: 'bulk_operation', changes });
}
```

### 4. Real-time UI Updates
```javascript
// Immediate feedback for slider changes
skillSlider.addEventListener('input', (e) => {
    skillValue.textContent = this.formatSkillValue(e.target.value);
});
```

## Next Steps for Enhancement

### Immediate (Ready to Implement)
1. **Character Detail Modal**: Complete the detailed editing interface
2. **JSON Editor**: Raw JSON editing for advanced users
3. **Executive Management**: Specialized UI for corporate/lieutenant characters
4. **Movie Integration**: Display character movie participation

### Medium Term
1. **Save Validation**: Enhanced error checking and repair
2. **Export Options**: Multiple file formats
3. **Backup System**: Automatic save backups
4. **Advanced Traits**: Custom trait definitions

### Advanced Features
1. **Save Comparison**: Compare different save files
2. **Character Analytics**: Statistics and insights
3. **Batch Processing**: Process multiple saves
4. **Plugin System**: Extensible architecture

## Code Quality Notes

- **Modular Design**: Clean separation of concerns
- **Error Handling**: Comprehensive error catching and user feedback
- **Performance**: Efficient filtering and sorting for large character lists
- **Accessibility**: Keyboard navigation and screen reader support
- **Browser Compatibility**: Modern ES6+ with broad browser support

## Testing Checklist

- [x] Save file loading (drag & drop, file picker)
- [x] Format detection and validation
- [x] Character display across all profession tabs
- [x] Studio management controls
- [x] Filtering and searching
- [x] Bulk operations interface
- [x] Undo/redo functionality
- [x] Save file export
- [ ] Character detail modal (framework ready)
- [ ] Name map loading
- [ ] Error handling edge cases

## Known Limitations

1. **oldSave Support**: Deliberately removed to focus on current format
2. **Executive Characters**: Basic support, needs specialized interface
3. **Character Creation**: Not implemented (editing only)
4. **Save Migration**: No format conversion utilities

This foundation provides everything needed to build a comprehensive Hollywood Animal save editor that surpasses both original tools in functionality and user experience.
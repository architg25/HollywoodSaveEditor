# HollywoodSaveEditor

A comprehensive save editor for Hollywood Animal that combines the best features of hollywood_animal_editor and HollyJson.

## Features

### Format Support
- **Dual Format Compatibility**: Supports both oldSave and newSave formats
- **Auto-Detection**: Automatically detects save format and adapts interface
- **Format Conversion**: Convert between oldSave ↔ newSave when possible

### Character Management
- **Enhanced Editing**: Full character editing with traits, skills, contracts
- **Bulk Operations**: Mass edit multiple characters at once
- **Advanced Filtering**: Filter by profession, studio, status, traits
- **Contract Management**: Detailed contract editing capabilities

### Studio Features
- **Studio Dashboard**: Edit budget, cash, reputation, influence
- **Building Management**: Control studio buildings and upgrades
- **Technology Tree**: Manage research and technology advancement

### Quality of Life
- **Web-based**: No installation required, runs anywhere
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Backup System**: Automatic backup before major changes
- **Export Options**: Multiple export formats

## Quick Start

### Running Locally
```bash
# Start the development server
python -m http.server 8000

# Open in browser
http://localhost:8000/web/
```

### Using the Editor
1. **Load Save**: Drag & drop your save file or use file picker
2. **Auto-Detection**: App automatically detects oldSave vs newSave format
3. **Edit**: Use tabs to navigate between different editing modes
4. **Save**: Download your edited save file

## Project Structure
```
HollywoodSaveEditor/
├── web/                 # Web application
│   ├── index.html      # Main interface
│   ├── js/             # JavaScript modules
│   ├── css/            # Stylesheets
│   └── data/           # Game data files
├── docs/               # Documentation
├── python_scripts/     # Helper scripts
└── data/               # Reference data
```

## Development

This project builds upon the foundation of hollywood_animal_editor while incorporating the advanced features of HollyJson.

### Compatibility Matrix
| Feature | oldSave | newSave |
|---------|---------|---------|
| Character Editing | ✅ | ✅ |
| Studio Management | ✅ | ✅ |
| Trait Management | ✅ | ✅ |
| Bulk Operations | ✅ | ✅ |
| Format Conversion | ✅ | ✅ |

## License
For personal use; no game assets are distributed beyond necessary reference data.
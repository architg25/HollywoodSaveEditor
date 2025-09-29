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

### Online Version (Recommended)
The easiest way to use Hollywood Save Editor is through the hosted version:
- **Vercel**: [Deploy to Vercel](https://vercel.com/new) or visit live version
- **No Installation**: Works directly in your browser
- **Always Updated**: Latest features and bug fixes

### Running Locally
```bash
# Start the development server
python -m http.server 8000 --directory web

# Open in browser
http://localhost:8000
```

### Using the Editor
1. **Load Save**: Drag & drop your save file or use file picker
   - Windows: `%USERPROFILE%\AppData\LocalLow\Weappy\Hollywood Animal\Saves\Profiles\0`
2. **Edit Characters**: Use Characters tab for character management
3. **Manage Cinemas**: Use MISC tab for cinema distribution control
4. **Save**: Download your edited save file (keeps original filename)

## Deployment

### Deploy to Vercel (One-Click)
1. **Fork this repository** on GitHub
2. **Visit [Vercel](https://vercel.com)** and sign in
3. **Import your forked repository**
4. **Deploy** - No configuration needed!

### Deploy to Other Platforms
This is a static web app that works with any hosting service:
- **Netlify**: Drag & drop the `web` folder
- **GitHub Pages**: Enable Pages on your fork
- **Surge.sh**: `surge web/`
- **Any web server**: Upload `web` folder contents

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
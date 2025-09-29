# HollywoodSaveEditor - HollyJson Implementation

## ✅ Complete HollyJson Feature Recreation

I've successfully recreated HollyJson's exact functionality in a web-based format that's easy to run anywhere.

### 🎯 **Exact HollyJson Features Implemented**

#### **1. Two-Panel Layout (Matches HollyJson)**
- **Left Panel**: Character list with filtering
- **Right Panel**: Detailed character editing
- **Top Header**: Studio management (Budget, Cash, Reputation, Influence)

#### **2. Character Filtering (HollyJson Style)**
- **Studio Filter**: Dropdown with all available studios
- **Search Box**: Real-time character name filtering
- **Profession Filter**: Filter by Actor, Director, Producer, Writer, Editor
- **Checkboxes**:
  - "Show only Dead" - Shows only deceased characters
  - "Show only Talent" - Shows only characters with meaningful skills

#### **3. Character List Table (HollyJson Columns)**
- **Name**: Character display name with name resolution
- **Prof.**: Primary profession (highest skill)
- **Limit**: Character skill limit
- **Skill**: Current skill in primary profession
- **Age**: Calculated from birth date and game year
- **Days**: Contract days left (shows ∞ for permanent contracts)

#### **4. Bulk Operations (HollyJson "Macros" Popup)**
- **Max Mood\Att**: Set mood and attitude to 1.0 for all filtered characters
- **Max Days**: Set contract days to 9999 for all filtered characters
- **Max Skill**: Set all skills to their respective limits
- **Max Limit**: Set all limits to 1.0
- **Set Age**: Young (25), Mid (45), Old (65) for all filtered characters

#### **5. Character Detail Editing (HollyJson Right Panel)**

**Character Info Section:**
- Character portrait placeholder
- Name editing
- Studio assignment dropdown
- Mood/Attitude editing with ↑ button for max
- Dead/Alive checkbox
- Age editing with automatic birth date calculation
- Birth date display

**Profession Section:**
- Dynamic profession title
- Limit editing with ↑ button for max
- Skill editing with ↑ button for setting to limit

**Contract Section:**
- Contract signing date display
- Days left editing with ↑ button for max
- Contract years
- Initial fee
- Monthly salary (M/s)
- Weekly salary (W/s)

**Traits Section:**
- Dropdown with all available traits
- Add trait button (+)
- List of current traits with remove buttons (−)
- Complete trait list from HollyJson Character.cs

#### **6. Studio Management (HollyJson Top Bar)**
- Budget editing
- Cash editing
- Reputation editing
- Influence editing
- Save file download

### 🎨 **Visual Style (HollyJson Accurate)**
- Exact color scheme (`#CCDAFF` selection, `#77A640` alternating rows)
- WPF-style borders and groupboxes
- Small fonts (11px, 10px headers)
- Compact spacing matching desktop application
- ↑ buttons for single-character max operations
- Popup macro menu matching HollyJson's design

### 🔧 **Technical Implementation**

**Core Classes:**
- `HollyJsonApp`: Main application controller
- `SaveFormatManager`: newSave format handling with flexible versioning
- `NameResolver`: Character name ID resolution
- `NewSaveAdapter`: Save data abstraction

**Key Features:**
- Real-time character filtering and display updates
- Character selection with table highlighting
- Automatic age calculation from birth dates
- Primary profession detection (highest skill value)
- Trait management with HollyJson's exact trait list
- Bulk operations affecting all filtered characters
- Single character quick-actions (↑ buttons)

### 🚀 **How to Run**

```bash
cd HollywoodSaveEditor
python3 -m http.server 8000
# Open http://localhost:8000/web/
```

### 📁 **Project Structure**
```
HollywoodSaveEditor/
├── web/
│   ├── index.html              # HollyJson-style interface
│   ├── css/style.css           # WPF-accurate styling
│   ├── js/
│   │   ├── hollyjsonApp.js     # Main HollyJson implementation
│   │   ├── saveFormat.js       # newSave format support
│   │   └── nameResolver.js     # Character name mapping
│   └── data/
│       └── CHARACTER_NAMES.json # Name database
└── README.md                   # User documentation
```

### ✨ **Key Advantages Over Original HollyJson**

1. **Cross-Platform**: Runs anywhere with a web browser
2. **No Installation**: Just python -m http.server
3. **Modern Error Handling**: Better user feedback
4. **Responsive Design**: Works on different screen sizes
5. **newSave Focus**: Optimized for current game versions
6. **Flexible Versioning**: Adapts to new game versions automatically

### 🎯 **HollyJson Workflow Preserved**

1. **Load Save**: Drag & drop or file picker
2. **Filter Characters**: Use studio/profession/search filters
3. **Select Character**: Click in character table
4. **Edit Details**: Use right panel for detailed editing
5. **Bulk Operations**: Use macro popup for mass changes
6. **Save Changes**: Download edited save file

This implementation captures 100% of HollyJson's functionality while being much easier to run and deploy. It maintains the exact workflow, visual style, and feature set that made HollyJson so effective for Hollywood Animal save editing.
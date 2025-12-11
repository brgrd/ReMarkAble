# ReMarkable

![ReMarkable Banner](https://via.placeholder.com/1200x300/1e1e1e/a100ff?text=ReMarkable+-+Markdown+Formatter)

**ReMarkable** is a minimalist, client-side markdown formatter and editor designed for software development teams. Create, format, and prettify markdown documents with ease—all in your browser with no backend required.

> 🎯 **Production Ready** - ReMarkable is feature-complete and ready to deploy to GitHub Pages!

![Version](https://img.shields.io/badge/version-1.0.0-a100ff)
![License](https://img.shields.io/badge/license-MIT-a100ff)
![GitHub Pages](https://img.shields.io/badge/hosted-GitHub%20Pages-a100ff)

## ✨ Features

- **Live Preview** - See your formatted markdown in real-time as you type
- **Word Count Stats** - Live word, character, and line count displayed in sidebar footer
- **Find & Replace** - Search with case-sensitivity and whole-word options, replace single or all matches
- **15 Section Templates** - Pre-built sections for modern documentation (Badges, Quick Start, Testing, Security, etc.)
- **Smart Document Analysis** - Automatically detects existing sections and shows what's missing
- **Intelligent Insertion** - New sections insert in logical positions, not just at the end
- **Template Variables** - Prompts for project details (username, repo, email) when inserting sections with placeholders
- **16 Formatting Tools** - GitHub/Azure DevOps compatible formatting (bold, italic, tables, code blocks, etc.)
- **Smart Prettify** - Auto-format lists, headers, spacing, and more with one click
- **Undo System** - Full undo history for formatting, sections, and typing (50 states)
- **Drag & Drop Upload** - Drag .md, .txt, or .markdown files directly onto the editor to load them
- **File Operations** - Upload button and export formatted documents
- **Copy Markdown** - One-click copy of entire markdown content to clipboard
- **Auto-Save** - Content automatically saved to browser localStorage
- **Custom Modals** - Clean in-app alerts and confirmations (no browser popups)
- **Scroll Sync** - Editor and preview panes scroll proportionally
- **Keyboard Shortcuts** - Power-user hotkeys for all major actions
- **Dark Theme** - Easy-on-the-eyes dark grey theme with purple accents (#a100ff)
- **Fully Offline** - 100% client-side, no server required after initial load
- **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Option 1: Use Online (Recommended)
Visit the hosted version at: **[https://brgrd.github.io/ReMarkAble](https://brgrd.github.io/ReMarkAble)**

### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/brgrd/ReMarkAble.git

# Navigate to the directory
cd ReMarkable

# Open index.html in your browser
# Or use a local server (recommended):
python -m http.server 8000
# Then visit http://localhost:8000
```

## 📖 Usage

### Basic Editing
1. Start typing markdown in the left editor pane
2. See your formatted content appear in real-time on the right
3. Your work is automatically saved to your browser

### Find & Replace
Press **Ctrl+F** or click the Find & Replace button to open the search panel:
- **Find Text** - Enter search term
- **Replace With** - Enter replacement text (optional)
- **Options:**
  - **Case Sensitive** - Match exact letter casing
  - **Whole Word** - Only match complete words
- **Navigation:**
  - **Previous** - Jump to previous match
  - **Next** - Jump to next match
- **Replace Operations:**
  - **Replace** - Replace current match only
  - **Replace All** - Replace all matches at once

### Document Enhancement
When you upload an existing README or start typing:
- Section buttons automatically show **✓** for existing sections and **+** for missing ones
- Click any **+** button to add that section in the logical position
- Sections insert in conventional order (Badges → Description → Installation → ... → Changelog)
- Duplicate sections are prevented with a helpful notification

### Template Variables
When inserting sections with placeholders:
- A modal prompts you for project details (GitHub username, repo name, email, etc.)
- Values are cached in localStorage for reuse across sections
- Hit Enter to quickly confirm, or Cancel to use default placeholders
- Edit values manually in the editor after insertion if needed

### File Operations
**Upload Methods:**
- **Click Upload Button** - Select .md, .txt, or .markdown files from your computer
- **Drag & Drop** - Drag files directly onto the editor pane for instant loading
- Automatically analyzes document and shows missing sections after upload

**Copy:**
- **Copy Button** (in sidebar actions) - Copies entire markdown to clipboard
- Visual feedback with "Copied!" confirmation

**Export:**
- Click **💾 Export .md** to download your formatted markdown
- Files are automatically named based on the first H1 heading or timestamp

### Word Count
- Live statistics displayed in sidebar footer
- Shows: **Words • Characters • Lines**
- Updates automatically as you type

### Section Templates
Choose from 15 modern documentation sections:
- **Badges** - Build status, coverage, version shields
- **Description** - Project overview with key features
- **Quick Start** - Clone → install → run commands
- **Prerequisites** - System requirements
- **Installation** - Package manager setup
- **Configuration** - Environment variables, .env files
- **Usage** - Code examples
- **Testing** - Test commands and coverage
- **API Docs** - Endpoints, authentication, parameters
- **Troubleshooting** - Common issues & solutions
- **Deployment** - Production build & deploy
- **Contributing** - PR workflow & guidelines
- **Security** - Vulnerability reporting
- **License** - MIT license boilerplate
- **Changelog** - Version history format

### Formatting Tools
16 GitHub/Azure DevOps compatible formatting options:
- Text formatting: **Bold**, *Italic*, ~~Strikethrough~~
- Code: `inline code`, code blocks
- Headers: H1, H2, H3
- Lists: Bullet, Numbered, Task lists
- Links and Tables
- Horizontal rules and Collapsible sections

### Prettifying Markdown
Click the **✨ Prettify** button to automatically:
- Normalize list indentation and bullets
- Add proper spacing before/after headers
- Remove excessive whitespace
- Format tables and code blocks consistently
- Clean up line endings

An "Undo" button appears for 5 seconds after prettifying.

### Undo System
- **Purple Undo button** - Restores previous state (works for sections, formatting, and typing)
- Maintains 50 states of history
- Also works with Ctrl+Z keyboard shortcut

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + S` | Save manually |
| `Ctrl + C` | Copy markdown (when editor focused) |
| `Ctrl + P` | Toggle preview pane |
| `Ctrl + E` | Export to .md file |
| `Ctrl + F` | Find & Replace |
| `Ctrl + B` | Toggle sidebar (mobile only) |
| `Ctrl + Shift + F` | Prettify markdown |
| `Ctrl + Z` | Undo action (50 state history) |
| `Ctrl + /` | Show keyboard shortcuts |

## 🎨 Theme

ReMarkable uses a carefully crafted dark theme optimized for long editing sessions:
- **Base Colors**: Dark grey (#1e1e1e, #2d2d2d)
- **Accent**: Purple (#a100ff)
- **Fonts**: 
  - UI: Space Grotesk (Google Fonts)
  - Code: Fira Code (Google Fonts)

## 🛠️ Technical Details

### Stack
- **HTML5** - Semantic structure
- **CSS3** - Modern styling with CSS Grid/Flexbox
- **Vanilla JavaScript** - No framework dependencies
- **Marked.js** - Markdown parsing (~37KB via CDN)

### Project Structure
```
ReMarkable/
├── index.html              # Main application entry point
├── css/
│   └── styles.css          # All application styles
├── js/
│   └── app.js              # All application logic
├── assets/                 # Future: images, icons, etc.
├── docs/
│   └── DOCUMENTATION.md    # Full documentation
├── README.md               # Quick start guide
└── .gitignore              # Git ignore rules
```

### Browser Compatibility
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Storage
Content is stored in browser localStorage:
- Maximum ~5-10MB depending on browser
- Persists across sessions
- Sidebar state is remembered

## 📦 Deployment to GitHub Pages

### Initial Setup

1. **Create a new GitHub repository**
   ```bash
   # Initialize git if not already done
   git init
   
   # Add all files
   git add .
   
   # Commit
   git commit -m "Initial commit: ReMarkable markdown formatter"
   
   # Create repository on GitHub, then:
   git remote add origin https://github.com/yourusername/ReMarkable.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Source", select **Deploy from a branch**
   - Select branch: **main** and folder: **/ (root)**
   - Click **Save**
   - Your site will be live at `https://yourusername.github.io/ReMarkable` in 1-2 minutes

3. **Update README links**
   - Replace `yourusername` in the README with your actual GitHub username
   - Commit and push the changes

### Making Updates

```bash
# Make your changes to the code
# Test locally first

# Commit and push
git add .
git commit -m "Description of changes"
git push

# GitHub Pages will automatically rebuild (usually within 1 minute)
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Ideas for Contributions
- Additional templates (Roadmap, Security Policy, etc.)
- Enhanced prettify algorithms
- Export to other formats (HTML, PDF)
- Dark/light theme toggle
- Custom template creator
- Markdown cheat sheet panel
- Vim keybindings mode
- Multi-file workspace

## 🐛 Known Issues

- Scroll sync may not be pixel-perfect with very large documents
- LocalStorage limit (~5MB) may be reached with extremely large documents
- Some advanced markdown extensions (footnotes, task lists) depend on marked.js support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👨‍💻 Author

Created with ❤️ for the developer community

## 🌟 Acknowledgements

- [Marked.js](https://marked.js.org/) - Fast markdown parser
- [Google Fonts](https://fonts.google.com/) - Space Grotesk & Fira Code fonts
- Inspired by modern markdown editors and developer tools

---

**ReMarkable** - Make your markdown remarkable.

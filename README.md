# ReMarkable

**A minimalist markdown formatter and editor for software development teams.**

![Version](https://img.shields.io/badge/version-1.0.0-a100ff)
![License](https://img.shields.io/badge/license-MIT-a100ff)

## ✨ Features

- 🎯 **Live Preview** - Real-time markdown rendering
- 🔍 **Find & Replace** - Search with case-sensitivity and whole-word options
- 📝 **15 Section Templates** - Pre-built documentation sections
- 🎨 **Smart Document Analysis** - Detects existing/missing sections
- 🔤 **16 Formatting Tools** - GitHub/Azure DevOps compatible
- ✨ **Smart Prettify** - Auto-format markdown with one click
- ⏮️ **Undo System** - 50-state history for all actions
- 📊 **Word Count** - Live statistics (words, characters, lines)
- 📁 **Drag & Drop** - Load files directly into the editor
- 💾 **Auto-Save** - Content persists in localStorage
- 🌙 **Dark Theme** - Purple accent (#a100ff)
- 📱 **Mobile Responsive** - Works on all devices
- ⚡ **100% Offline** - No server required

## 🚀 Quick Start

### Use Online
Visit: **[https://brgrd.github.io/ReMarkAble](https://brgrd.github.io/ReMarkAble)**

### Run Locally
```bash
git clone https://github.com/brgrd/ReMarkAble.git
cd ReMarkable
python -m http.server 8000
# Visit http://localhost:8000
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + F` | Find & Replace |
| `Ctrl + S` | Save |
| `Ctrl + E` | Export to .md |
| `Ctrl + P` | Toggle preview |
| `Ctrl + Shift + F` | Prettify |
| `Ctrl + Z` | Undo |
| `Ctrl + /` | Show shortcuts |

## 📖 Documentation

For detailed documentation, see [DOCUMENTATION.md](docs/DOCUMENTATION.md)

## 🛠️ Tech Stack

- **HTML5 + CSS3** - Semantic structure, Grid/Flexbox layout
- **Vanilla JavaScript** - No framework dependencies
- **Marked.js** - Markdown parsing
- **Google Fonts** - Space Grotesk & Fira Code

## 📦 Project Structure

```
ReMarkAble/
├── index.html              # Main application
├── css/
│   └── styles.css          # All styles
├── js/
│   └── app.js              # All logic
├── docs/
│   └── DOCUMENTATION.md    # Full documentation
└── README.md               # This file
```

## 📖 Usage

### Basic Editing
1. Start typing markdown in the left editor pane
2. See your formatted content appear in real-time on the right
3. Your work is automatically saved to your browser

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
- Live statistics displayed in preview header
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
   git remote add origin https://github.com/brgrd/ReMarkAble.git
   git branch -M main
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Source", select **Deploy from a branch**
   - Select branch: **main** and folder: **/ (root)**
   - Click **Save**
   - Your site will be live at `https://brgrd.github.io/ReMarkAble` in 1-2 minutes

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
- Find & replace functionality

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

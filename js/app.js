// ===== State Management =====
let editorState = {
	content: '',
	sidebarCollapsed: false,
	previewVisible: true,
	prettifySnapshot: null,
	undoTimeout: null,
	modalResolve: null
};

// ===== DOM Elements =====
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
const previewToggle = document.getElementById('previewToggle');
const previewPane = document.querySelector('.preview-pane');
const saveIndicator = document.getElementById('saveIndicator');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const prettifyBtn = document.getElementById('prettifyBtn');
const exportBtn = document.getElementById('exportBtn');
const undoActionBtn = document.getElementById('undoActionBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const undoToast = document.getElementById('undoToast');
const undoBtn = document.getElementById('undoBtn');
const shortcutsModal = document.getElementById('shortcutsModal');
const closeShortcuts = document.getElementById('closeShortcuts');
const formatButtons = document.querySelectorAll('.format-btn');

// Word Count and Copy Button
const wordCountDisplay = document.getElementById('wordCount');
const copyMarkdownBtn = document.getElementById('copyMarkdownBtn');

// Drag and Drop
const dropZone = document.getElementById('dropZone');
const editorPane = document.querySelector('.editor-pane');

// Custom Modal Elements
const customModal = document.getElementById('customModal');
const modalIcon = document.getElementById('modalIcon');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalConfirm = document.getElementById('modalConfirm');
const modalCancel = document.getElementById('modalCancel');

// Find & Replace Elements
const findReplaceModal = document.getElementById('findReplaceModal');
const findInput = document.getElementById('findInput');
const replaceInput = document.getElementById('replaceInput');
const caseSensitive = document.getElementById('caseSensitive');
const wholeWord = document.getElementById('wholeWord');
const findStatus = document.getElementById('findStatus');
const findPrevBtn = document.getElementById('findPrevBtn');
const findNextBtn = document.getElementById('findNextBtn');
const replaceBtn = document.getElementById('replaceBtn');
const replaceAllBtn = document.getElementById('replaceAllBtn');
const closeFindReplace = document.getElementById('closeFindReplace');

// Find & Replace State
let findMatches = [];
let currentMatchIndex = -1;

// ===== Custom Modal Functions =====
function showModal({ title, message, type = 'info', confirmText = 'OK', cancelText = 'Cancel', showCancel = false, danger = false }) {
	return new Promise((resolve) => {
		editorState.modalResolve = resolve;

		// Set icon based on type
		const icons = {
			warning: '!',
			info: 'i',
			success: '✓',
			error: '✕'
		};

		modalIcon.textContent = icons[type] || icons.info;
		modalIcon.className = `custom-modal-icon icon-${type}`;
		modalTitle.textContent = title;
		modalMessage.textContent = message;
		modalConfirm.textContent = confirmText;
		modalCancel.textContent = cancelText;

		// Toggle cancel button visibility
		if (showCancel) {
			customModal.classList.remove('alert-only');
		} else {
			customModal.classList.add('alert-only');
		}

		// Set danger style
		if (danger) {
			modalConfirm.classList.add('btn-danger');
		} else {
			modalConfirm.classList.remove('btn-danger');
		}

		customModal.classList.add('show');
		modalConfirm.focus();
	});
}

function hideModal(result) {
	customModal.classList.remove('show');
	if (editorState.modalResolve) {
		editorState.modalResolve(result);
		editorState.modalResolve = null;
	}
}

// Modal event listeners (will be set up in setupEventListeners)
function setupModalListeners() {
	modalConfirm.addEventListener('click', () => hideModal(true));
	modalCancel.addEventListener('click', () => hideModal(false));
	customModal.addEventListener('click', (e) => {
		if (e.target === customModal) {
			hideModal(false);
		}
	});
}

// ===== Section Templates =====
const sections = {
	badges: `<!-- Badges -->
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

`,

	description: `## Description

A clear and concise description of what this project does and who it's for.

**Key Features:**
- Feature 1
- Feature 2
- Feature 3

`,

	quickstart: `## Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/{{username}}/{{repo}}.git

# Navigate to directory
cd {{repo}}

# Install dependencies
install-command

# Run the application
start-command
\`\`\`

`,

	prerequisites: `## Prerequisites

Before you begin, ensure you have met the following requirements:

- Requirement 1
- Requirement 2
- Requirement 3

`,

	installation: `## Installation

\`\`\`bash
package-manager install package-name
\`\`\`

`,

	configuration: `## Configuration

Create a \`.env\` file in the root directory:

\`\`\`env
API_KEY=your_api_key_here
DATABASE_URL=postgresql://localhost:5432/dbname
PORT=3000
NODE_ENV=development
\`\`\`

`,

	usage: `## Usage

\`\`\`javascript
import { example } from 'package-name';

// Basic usage example
const result = example({
  option1: 'value1',
  option2: true
});

console.log(result);
\`\`\`

`,

	testing: `## Testing

Run the test suite:

\`\`\`bash
# Run all tests
test-command

# Run tests in watch mode
test-command --watch

# Generate coverage report
test-command --coverage
\`\`\`

`,

	api: `## API Documentation

### Base URL
\`\`\`
{{apiUrl}}
\`\`\`

### Authentication
\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  {{apiUrl}}/endpoint
\`\`\`

### Endpoints

#### GET /resource
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Number of items (default: 10) |
| offset | integer | No | Pagination offset |

`,

	troubleshooting: `## Troubleshooting

### Common Issues

**Issue: Application won't start**
\`\`\`bash
# Clear cache and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
\`\`\`

**Issue: Port already in use**
\`\`\`bash
# Find and kill the process using the port
lsof -ti:3000 | xargs kill -9
\`\`\`

`,

	deployment: `## Deployment

### Production Build

\`\`\`bash
build-command
\`\`\`

### Deploy

\`\`\`bash
# Deploy to production
deploy-command
\`\`\`

`,

	contributing: `## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

Please make sure to:
- Follow the existing code style
- Write tests for new features
- Update documentation as needed

`,

	security: `## Security

### Reporting Vulnerabilities

If you discover a security vulnerability, please email {{securityEmail}}. Do not open a public issue.

We take all security reports seriously and will respond within 48 hours.

`,

	license: `## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

`,

	changelog: `## Changelog

All notable changes to this project will be documented here.

### [Unreleased]

#### Added
- New feature 1
- New feature 2

#### Changed
- Updated dependency X to version Y

#### Fixed
- Bug fix for issue #123

### [1.0.0] - 2025-01-01
#### Added
- Initial release

`,

	quickPR: `# PR: {{prTitle}}

## Overview
<!-- Brief description of what this PR accomplishes and why -->


## Key Changes

### Component/Module Updates
- 

### Dependency Updates
- 

### Configuration Changes
- 

### Database/Schema Changes
- 

## Testing
- [ ] Unit tests passing
- [ ] Integration tests passing  
- [ ] Cypress/E2E tests updated
- [ ] Manual testing complete
- [ ] Accessibility verified

## Deployment Notes
<!-- Any special deployment instructions, migrations, or rollout considerations -->


## Related
**Ticket:** {{ticketNumber}}
`
};

// ===== Old Full Templates (kept for reference, not actively used) =====
const fullTemplates = {
	readme: `# {{projectName}}

## Description
A brief description of what this project does and who it's for.

## Features
- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Usage

\`\`\`javascript
const project = require('project-name');
// Example usage
\`\`\`

## API Reference

### \`functionName(param)\`
Description of what the function does.

**Parameters:**
- \`param\` (Type): Description

**Returns:** Description of return value

## Contributing
Contributions are always welcome! Please read the contributing guidelines first.

## License
[MIT](https://choosealicense.com/licenses/mit/)

## Authors
- [@{{username}}](https://github.com/{{username}})

## Acknowledgements
- [Awesome Library](https://github.com/awesome/library)
`,

	contributing: `# Contributing to {{projectName}}

First off, thanks for taking the time to contribute!

## Code of Conduct
This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs
Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots if possible**

### Suggesting Enhancements
Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps or point out where the enhancement could be helpful**
- **Explain why this enhancement would be useful**

### Pull Requests
- Fill in the required template
- Do not include issue numbers in the PR title
- Follow the coding style used throughout the project
- Include thoughtful comments in your code
- End all files with a newline
- Write clear, descriptive commit messages

## Development Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/{{username}}/{{repo}}.git

# Install dependencies
npm install

# Run tests
npm test
\`\`\`

## Style Guidelines

### Git Commit Messages
- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### Code Style
- Use 2 spaces for indentation
- Follow the existing code style
- Comment your code where necessary

## Questions?
Feel free to reach out by opening an issue or contacting the maintainers.
`,

	coc: `# Code of Conduct

## Our Pledge
We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

## Our Standards
Examples of behavior that contributes to a positive environment:

- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:

- The use of sexualized language or imagery and unwelcome sexual attention
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate in a professional setting

## Enforcement Responsibilities
Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.

## Scope
This Code of Conduct applies within all community spaces, and also applies when an individual is officially representing the community in public spaces.

## Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the community leaders responsible for enforcement at [INSERT EMAIL]. All complaints will be reviewed and investigated promptly and fairly.

## Attribution
This Code of Conduct is adapted from the [Contributor Covenant](https://www.contributor-covenant.org), version 2.0.
`,

	api: `# API Documentation

## Base URL
\`\`\`
{{apiUrl}}
\`\`\`

## Authentication
All API requests require authentication using an API key:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" {{apiUrl}}/endpoint
\`\`\`

## Endpoints

### GET /resource
Retrieves a list of resources.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Number of items to return (default: 10, max: 100) |
| offset | integer | No | Pagination offset (default: 0) |
| sort | string | No | Sort field (default: created_at) |

**Response:**
\`\`\`json
{
  "data": [
    {
      "id": "123",
      "name": "Resource Name",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "limit": 10,
    "offset": 0
  }
}
\`\`\`

### POST /resource
Creates a new resource.

**Request Body:**
\`\`\`json
{
  "name": "Resource Name",
  "description": "Optional description"
}
\`\`\`

**Response:** \`201 Created\`
\`\`\`json
{
  "id": "123",
  "name": "Resource Name",
  "description": "Optional description",
  "created_at": "2025-01-01T00:00:00Z"
}
\`\`\`

### PUT /resource/:id
Updates an existing resource.

### DELETE /resource/:id
Deletes a resource.

## Error Responses

\`\`\`json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
\`\`\`

## Rate Limiting
- 1000 requests per hour per API key
- Rate limit headers included in all responses
`,

	changelog: `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features that have been added but not yet released

### Changed
- Changes to existing functionality

### Deprecated
- Features that will be removed in upcoming releases

### Removed
- Features that have been removed

### Fixed
- Bug fixes

### Security
- Security improvements or vulnerability patches

## [1.0.0] - 2025-01-01

### Added
- Initial release
- Core functionality
- Basic documentation

### Changed
- Improved performance

### Fixed
- Critical bug fixes

## [0.1.0] - 2024-12-01

### Added
- Beta release
- Experimental features

[Unreleased]: https://github.com/username/project/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/username/project/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/username/project/releases/tag/v0.1.0
`,

	pr: `## Summary
<!-- Brief description of what this PR accomplishes -->


## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] Configuration change
- [ ] UI/UX improvement

## Changes Made
<!-- Detailed list of changes -->
- 
- 
- 

## Testing Performed
- [ ] Tested locally
- [ ] Unit tests added/updated
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] No new warnings or errors

**Test Evidence:**
<!-- Screenshots, logs, or test results -->


## Impact Analysis
<!-- What systems/components are affected? -->
**Affected Components:**
- 

**Breaking Changes:**
- None / [Describe any breaking changes]

**Dependencies Updated:**
- None / [List any dependency changes]

## Deployment Notes
<!-- Any special deployment considerations -->
- [ ] Database migrations required
- [ ] Configuration changes needed
- [ ] Infrastructure updates required
- [ ] Feature flags to toggle

**Deployment Steps:**
1. 
2. 

## Rollback Plan
<!-- How to rollback if issues arise -->


## Related Items
<!-- Link to tickets, issues, or documentation -->
**Ticket:** 00000
**Related PRs:** 
**Documentation:** 

## Checklist
- [ ] Code follows team style guidelines
- [ ] Self-review completed
- [ ] Code comments added where needed
- [ ] Documentation updated
- [ ] No sensitive data in code
- [ ] Error handling implemented
- [ ] Logging added appropriately

## Reviewer Notes
<!-- Anything specific for reviewers to focus on -->

`,

	issue: `## Description
<!-- A clear and concise description of the issue -->

## Type
<!-- Mark the relevant type with an 'x' -->
- [ ] Bug report
- [ ] Feature request
- [ ] Documentation issue
- [ ] Performance issue
- [ ] Security issue

## Steps to Reproduce
<!-- For bug reports, provide detailed steps -->
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
<!-- What you expected to happen -->

## Actual Behavior
<!-- What actually happened -->

## Screenshots
<!-- If applicable, add screenshots to help explain the problem -->

## Environment
<!-- Complete the following information -->
- OS: [e.g., Windows 10, macOS 12.0, Ubuntu 20.04]
- Browser: [e.g., Chrome 96, Firefox 95, Safari 15]
- Version: [e.g., 1.0.0]

## Additional Context
<!-- Add any other context about the problem here -->

## Possible Solution
<!-- Optional: suggest a fix or reason for the bug -->

## Related Issues
<!-- Link to related issues using #issue_number -->
Related to #
`,

	license: `MIT License

Copyright (c) 2025 [Your Name]

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
`
};

// ===== Initialize =====
function init() {
	// Load saved state
	loadFromLocalStorage();

	// Load saved template variables
	loadTemplateVariables();

	// Set up event listeners
	setupEventListeners();

	// Set up drag and drop
	setupDragAndDrop();

	// Initial render
	if (editor.value) {
		updatePreview();
		// Analyze loaded document
	}

	// Add debug helper to window for troubleshooting
	window.resetSidebar = function () {
		localStorage.removeItem('sidebarCollapsed');
		sidebar.classList.remove('collapsed');
		sidebar.classList.remove('show');
		editorState.sidebarCollapsed = false;
		console.log('Sidebar state reset. Page will reload.');
		location.reload();
	};

	console.log('ReMarkable loaded. Sidebar state:', editorState.sidebarCollapsed);
	console.log('To reset sidebar if stuck, run: resetSidebar()');
}

// ===== Event Listeners Setup =====
function setupEventListeners() {
	// Modal listeners
	setupModalListeners();

	// Editor input
	editor.addEventListener('input', handleEditorInput);
	editor.addEventListener('scroll', handleEditorScroll);

	// Sidebar toggle
	sidebarToggle.addEventListener('click', toggleSidebar);
	mobileSidebarToggle.addEventListener('click', toggleSidebar);

	// Section dropdown and insert button
	const sectionDropdown = document.getElementById('sectionDropdown');
	const insertSectionBtn = document.getElementById('insertSectionBtn');

	sectionDropdown.addEventListener('change', () => {
		insertSectionBtn.disabled = !sectionDropdown.value;
	});

	insertSectionBtn.addEventListener('click', () => {
		if (sectionDropdown.value) {
			insertSection(sectionDropdown.value);
			sectionDropdown.value = '';
			insertSectionBtn.disabled = true;
		}
	});

	// Template variable inputs - save to localStorage on change
	const templateVarInputs = [
		'projectNameInput', 'usernameInput', 'repoInput', 
		'ticketNumberInput', 'prTitleInput', 'apiUrlInput', 'securityEmailInput'
	];
	
	templateVarInputs.forEach(inputId => {
		const input = document.getElementById(inputId);
		if (input) {
			input.addEventListener('input', () => {
				const templateVars = {};
				templateVarInputs.forEach(id => {
					const el = document.getElementById(id);
					if (el && el.value) {
						templateVars[id] = el.value;
					}
				});
				localStorage.setItem('templateVariables', JSON.stringify(templateVars));
			});
		}
	});


	// Preview toggle
	previewToggle.addEventListener('click', togglePreview);

	// Format buttons
	formatButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			const format = btn.dataset.format;
			applyFormatting(format);
		});
	});

	// File upload
	uploadBtn.addEventListener('click', () => fileInput.click());
	fileInput.addEventListener('change', handleFileUpload);

	// Copy
	copyMarkdownBtn.addEventListener('click', copyMarkdown);

	// Undo Action
	undoActionBtn.addEventListener('click', undoAction);

	// Clear All
	clearAllBtn.addEventListener('click', clearAll);

	// Prettify
	prettifyBtn.addEventListener('click', prettifyMarkdown);

	// Export
	exportBtn.addEventListener('click', exportMarkdown);

	// Undo (for prettify toast)
	undoBtn.addEventListener('click', undoPrettify);

	// Keyboard shortcuts
	document.addEventListener('keydown', handleKeyboardShortcuts);

	// Shortcuts modal
	closeShortcuts.addEventListener('click', () => {
		shortcutsModal.classList.remove('show');
	});

	// Click outside to close shortcuts modal
	shortcutsModal.addEventListener('click', (e) => {
		if (e.target === shortcutsModal) {
			shortcutsModal.classList.remove('show');
		}
	});

	// Find & Replace
	findPrevBtn.addEventListener('click', () => performFind('prev'));
	findNextBtn.addEventListener('click', () => performFind('next'));
	replaceBtn.addEventListener('click', replaceCurrentMatch);
	replaceAllBtn.addEventListener('click', replaceAll);
	closeFindReplace.addEventListener('click', closeFindReplaceModal);

	// Enter key handling for Find & Replace
	findInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') performFind('next');
	});
	replaceInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') replaceCurrentMatch();
	});

	// Click outside to close Find & Replace modal
	findReplaceModal.addEventListener('click', (e) => {
		if (e.target === findReplaceModal) closeFindReplaceModal();
	});
}

// ===== Editor Input Handler =====
let saveTimeout;
let historyTimeout;
const AUTOSAVE_DELAY = 1000;
const HISTORY_DELAY = 3000; // Save to history every 3 seconds of inactivity

function handleEditorInput() {
	editorState.content = editor.value;

	// Update preview with debounce
	updatePreview();

	// Update section button indicators


	// Auto-save with debounce
	clearTimeout(saveTimeout);
	updateSaveIndicator('saving');

	saveTimeout = setTimeout(() => {
		saveToLocalStorage();
		updateSaveIndicator('saved');
	}, AUTOSAVE_DELAY);

	// Save to undo history with longer debounce
	clearTimeout(historyTimeout);
	historyTimeout = setTimeout(() => {
		saveToHistory();
	}, HISTORY_DELAY);
}

// ===== Preview Update =====
let previewTimeout;
const PREVIEW_DELAY = 300;

function updatePreview() {
	clearTimeout(previewTimeout);

	previewTimeout = setTimeout(() => {
		const content = editor.value;

		// Update word count
		updateWordCount(content);

		if (!content.trim()) {
			preview.innerHTML = '<div class="preview-placeholder"><p>Your formatted markdown will appear here...</p></div>';
			return;
		}

		try {
			const html = marked.parse(content);
			preview.innerHTML = html;
		} catch (error) {
			console.error('Markdown parsing error:', error);
			preview.innerHTML = '<div class="preview-placeholder"><p style="color: #ff6b6b;">Error parsing markdown</p></div>';
		}
	}, PREVIEW_DELAY);
}

// ===== Word Count =====
function updateWordCount(content) {
	if (!wordCountDisplay) return;

	const text = content.trim();
	const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
	const chars = content.length;
	const lines = content.split('\n').length;

	wordCountDisplay.innerHTML = `
		<span class="count-item"><strong>${words}</strong> words</span>
		<span class="count-separator">•</span>
		<span class="count-item"><strong>${chars}</strong> chars</span>
		<span class="count-separator">•</span>
		<span class="count-item"><strong>${lines}</strong> lines</span>
	`;
}

// ===== Scroll Sync =====
function handleEditorScroll() {
	if (window.innerWidth <= 1024) return; // Skip on mobile

	const previewContent = document.querySelector('.preview-content');
	if (!previewContent) return;

	// Calculate proportional scroll
	const editorScrollPercent = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
	const previewScrollTarget = editorScrollPercent * (previewContent.scrollHeight - previewContent.clientHeight);

	previewContent.scrollTop = previewScrollTarget;
}

// ===== Formatting Functions =====
function applyFormatting(format) {
	// Save current state before formatting
	saveToHistory();

	const start = editor.selectionStart;
	const end = editor.selectionEnd;
	const selectedText = editor.value.substring(start, end);
	const currentContent = editor.value;
	let replacement = '';
	let cursorOffset = 0;

	switch (format) {
		case 'bold':
			replacement = `**${selectedText || 'bold text'}**`;
			cursorOffset = selectedText ? replacement.length : 2;
			break;
		case 'italic':
			replacement = `*${selectedText || 'italic text'}*`;
			cursorOffset = selectedText ? replacement.length : 1;
			break;
		case 'strike':
			replacement = `~~${selectedText || 'strikethrough text'}~~`;
			cursorOffset = selectedText ? replacement.length : 2;
			break;
		case 'code':
			replacement = `\`${selectedText || 'code'}\``;
			cursorOffset = selectedText ? replacement.length : 1;
			break;
		case 'link':
			replacement = `[${selectedText || 'link text'}](url)`;
			cursorOffset = selectedText ? replacement.length - 4 : 1;
			break;
		case 'h1':
			replacement = `# ${selectedText || 'Heading 1'}`;
			cursorOffset = replacement.length;
			break;
		case 'h2':
			replacement = `## ${selectedText || 'Heading 2'}`;
			cursorOffset = replacement.length;
			break;
		case 'h3':
			replacement = `### ${selectedText || 'Heading 3'}`;
			cursorOffset = replacement.length;
			break;
		case 'quote':
			replacement = `> ${selectedText || 'Quote text'}`;
			cursorOffset = replacement.length;
			break;
		case 'ul':
			replacement = selectedText ? selectedText.split('\n').map(line => `- ${line}`).join('\n') : '- List item 1\n- List item 2\n- List item 3';
			cursorOffset = replacement.length;
			break;
		case 'ol':
			replacement = selectedText ? selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n') : '1. List item 1\n2. List item 2\n3. List item 3';
			cursorOffset = replacement.length;
			break;
		case 'task':
			replacement = selectedText ? selectedText.split('\n').map(line => `- [ ] ${line}`).join('\n') : '- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3';
			cursorOffset = replacement.length;
			break;
		case 'codeblock':
			replacement = `\`\`\`javascript\n${selectedText || '// Code here'}\n\`\`\``;
			cursorOffset = selectedText ? replacement.length - 4 : 13;
			break;
		case 'table':
			replacement = `| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |`;
			cursorOffset = replacement.length;
			break;
		case 'hr':
			replacement = '---';
			cursorOffset = 3;
			break;
		case 'details':
			replacement = `<details>\n<summary>${selectedText || 'Click to expand'}</summary>\n\nContent here\n\n</details>`;
			cursorOffset = replacement.indexOf('Content here');
			break;
		default:
			return;
	}

	// Insert formatted text
	const newContent = currentContent.substring(0, start) + replacement + currentContent.substring(end);
	editor.value = newContent;

	// Set cursor position
	const newCursorPos = start + cursorOffset;
	editor.setSelectionRange(newCursorPos, newCursorPos);
	editor.focus();

	// Trigger update
	handleEditorInput();

	// Save new state immediately after formatting
	saveToHistory();
}

// ===== Document Analysis =====
function analyzeDocument() {
	const content = editor.value.toLowerCase();
	const lines = editor.value.split('\n');

	// Define section patterns and their variations
	const sectionPatterns = {
		badges: [/!\[.*?\]\(https:\/\/img\.shields\.io/, /badge/, /build.*status/, /coverage/],
		description: [/^##?\s*(description|about|overview)/i, /^##?\s*what is/i],
		quickstart: [/^##?\s*(quick start|quickstart|getting started)/i],
		prerequisites: [/^##?\s*(prerequisites|requirements|dependencies)/i],
		installation: [/^##?\s*(installation|install|setup)/i],
		configuration: [/^##?\s*(configuration|config|environment)/i, /\.env/],
		usage: [/^##?\s*(usage|how to use|examples)/i],
		testing: [/^##?\s*(test|testing)/i, /npm test/, /jest/, /mocha/],
		api: [/^##?\s*(api|endpoints|reference)/i],
		troubleshooting: [/^##?\s*(troubleshoot|faq|common issues)/i],
		deployment: [/^##?\s*(deploy|deployment|production)/i],
		contributing: [/^##?\s*(contribut)/i],
		security: [/^##?\s*(security|vulnerab)/i],
		license: [/^##?\s*(license)/i, /mit license/, /apache/],
		changelog: [/^##?\s*(changelog|releases|history)/i],
		quickPR: [/^##?\s*(technical changes)/i, /key changes/i]
	};

	const foundSections = {};

	// Check each section pattern
	for (const [section, patterns] of Object.entries(sectionPatterns)) {
		foundSections[section] = false;

		for (const pattern of patterns) {
			if (pattern.test(content)) {
				foundSections[section] = true;
				break;
			}
			// Also check line by line for header patterns
			for (const line of lines) {
				if (pattern.test(line)) {
					foundSections[section] = true;
					break;
				}
			}
			if (foundSections[section]) break;
		}
	}

	return foundSections;
}

// ===== Section Insertion with Smart Positioning =====
const sectionOrder = [
	'quickPR', 'badges', 'description', 'quickstart', 'prerequisites', 'installation',
	'configuration', 'usage', 'testing', 'api', 'troubleshooting',
	'deployment', 'contributing', 'security', 'license', 'changelog'
];

function findInsertionPoint(sectionName) {
	const content = editor.value;
	const lines = content.split('\n');
	const sectionIndex = sectionOrder.indexOf(sectionName);

	if (sectionIndex === -1) {
		// Section not in order, append at end
		return content.length;
	}

	// Find sections that should come after this one
	const laterSections = sectionOrder.slice(sectionIndex + 1);

	// Look for the first header of a later section
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].toLowerCase();

		for (const laterSection of laterSections) {
			// Simple pattern matching - check if line starts with ## and contains section keyword
			if (line.match(/^##?\s+/) && line.includes(laterSection.replace(/([A-Z])/g, ' $1').trim().toLowerCase())) {
				// Found a later section, insert before it
				const position = lines.slice(0, i).join('\n').length;
				return position > 0 ? position + 1 : 0;
			}
		}
	}

	// No later section found, insert at end
	return content.length;
}

function insertSection(sectionName) {
	const section = sections[sectionName];
	if (!section) return;

	// Check if section already exists
	const analysis = analyzeDocument();
	if (analysis[sectionName]) {
		// Section exists - just scroll to it or give feedback
		showToast('This section already exists in your document', 3000);
		return;
	}

	const currentContent = editor.value;

	// Save current state to history before making changes
	saveToHistory();

	// Process template with variables
	processTemplateVariables(section, sectionName).then(processedSection => {
		// Use smart positioning if document has content
		let insertPos;
		if (currentContent.trim().length > 0) {
			insertPos = findInsertionPoint(sectionName);

			// Add spacing if needed
			let prefix = '';
			let suffix = '';

			if (insertPos > 0 && currentContent[insertPos - 1] !== '\n') {
				prefix = '\n\n';
			}
			if (insertPos < currentContent.length && currentContent[insertPos] !== '\n') {
				suffix = '\n\n';
			}

			const newContent = currentContent.substring(0, insertPos) + prefix + processedSection + suffix + currentContent.substring(insertPos);
			editor.value = newContent;

			// Move cursor to start of inserted section
			const newCursorPos = insertPos + prefix.length;
			editor.setSelectionRange(newCursorPos, newCursorPos);
		} else {
			// Empty document - just insert
			editor.value = processedSection;
			editor.setSelectionRange(0, 0);
		}

		editor.focus();

		// Trigger update and refresh section indicators
		handleEditorInput();


		// Save new state to history immediately after insertion
		saveToHistory();
	});
}

// ===== Template Variables =====
async function processTemplateVariables(template, sectionName) {
	// Get values from sidebar form inputs
	const templateVars = {
		projectName: document.getElementById('projectNameInput')?.value || 'Project Name',
		username: document.getElementById('usernameInput')?.value || 'username',
		repo: document.getElementById('repoInput')?.value || 'repo',
		ticketNumber: document.getElementById('ticketNumberInput')?.value || '00000',
		prTitle: document.getElementById('prTitleInput')?.value || '[Title]',
		apiUrl: document.getElementById('apiUrlInput')?.value || 'https://api.example.com/v1',
		securityEmail: document.getElementById('securityEmailInput')?.value || 'security@example.com'
	};

	// Replace placeholders in template
	let result = template;
	Object.keys(templateVars).forEach(key => {
		const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
		result = result.replace(placeholder, templateVars[key]);
	});

	return result;
}

// ===== Template Insertion (for backward compatibility) =====
function insertTemplate(templateName) {
	const template = fullTemplates[templateName];
	if (!template) return;

	const start = editor.selectionStart;
	const end = editor.selectionEnd;
	const currentContent = editor.value;

	// Insert template at cursor position
	const newContent = currentContent.substring(0, start) + template + currentContent.substring(end);
	editor.value = newContent;

	// Move cursor to end of inserted template
	const newCursorPos = start + template.length;
	editor.setSelectionRange(newCursorPos, newCursorPos);
	editor.focus();

	// Trigger update
	handleEditorInput();
}

// ===== File Upload =====
function handleFileUpload(e) {
	const file = e.target.files[0];
	if (!file) return;

	processFile(file);

	// Reset input
	fileInput.value = '';
}

function processFile(file) {
	// Validate file extension
	const validExtensions = ['.md', '.txt', '.markdown'];
	const fileName = file.name.toLowerCase();
	const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

	// Validate MIME type
	const validTypes = ['text/markdown', 'text/plain', ''];
	const isValidType = validTypes.includes(file.type);

	if (!isValidExtension || (!isValidType && file.type !== '')) {
		showModal({
			title: 'Invalid File',
			message: 'Please select a valid markdown or text file (.md, .txt, .markdown)',
			type: 'error'
		});
		return;
	}

	// Read file
	const reader = new FileReader();
	reader.onload = (evt) => {
		editor.value = evt.target.result;
		handleEditorInput();

		// Analyze document and update section buttons


		// Show helpful feedback
		const analysis = analyzeDocument();
		const foundCount = Object.values(analysis).filter(v => v).length;
		const totalCount = Object.keys(sections).length;

		if (foundCount > 0) {
			showToast(`Document loaded! Found ${foundCount}/${totalCount} sections. Check section buttons for what's missing.`, 5000);
		} else {
			showToast('Document loaded! Click section buttons to add standard sections.', 4000);
		}
	};
	reader.onerror = () => {
		showModal({
			title: 'Read Error',
			message: 'Error reading file. Please try again.',
			type: 'error'
		});
	};
	reader.readAsText(file);
}

// ===== Drag and Drop =====
function setupDragAndDrop() {
	let dragCounter = 0;

	// Prevent default drag behaviors on the whole page
	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		document.body.addEventListener(eventName, preventDefaults, false);
	});

	function preventDefaults(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	// Drag enter/over - show drop zone
	editorPane.addEventListener('dragenter', (e) => {
		preventDefaults(e);
		dragCounter++;
		if (e.dataTransfer.types.includes('Files')) {
			dropZone.classList.add('active');
		}
	});

	editorPane.addEventListener('dragover', (e) => {
		preventDefaults(e);
		if (e.dataTransfer.types.includes('Files')) {
			dropZone.classList.add('active');
		}
	});

	// Drag leave - hide drop zone
	editorPane.addEventListener('dragleave', (e) => {
		preventDefaults(e);
		dragCounter--;
		if (dragCounter === 0) {
			dropZone.classList.remove('active');
		}
	});

	// Drop - handle file
	editorPane.addEventListener('drop', (e) => {
		preventDefaults(e);
		dragCounter = 0;
		dropZone.classList.remove('active');

		const files = e.dataTransfer.files;
		if (files.length > 0) {
			processFile(files[0]);
		}
	});
}

// ===== Prettify Markdown =====
function prettifyMarkdown() {
	const content = editor.value;
	if (!content.trim()) return;

	// Store snapshot for undo
	editorState.prettifySnapshot = content;

	let prettified = content;

	// Normalize line endings
	prettified = prettified.replace(/\r\n/g, '\n');

	// Fix header spacing (add blank line before and after headers)
	prettified = prettified.replace(/([^\n])\n(#{1,6} .+)/g, '$1\n\n$2');
	prettified = prettified.replace(/(#{1,6} .+)\n([^\n#])/g, '$1\n\n$2');

	// Normalize list indentation
	prettified = prettified.replace(/^[ \t]*[-*+] /gm, '- ');
	prettified = prettified.replace(/^[ \t]*(\d+)\. /gm, '$1. ');

	// Remove trailing whitespace
	prettified = prettified.replace(/[ \t]+$/gm, '');

	// Normalize multiple blank lines to maximum 2
	prettified = prettified.replace(/\n{3,}/g, '\n\n');

	// Ensure single newline at end of file
	prettified = prettified.replace(/\n*$/, '\n');

	// Update editor
	editor.value = prettified;
	handleEditorInput();

	// Show undo toast
	showUndoToast();
}

// ===== Undo Prettify =====
function undoPrettify() {
	if (editorState.prettifySnapshot) {
		editor.value = editorState.prettifySnapshot;
		handleEditorInput();
		hideUndoToast();
		editorState.prettifySnapshot = null;
	}
}

// ===== Undo Action (General Undo) =====
let undoHistory = [];
let redoHistory = [];
const MAX_HISTORY = 50;

function saveToHistory() {
	const currentContent = editor.value;

	// Don't save if it's the same as the last entry
	if (undoHistory.length > 0 && undoHistory[undoHistory.length - 1] === currentContent) {
		return;
	}

	undoHistory.push(currentContent);
	if (undoHistory.length > MAX_HISTORY) {
		undoHistory.shift();
	}
	redoHistory = []; // Clear redo history on new action
}

function undoAction() {
	if (undoHistory.length <= 1) {
		// Need at least 2 states: current and previous
		showToast('Nothing to undo', 2000);
		return;
	}

	// Remove current state
	const currentState = undoHistory.pop();

	// Get previous state
	const previousState = undoHistory[undoHistory.length - 1];

	redoHistory.push(currentState);
	editor.value = previousState;
	handleEditorInput();
}

// ===== Clear All =====
async function clearAll() {
	if (!editor.value.trim()) {
		return;
	}

	const confirmed = await showModal({
		title: 'Clear All Content',
		message: 'Are you sure you want to clear all content? This cannot be undone.',
		type: 'warning',
		confirmText: 'Clear All',
		showCancel: true,
		danger: true
	});

	if (confirmed) {
		saveToHistory(); // Save current state before clearing
		editor.value = '';
		handleEditorInput();
	}
}

// ===== Toast Notifications =====
function showToast(message, duration = 3000) {
	// Reuse the undo toast for general notifications
	const toastMessage = undoToast.querySelector('span');
	const undoButton = undoToast.querySelector('#undoBtn');

	// Hide undo button for general toasts
	undoButton.style.display = 'none';
	toastMessage.textContent = message;

	clearTimeout(editorState.undoTimeout);
	undoToast.classList.add('show');

	editorState.undoTimeout = setTimeout(() => {
		hideUndoToast();
	}, duration);
}

// ===== Undo Toast =====
function showUndoToast() {
	const undoButton = undoToast.querySelector('#undoBtn');
	const toastMessage = undoToast.querySelector('span');

	// Show undo button for prettify notifications
	undoButton.style.display = 'inline-block';
	toastMessage.textContent = 'Document prettified!';

	clearTimeout(editorState.undoTimeout);
	undoToast.classList.add('show');

	editorState.undoTimeout = setTimeout(() => {
		hideUndoToast();
		editorState.prettifySnapshot = null;
	}, 5000);
}

function hideUndoToast() {
	undoToast.classList.remove('show');
}

// ===== Export Markdown =====
function exportMarkdown() {
	const content = editor.value;
	if (!content.trim()) {
		showModal({
			title: 'Nothing to Export',
			message: 'Please write some markdown first.',
			type: 'info'
		});
		return;
	}

	// Generate filename from first H1 or use timestamp
	let filename = 'document.md';
	const h1Match = content.match(/^#\s+(.+)$/m);

	if (h1Match && h1Match[1]) {
		// Sanitize filename: replace spaces with hyphens, remove special chars
		filename = h1Match[1]
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '') + '.md';
	} else {
		// Use timestamp
		const now = new Date();
		filename = `markdown-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.md`;
	}

	// Create and download blob
	const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

// ===== Copy Markdown =====
async function copyMarkdown() {
	const content = editor.value;
	if (!content.trim()) {
		showModal({
			title: 'Nothing to Copy',
			message: 'Please write some markdown first.',
			type: 'info'
		});
		return;
	}

	try {
		await navigator.clipboard.writeText(content);

		// Visual feedback - update button text temporarily
		const originalHTML = copyMarkdownBtn.innerHTML;
		copyMarkdownBtn.innerHTML = `
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<polyline points="20 6 9 17 4 12"></polyline>
			</svg>
			Copied!
		`;
		copyMarkdownBtn.style.borderColor = 'var(--accent-primary)';
		copyMarkdownBtn.style.color = 'var(--accent-light)';

		setTimeout(() => {
			copyMarkdownBtn.innerHTML = originalHTML;
			copyMarkdownBtn.style.borderColor = '';
			copyMarkdownBtn.style.color = '';
		}, 2000);

		showToast('Markdown copied to clipboard!', 2000);
	} catch (error) {
		showModal({
			title: 'Copy Failed',
			message: 'Failed to copy to clipboard. Please try again.',
			type: 'error'
		});
	}
}

// ===== Sidebar Toggle =====
function toggleSidebar() {
	// Only toggle on mobile
	if (window.innerWidth <= 768) {
		sidebar.classList.toggle('show');
		editorState.sidebarCollapsed = !sidebar.classList.contains('show');
		localStorage.setItem('sidebarCollapsed', editorState.sidebarCollapsed);
	}
	// Desktop: sidebar always visible, do nothing
}

// ===== Preview Toggle =====
function togglePreview() {
	editorState.previewVisible = !editorState.previewVisible;
	previewPane.classList.toggle('show');
}

// ===== Save Indicator =====
function updateSaveIndicator(state) {
	if (state === 'saving') {
		saveIndicator.classList.add('saving');
		saveIndicator.querySelector('.save-text').textContent = 'Saving...';
	} else {
		saveIndicator.classList.remove('saving');
		saveIndicator.querySelector('.save-text').textContent = 'Saved';
	}
}

// ===== LocalStorage =====
function saveToLocalStorage() {
	try {
		localStorage.setItem('markdown-content', editor.value);
		localStorage.setItem('markdown-timestamp', Date.now());
	} catch (e) {
		if (e.name === 'QuotaExceededError') {
			console.error('LocalStorage quota exceeded');
			showModal({
				title: 'Storage Full',
				message: 'Storage quota exceeded. Your content may not be saved.',
				type: 'warning'
			});
		}
	}
}

function loadFromLocalStorage() {
	// Load content
	const savedContent = localStorage.getItem('markdown-content');
	if (savedContent) {
		editor.value = savedContent;
		editorState.content = savedContent;
		// Initialize history with loaded content
		saveToHistory();
	}

	// FORCE sidebar to start open - ignore localStorage for now
	editorState.sidebarCollapsed = false;
	sidebar.classList.remove('collapsed');
	sidebar.classList.remove('show');

	// Clear any stuck localStorage state
	localStorage.removeItem('sidebarCollapsed');

	// For mobile, keep it hidden by default
	if (window.innerWidth <= 768) {
		sidebar.classList.remove('show');
	}
}

function loadTemplateVariables() {
	const savedVars = localStorage.getItem('templateVariables');
	if (savedVars) {
		try {
			const vars = JSON.parse(savedVars);
			if (vars.projectNameInput) document.getElementById('projectNameInput').value = vars.projectNameInput;
			if (vars.usernameInput) document.getElementById('usernameInput').value = vars.usernameInput;
			if (vars.repoInput) document.getElementById('repoInput').value = vars.repoInput;
			if (vars.ticketNumberInput) document.getElementById('ticketNumberInput').value = vars.ticketNumberInput;
			if (vars.prTitleInput) document.getElementById('prTitleInput').value = vars.prTitleInput;
			if (vars.apiUrlInput) document.getElementById('apiUrlInput').value = vars.apiUrlInput;
			if (vars.securityEmailInput) document.getElementById('securityEmailInput').value = vars.securityEmailInput;
		} catch (e) {
			console.error('Error loading template variables:', e);
		}
	}
}


// ===== Keyboard Shortcuts =====
function handleKeyboardShortcuts(e) {
	// Ctrl+S: Save manually
	if (e.ctrlKey && e.key === 's') {
		e.preventDefault();
		saveToLocalStorage();
		updateSaveIndicator('saved');
		return;
	}

	// Ctrl+P: Toggle preview
	if (e.ctrlKey && e.key === 'p') {
		e.preventDefault();
		togglePreview();
		return;
	}

	// Ctrl+E: Export
	if (e.ctrlKey && e.key === 'e') {
		e.preventDefault();
		exportMarkdown();
		return;
	}

	// Ctrl+B: Toggle sidebar
	if (e.ctrlKey && e.key === 'b') {
		e.preventDefault();
		toggleSidebar();
		return;
	}

	// Ctrl+Shift+F: Prettify
	if (e.ctrlKey && e.shiftKey && e.key === 'F') {
		e.preventDefault();
		prettifyMarkdown();
		return;
	}

	// Ctrl+Z: Undo prettify (only if snapshot exists)
	if (e.ctrlKey && e.key === 'z' && editorState.prettifySnapshot) {
		e.preventDefault();
		undoPrettify();
		return;
	}

	// Ctrl+/: Show shortcuts
	if (e.ctrlKey && e.key === '/') {
		e.preventDefault();
		shortcutsModal.classList.toggle('show');
		return;
	}

	// Ctrl+F: Find & Replace
	if (e.ctrlKey && e.key === 'f') {
		e.preventDefault();
		openFindReplace();
		return;
	}
}

// ===== Find & Replace Functions =====
function openFindReplace() {
	findReplaceModal.classList.add('show');
	findInput.value = '';
	replaceInput.value = '';
	findStatus.textContent = '';
	findStatus.className = 'find-replace-status';
	findMatches = [];
	currentMatchIndex = -1;

	// Focus find input
	setTimeout(() => findInput.focus(), 100);
}

function closeFindReplaceModal() {
	findReplaceModal.classList.remove('show');
	// Clear any highlights
	clearHighlights();
}

function performFind(direction = 'next') {
	const searchText = findInput.value;
	if (!searchText) {
		findStatus.textContent = 'Enter text to find';
		findStatus.className = 'find-replace-status error';
		return;
	}

	const content = editor.value;
	const isCaseSensitive = caseSensitive.checked;
	const isWholeWord = wholeWord.checked;

	// Build search pattern
	let pattern = searchText;
	if (!isCaseSensitive) {
		pattern = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex
	}
	if (isWholeWord) {
		pattern = `\\b${pattern}\\b`;
	}

	const flags = isCaseSensitive ? 'g' : 'gi';
	const regex = new RegExp(pattern, flags);

	// Find all matches
	findMatches = [];
	let match;
	while ((match = regex.exec(content)) !== null) {
		findMatches.push({
			index: match.index,
			length: match[0].length
		});
	}

	if (findMatches.length === 0) {
		findStatus.textContent = 'No matches found';
		findStatus.className = 'find-replace-status error';
		currentMatchIndex = -1;
		return;
	}

	// Navigate to match
	if (direction === 'next') {
		currentMatchIndex = (currentMatchIndex + 1) % findMatches.length;
	} else {
		currentMatchIndex = currentMatchIndex <= 0 ? findMatches.length - 1 : currentMatchIndex - 1;
	}

	selectMatch(currentMatchIndex);
}

function selectMatch(index) {
	if (index < 0 || index >= findMatches.length) return;

	const match = findMatches[index];
	editor.focus();
	editor.setSelectionRange(match.index, match.index + match.length);
	editor.scrollTop = editor.scrollHeight * (match.index / editor.value.length);

	findStatus.textContent = `Match ${index + 1} of ${findMatches.length}`;
	findStatus.className = 'find-replace-status success';
}

function clearHighlights() {
	// Reset selection
	if (editor.selectionStart !== editor.selectionEnd) {
		editor.setSelectionRange(editor.selectionStart, editor.selectionStart);
	}
}

function replaceCurrentMatch() {
	if (currentMatchIndex < 0 || currentMatchIndex >= findMatches.length) {
		findStatus.textContent = 'No match selected';
		findStatus.className = 'find-replace-status error';
		return;
	}

	const replaceText = replaceInput.value;
	const match = findMatches[currentMatchIndex];
	const content = editor.value;

	// Replace the match
	const newContent = content.substring(0, match.index) +
		replaceText +
		content.substring(match.index + match.length);

	editor.value = newContent;
	handleEditorInput();

	// Update matches after replacement
	const lengthDiff = replaceText.length - match.length;
	findMatches.splice(currentMatchIndex, 1);

	// Adjust subsequent match positions
	for (let i = currentMatchIndex; i < findMatches.length; i++) {
		findMatches[i].index += lengthDiff;
	}

	// Update status
	if (findMatches.length === 0) {
		findStatus.textContent = 'All matches replaced';
		findStatus.className = 'find-replace-status success';
		currentMatchIndex = -1;
	} else {
		// Move to next match or wrap to first
		currentMatchIndex = currentMatchIndex >= findMatches.length ? 0 : currentMatchIndex;
		selectMatch(currentMatchIndex);
	}
}

function replaceAll() {
	const searchText = findInput.value;
	const replaceText = replaceInput.value;

	if (!searchText) {
		findStatus.textContent = 'Enter text to find';
		findStatus.className = 'find-replace-status error';
		return;
	}

	const content = editor.value;
	const isCaseSensitive = caseSensitive.checked;
	const isWholeWord = wholeWord.checked;

	// Build search pattern
	let pattern = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	if (isWholeWord) {
		pattern = `\\b${pattern}\\b`;
	}

	const flags = isCaseSensitive ? 'g' : 'gi';
	const regex = new RegExp(pattern, flags);

	// Count matches first
	const matches = content.match(regex);
	if (!matches || matches.length === 0) {
		findStatus.textContent = 'No matches found';
		findStatus.className = 'find-replace-status error';
		return;
	}

	// Replace all
	const newContent = content.replace(regex, replaceText);
	editor.value = newContent;
	handleEditorInput();

	// Update status
	findStatus.textContent = `Replaced ${matches.length} occurrence${matches.length > 1 ? 's' : ''}`;
	findStatus.className = 'find-replace-status success';

	// Clear matches
	findMatches = [];
	currentMatchIndex = -1;
}

// ===== Start Application =====
window.addEventListener('DOMContentLoaded', init);

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
const validateBtn = document.getElementById('validateBtn');

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
const findReplacePanel = document.getElementById('findReplacePanel');

// Find & Replace State
let findMatches = [];
let currentMatchIndex = -1;

// ===== Custom Modal Functions =====
function showModal({ title, message = '', type = 'info', confirmText = 'OK', cancelText = 'Cancel', showCancel = false, danger = false }) {
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
		modalMessage.innerHTML = message;
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

// ===== Template Data =====
const templateData = window.TemplateData || { sections: {}, templateOrder: [] };
const sections = templateData.sections;
const templateOrder = templateData.templateOrder;

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

	console.log('ReMarkAble loaded. Sidebar state:', editorState.sidebarCollapsed);
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

	// Template dropdown and insert button
	const templateDropdown = document.getElementById('templateDropdown');
	const insertTemplateBtn = document.getElementById('insertTemplateBtn');
	const templateOptions = templateDropdown ? Array.from(templateDropdown.options) : [];

	templateOptions.forEach(option => {
		if (!option.dataset.label) {
			option.dataset.label = option.textContent.trim();
		}
	});

	// Update dropdown option labels to show which templates exist
	function updateTemplateDropdown() {
		const analysis = analyzeDocument();
		const options = templateDropdown.querySelectorAll('option');

		options.forEach(option => {
			const baseLabel = option.dataset.label ?? option.textContent.trim();

			if (!option.value) {
				option.textContent = baseLabel;
				option.classList.remove('template-option-added');
				return;
			}

			if (analysis[option.value]) {
				option.textContent = `${baseLabel} \u2022`;
				option.classList.add('template-option-added');
			} else {
				option.textContent = baseLabel;
				option.classList.remove('template-option-added');
			}
		});
		
		// Check if selected template already exists
		if (templateDropdown.value && analysis[templateDropdown.value]) {
			insertTemplateBtn.classList.add('template-exists');
			insertTemplateBtn.title = 'Template already exists in document';
		} else {
			insertTemplateBtn.classList.remove('template-exists');
			insertTemplateBtn.title = '';
		}
	}

	templateDropdown.addEventListener('change', () => {
		insertTemplateBtn.disabled = !templateDropdown.value;
		updateTemplateDropdown();
	});

	insertTemplateBtn.addEventListener('click', () => {
		if (templateDropdown.value) {
			const selectedValue = templateDropdown.value;
			insertTemplate(selectedValue);
			insertTemplateBtn.disabled = true;
		}
	});

	// Update dropdown checkmarks on editor input
	let updateDropdownTimeout;
	editor.addEventListener('input', () => {
		clearTimeout(updateDropdownTimeout);
		updateDropdownTimeout = setTimeout(() => {
			updateTemplateDropdown();
		}, 100);
	});

	// Initial update
	updateTemplateDropdown();

	// Template variable inputs - save to localStorage on change
	const templateVarInputs = [
		'projectNameInput', 'usernameInput', 'repoInput',
		'ticketNumberInput', 'prTitleInput', 'apiUrlInput', 'contactEmailInput',
		'projectDescInput', 'licenseTypeInput', 'buildStatusInput', 'buildVersionInput', 'dateInput'
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

	// Restore template variables from localStorage
	const savedTemplateVars = localStorage.getItem('templateVariables');
	if (savedTemplateVars) {
		try {
			const templateVars = JSON.parse(savedTemplateVars);
			templateVarInputs.forEach(inputId => {
				const input = document.getElementById(inputId);
				if (input && templateVars[inputId]) {
					input.value = templateVars[inputId];
				}
			});
		} catch (e) {
			console.error('Error restoring template variables:', e);
		}
	}

	// Initialize date input with today's date if not already set
	const dateInput = document.getElementById('dateInput');
	if (dateInput && !dateInput.value) {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, '0');
		const day = String(today.getDate()).padStart(2, '0');
		dateInput.value = `${year}-${month}-${day}`;
	}


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

	// Validate Markdown
	validateBtn.addEventListener('click', validateMarkdown);

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
		badges: [/!\[.*?\]\(https:\/\/img\.shields\.io/i, /badge/i, /build.*status/i, /coverage/i],
		description: [/^##?\s*(description|about|overview)/i, /^##?\s*what is/i],
		quickstart: [/^##?\s*(quick start|quickstart|getting started)/i],
		prerequisites: [/^##?\s*(prerequisites|requirements|dependencies)/i],
		installation: [/^##?\s*(installation|install|setup)/i],
		configuration: [/^##?\s*(configuration|config|environment)/i, /\.env/i],
		usage: [/^##?\s*(usage|how to use|examples)/i],
		testing: [/^##?\s*(test|testing)/i, /npm test/i, /jest/i, /mocha/i],
		api: [/^##?\s*(api|endpoints|reference)/i],
		troubleshooting: [/^##?\s*(troubleshoot|faq|common issues)/i],
		deployment: [/^##?\s*(deploy|deployment|production)/i],
		contributing: [/^##?\s*(contribut)/i],
		security: [/^##?\s*(security|vulnerab)/i],
		license: [/^##?\s*(license)/i, /^## license/i, /mit license/i, /apache/i],
		changelog: [/^##?\s*(changelog|releases|history)/i, /^## changelog/i],
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

function findInsertionPoint(templateName) {
	const content = editor.value;
	const lines = content.split('\n');
	const templateIndex = templateOrder.indexOf(templateName);

	if (templateIndex === -1) {
		// Template not in order, append at end
		return content.length;
	}

	// Find templates that should come after this one
	const laterTemplates = templateOrder.slice(templateIndex + 1);

	// Look for the first header of a later template
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].toLowerCase();

		for (const laterTemplate of laterTemplates) {
			// Simple pattern matching - check if line starts with ## and contains template keyword
			if (line.match(/^##?\s+/) && line.includes(laterTemplate.replace(/([A-Z])/g, ' $1').trim().toLowerCase())) {
				// Found a later template, insert before it
				const position = lines.slice(0, i).join('\n').length;
				return position > 0 ? position + 1 : 0;
			}
		}
	}

	// No later template found, insert at end
	return content.length;
}

function insertTemplate(templateName) {
	const template = sections[templateName];
	if (!template) return;

	// Check if template already exists
	const analysis = analyzeDocument();
	if (analysis[templateName]) {
		// Template exists - just scroll to it or give feedback
		showToast('This template already exists in your document', 3000);
		return;
	}

	const currentContent = editor.value;

	// Save current state to history before making changes
	saveToHistory();

	// Process template with variables
	processTemplateVariables(template, templateName).then(processedTemplate => {
		// Use smart positioning if document has content
		let insertPos;
		if (currentContent.trim().length > 0) {
			insertPos = findInsertionPoint(templateName);

			// Add spacing if needed
			let prefix = '';
			let suffix = '';

			if (insertPos > 0 && currentContent[insertPos - 1] !== '\n') {
				prefix = '\n\n';
			}
			if (insertPos < currentContent.length && currentContent[insertPos] !== '\n') {
				suffix = '\n\n';
			}

			const newContent = currentContent.substring(0, insertPos) + prefix + processedTemplate + suffix + currentContent.substring(insertPos);
			editor.value = newContent;

			// Move cursor to start of inserted template
			const newCursorPos = insertPos + prefix.length;
			editor.setSelectionRange(newCursorPos, newCursorPos);
		} else {
			// Empty document - just insert
			editor.value = processedTemplate;
			editor.setSelectionRange(0, 0);
		}

		editor.focus();

		// Trigger update and refresh template indicators
		handleEditorInput();

		// Update dropdown labels to reflect newly inserted template
		updateTemplateDropdown();

		// Reset dropdown selection after insertion
		templateDropdown.value = '';
		insertTemplateBtn.disabled = true;

		// Force another update after a brief delay to ensure checkmarks display
		setTimeout(() => {
			updateTemplateDropdown();
		}, 50);

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
		contactEmail: document.getElementById('contactEmailInput')?.value || 'contact@example.com',
		projectDesc: document.getElementById('projectDescInput')?.value || 'A clear and concise description of what this project does and who it\'s for.',
		licenseType: document.getElementById('licenseTypeInput')?.value || 'MIT',
		buildStatus: document.getElementById('buildStatusInput')?.value || 'passing',
		buildVersion: document.getElementById('buildVersionInput')?.value || '1.0.0',
		date: document.getElementById('dateInput')?.value || new Date().toISOString().split('T')[0]
	};

	// Replace placeholders in template
	let result = template;
	Object.keys(templateVars).forEach(key => {
		const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
		result = result.replace(placeholder, templateVars[key]);
	});

	return result;
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

// ===== Markdown Validation =====
function validateMarkdown() {
	const content = editor.value;
	if (!content.trim()) {
		showModal({
			title: 'Nothing to Validate',
			message: 'Please write some markdown first.',
			type: 'info'
		});
		return;
	}

	const issues = window.Validation?.validateMarkdownContent
		? window.Validation.validateMarkdownContent(content)
		: [];
	if (issues.length === 0) {
		showModal({
			title: 'Markdown Looks Good',
			message: 'No common markdown formatting issues detected.',
			type: 'success',
			confirmText: 'Close'
		});
		return;
	}

	const listItems = issues.map(issue => {
		const lineInfo = issue.line ? `<strong>Line ${issue.line}:</strong> ` : '';
		return `<li>${lineInfo}${issue.message}</li>`;
	}).join('');

	showModal({
		title: 'Markdown Validation',
		message: `<p>Found ${issues.length} issue${issues.length > 1 ? 's' : ''}. Review the details below:</p><ul class="validation-list">${listItems}</ul>`,
		type: 'warning',
		confirmText: 'Close'
	});
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
			if (vars.contactEmailInput) document.getElementById('contactEmailInput').value = vars.contactEmailInput;
			if (vars.projectDescInput) document.getElementById('projectDescInput').value = vars.projectDescInput;
			if (vars.licenseTypeInput) document.getElementById('licenseTypeInput').value = vars.licenseTypeInput;
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

	// Ctrl+H: Find & Replace
	if (e.ctrlKey && e.key === 'h') {
		e.preventDefault();
		openFindReplace();
		return;
	}
}

// ===== Find & Replace Functions =====
function escapeRegex(text) {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function openFindReplace() {
	if (findStatus) {
		findStatus.textContent = '';
		findStatus.className = 'find-replace-status';
	}
	findMatches = [];
	currentMatchIndex = -1;

	if (findReplacePanel) {
		findReplacePanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	setTimeout(() => findInput?.focus(), 50);
}

function closeFindReplaceModal() {
	if (findInput) findInput.value = '';
	if (replaceInput) replaceInput.value = '';
	if (findStatus) {
		findStatus.textContent = '';
		findStatus.className = 'find-replace-status';
	}
	findMatches = [];
	currentMatchIndex = -1;
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
	const escapedSearch = escapeRegex(searchText);
	let pattern = escapedSearch;
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
	let pattern = escapeRegex(searchText);
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

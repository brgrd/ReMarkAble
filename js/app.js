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

let findReplaceController = null;
let formattingController = null;
let persistenceController = null;
let uiController = null;
let previewController = null;
let filesController = null;

// ===== UI Delegates =====
function showModal(options) {
	return uiController?.showModal
		? uiController.showModal(options)
		: Promise.resolve(false);
}

function setupModalListeners() {
	uiController?.setupModalListeners?.();
}

function showToast(message, duration) {
	uiController?.showToast?.(message, duration);
}

function showUndoToast() {
	uiController?.showUndoToast?.();
}

function hideUndoToast() {
	uiController?.hideUndoToast?.();
}

// ===== Template Data =====
const templateData = window.TemplateData || { sections: {}, templateOrder: [] };
const sections = templateData.sections;
const templateOrder = templateData.templateOrder;

// ===== Initialize =====
function init() {
	// Initialize UI controller
	if (window.UI?.createUI) {
		uiController = window.UI.createUI({
			editorState,
			customModal,
			modalIcon,
			modalTitle,
			modalMessage,
			modalConfirm,
			modalCancel,
			undoToast,
			undoBtn
		});
	}

	// Initialize persistence controller and load saved state
	if (window.Persistence?.createPersistence) {
		persistenceController = window.Persistence.createPersistence({
			editor,
			sidebar,
			editorState,
			saveToHistory,
			showModal
		});
		persistenceController.loadContent();
		persistenceController.loadTemplateVariables();
	} else {
		loadFromLocalStorage();
		loadTemplateVariables();
	}

	// Set up event listeners
	setupEventListeners();

	// Initialize preview controller
	if (window.Preview?.createPreview) {
		previewController = window.Preview.createPreview({
			editor,
			previewEl: preview,
			wordCountEl: wordCountDisplay,
			parseMarkdown: (text) => marked.parse(text),
			debounce
		});
	}

	// Initialize files controller
	if (window.Files?.createFiles) {
		filesController = window.Files.createFiles({
			editor,
			fileInput,
			uploadBtn,
			copyMarkdownBtn,
			dropZone,
			editorPane,
			showModal,
			showToast,
			handleEditorInput,
			analyzeDocument
		});
		filesController.setupDragAndDrop();
		filesController.attachListeners();
	}

	// Initialize Find & Replace controller
	if (window.FindReplace?.createFindReplace) {
		findReplaceController = window.FindReplace.createFindReplace({
			editor,
			findInput,
			replaceInput,
			caseSensitive,
			wholeWord,
			statusEl: findStatus,
			panelEl: findReplacePanel
		});
	}

	// Initialize formatting controller
	if (window.Formatting?.createFormatting) {
		formattingController = window.Formatting.createFormatting({
			editor,
			editorState,
			saveToHistory,
			handleEditorInput,
			showUndoToast,
			hideUndoToast
		});
	}

	// Initial render
	if (editor.value) {
		previewController?.updatePreview();
		// Analyze loaded document
	}

	// Debug helper removed for production polish.
}

// ===== Event Listeners Setup =====
function setupEventListeners() {
	// Modal listeners
	setupModalListeners();

	// Editor input
	editor.addEventListener('input', handleEditorInput);
	editor.addEventListener('scroll', () => previewController?.syncScroll());

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

	// Update dropdown indicators on editor input
	const debouncedUpdateTemplateDropdown = debounce(updateTemplateDropdown, 100);
	editor.addEventListener('input', () => debouncedUpdateTemplateDropdown());

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
			if (!format) return;
			formattingController?.applyFormatting(format);
		});
	});

	// File upload / copy
	filesController?.attachListeners();

	// Validate Markdown
	validateBtn.addEventListener('click', validateMarkdown);

	// Undo Action
	undoActionBtn.addEventListener('click', undoAction);

	// Clear All
	clearAllBtn.addEventListener('click', clearAll);

	// Prettify
	prettifyBtn.addEventListener('click', () => formattingController?.prettifyMarkdown());

	// Export
	exportBtn.addEventListener('click', () => filesController?.exportMarkdown());

	// Undo (for prettify toast)
	undoBtn.addEventListener('click', () => formattingController?.undoPrettify());

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

		// Find & Replace (sidebar panel)
		findPrevBtn.addEventListener('click', () => findReplaceController?.findPrev());
		findNextBtn.addEventListener('click', () => findReplaceController?.findNext());
		replaceBtn.addEventListener('click', () => findReplaceController?.replaceCurrent());
		replaceAllBtn.addEventListener('click', () => findReplaceController?.replaceAll());
		closeFindReplace.addEventListener('click', () => findReplaceController?.clear());

		}

// ===== Editor Input Handler =====
const AUTOSAVE_DELAY = 1000;
const HISTORY_DELAY = 3000; // Save to history every 3 seconds of inactivity

const debounce = window.Utils?.debounce || ((fn) => fn);
const debouncedAutoSave = debounce(() => {
	if (persistenceController) {
		persistenceController.saveContent();
	}
	updateSaveIndicator('saved');
}, AUTOSAVE_DELAY);
const debouncedHistorySave = debounce(() => saveToHistory(), HISTORY_DELAY);

function handleEditorInput() {
	editorState.content = editor.value;

	// Update preview with debounce
	previewController?.updatePreview();

	// Auto-save with debounce
	updateSaveIndicator('saving');
	debouncedAutoSave();

	// Save to undo history with longer debounce
	debouncedHistorySave();
}

// Preview/wordcount/scroll logic is handled by previewController.

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

		setTimeout(() => updateTemplateDropdown(), 50);

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

// File operations and prettify are handled by their controllers.

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

// Toasts are handled by uiController.

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

// ===== Keyboard Shortcuts =====
function handleKeyboardShortcuts(e) {
	// Ctrl+S: Save manually
	if (e.ctrlKey && e.key === 's') {
		e.preventDefault();
		persistenceController?.saveContent();
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
		filesController?.exportMarkdown();
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
		formattingController?.prettifyMarkdown();
		return;
	}

	// Ctrl+Z: Undo prettify (only if snapshot exists)
	if (e.ctrlKey && e.key === 'z' && editorState.prettifySnapshot) {
		e.preventDefault();
		formattingController?.undoPrettify();
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
		findReplaceController?.open();
		return;
	}
}

// ===== Start Application =====
window.addEventListener('DOMContentLoaded', init);

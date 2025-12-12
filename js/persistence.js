// LocalStorage persistence and template variable restoration.
(function () {
	function createPersistence({
		editor,
		sidebar,
		editorState,
		saveToHistory,
		showModal
	}) {
		function saveContent() {
			if (!editor) return;
			try {
				localStorage.setItem('markdown-content', editor.value);
				localStorage.setItem('markdown-timestamp', Date.now());
			} catch (e) {
				if (e.name === 'QuotaExceededError') {
					console.error('LocalStorage quota exceeded');
					showModal?.({
						title: 'Storage Full',
						message: 'Storage quota exceeded. Your content may not be saved.',
						type: 'warning'
					});
				}
			}
		}

		function loadContent() {
			if (!editor) return;
			const savedContent = localStorage.getItem('markdown-content');
			if (savedContent) {
				editor.value = savedContent;
				editorState.content = savedContent;
				saveToHistory?.();
			}

			// Force sidebar to start open and clear any stuck state.
			editorState.sidebarCollapsed = false;
			sidebar?.classList.remove('collapsed');
			sidebar?.classList.remove('show');
			localStorage.removeItem('sidebarCollapsed');

			if (window.innerWidth <= 768) {
				sidebar?.classList.remove('show');
			}
		}

		function loadTemplateVariables() {
			const savedVars = localStorage.getItem('templateVariables');
			if (!savedVars) return;

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

		return { saveContent, loadContent, loadTemplateVariables };
	}

	window.Persistence = { createPersistence };
})();


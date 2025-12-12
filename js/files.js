// File operations: upload/drag-drop, export, copy.
(function () {
	function createFiles({
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
	}) {
		function handleFileUpload(e) {
			const file = e.target.files[0];
			if (!file) return;
			processFile(file);
			fileInput.value = '';
		}

		function processFile(file) {
			const validExtensions = ['.md', '.txt', '.markdown'];
			const fileName = file.name.toLowerCase();
			const isValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

			const validTypes = ['text/markdown', 'text/plain', ''];
			const isValidType = validTypes.includes(file.type);

			if (!isValidExtension || (!isValidType && file.type !== '')) {
				showModal?.({
					title: 'Invalid File',
					message: 'Please select a valid markdown or text file (.md, .txt, .markdown)',
					type: 'error'
				});
				return;
			}

			const reader = new FileReader();
			reader.onload = (evt) => {
				editor.value = evt.target.result;
				handleEditorInput();

				const analysis = analyzeDocument?.() || {};
				const foundCount = Object.values(analysis).filter(Boolean).length;
				const totalCount = Object.keys(analysis).length || 0;

				if (foundCount > 0) {
					showToast?.(`Document loaded! Found ${foundCount}/${totalCount} sections.`, 5000);
				} else {
					showToast?.('Document loaded! Use Templates to add standard sections.', 4000);
				}
			};
			reader.onerror = () => {
				showModal?.({
					title: 'Read Error',
					message: 'Error reading file. Please try again.',
					type: 'error'
				});
			};
			reader.readAsText(file);
		}

		function setupDragAndDrop() {
			let dragCounter = 0;

			['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
				document.body.addEventListener(eventName, preventDefaults, false);
			});

			function preventDefaults(e) {
				e.preventDefault();
				e.stopPropagation();
			}

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

			editorPane.addEventListener('dragleave', (e) => {
				preventDefaults(e);
				dragCounter--;
				if (dragCounter === 0) {
					dropZone.classList.remove('active');
				}
			});

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

		function exportMarkdown() {
			const content = editor.value;
			if (!content.trim()) {
				showModal?.({
					title: 'Nothing to Export',
					message: 'Please write some markdown first.',
					type: 'info'
				});
				return;
			}

			let filename = 'document.md';
			const h1Match = content.match(/^#\s+(.+)$/m);

			if (h1Match && h1Match[1]) {
				filename = h1Match[1]
					.toLowerCase()
					.replace(/[^a-z0-9\s-]/g, '')
					.replace(/\s+/g, '-')
					.replace(/-+/g, '-')
					.replace(/^-|-$/g, '') + '.md';
			} else {
				const now = new Date();
				filename = `markdown-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.md`;
			}

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

		async function copyMarkdown() {
			const content = editor.value;
			if (!content.trim()) {
				showModal?.({
					title: 'Nothing to Copy',
					message: 'Please write some markdown first.',
					type: 'info'
				});
				return;
			}

			try {
				await navigator.clipboard.writeText(content);

				if (copyMarkdownBtn) {
					const original = copyMarkdownBtn.dataset.copyOriginalHtml || copyMarkdownBtn.innerHTML;
					copyMarkdownBtn.dataset.copyOriginalHtml = original;
					copyMarkdownBtn.innerHTML = `
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="20 6 9 17 4 12"></polyline>
						</svg>
						Copied!
					`;
					copyMarkdownBtn.style.borderColor = 'var(--accent-primary)';
					copyMarkdownBtn.style.color = 'var(--accent-light)';

					setTimeout(() => {
						copyMarkdownBtn.innerHTML = original;
						copyMarkdownBtn.style.borderColor = '';
						copyMarkdownBtn.style.color = '';
					}, 2000);
				}

				showToast?.('Markdown copied to clipboard!', 2000);
			} catch (error) {
				showModal?.({
					title: 'Copy Failed',
					message: 'Failed to copy to clipboard. Please try again.',
					type: 'error'
				});
			}
		}

		function attachListeners() {
			if (uploadBtn && fileInput) {
				uploadBtn.addEventListener('click', () => fileInput.click());
				fileInput.addEventListener('change', handleFileUpload);
			}
			if (copyMarkdownBtn) {
				copyMarkdownBtn.addEventListener('click', copyMarkdown);
			}
		}

		return {
			attachListeners,
			setupDragAndDrop,
			exportMarkdown,
			copyMarkdown
		};
	}

	window.Files = { createFiles };
})();

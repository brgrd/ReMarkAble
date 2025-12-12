// Formatting and prettify logic for the editor.
// Exposes a small controller that relies on injected dependencies.
(function () {
	function createFormatting({
		editor,
		editorState,
		saveToHistory,
		handleEditorInput,
		showUndoToast,
		hideUndoToast
	}) {
		function applyFormatting(format) {
			if (!editor) return;

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
				case 'highlight':
					replacement = `==${selectedText || 'highlight'}==`;
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
				case 'image':
					replacement = `![${selectedText || 'alt text'}](url)`;
					cursorOffset = selectedText ? replacement.length - 4 : 2;
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
				case 'h4':
					replacement = `#### ${selectedText || 'Heading 4'}`;
					cursorOffset = replacement.length;
					break;
				case 'h5':
					replacement = `##### ${selectedText || 'Heading 5'}`;
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
				case 'footnote': {
					const marker = '[^1]';
					replacement = selectedText ? `${selectedText}${marker}` : marker;
					cursorOffset = replacement.length;
					break;
				}
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

			const newContent = currentContent.substring(0, start) + replacement + currentContent.substring(end);
			editor.value = newContent;

			const newCursorPos = start + cursorOffset;
			editor.setSelectionRange(newCursorPos, newCursorPos);
			editor.focus();

			handleEditorInput();

			saveToHistory();
		}

		function prettifyMarkdown() {
			if (!editor) return;
			const content = editor.value;
			if (!content.trim()) return;

			editorState.prettifySnapshot = content;
			let prettified = content.replace(/\r\n/g, '\n');

			prettified = prettified.replace(/([^\n])\n(#{1,6} .+)/g, '$1\n\n$2');
			prettified = prettified.replace(/(#{1,6} .+)\n([^\n#])/g, '$1\n\n$2');

			prettified = prettified.replace(/^[ \t]*[-*+] /gm, '- ');
			prettified = prettified.replace(/^[ \t]*(\d+)\. /gm, '$1. ');

			prettified = prettified.replace(/[ \t]+$/gm, '');
			prettified = prettified.replace(/\n{3,}/g, '\n\n');
			prettified = prettified.replace(/\n*$/, '\n');

			editor.value = prettified;
			handleEditorInput();

			showUndoToast();
		}

		function undoPrettify() {
			if (!editor || !editorState.prettifySnapshot) return;
			editor.value = editorState.prettifySnapshot;
			handleEditorInput();
			hideUndoToast();
			editorState.prettifySnapshot = null;
		}

		return { applyFormatting, prettifyMarkdown, undoPrettify };
	}

	window.Formatting = { createFormatting };
})();

// Find & Replace controller.
// Owns match state and attaches event listeners.
(function () {
	function escapeRegex(text) {
		return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	function createFindReplace({
		editor,
		findInput,
		replaceInput,
		caseSensitive,
		wholeWord,
		statusEl,
		panelEl
	}) {
		let matches = [];
		let currentIndex = -1;

		function setStatus(message, variant) {
			if (!statusEl) return;
			statusEl.textContent = message;
			statusEl.className = `find-replace-status${variant ? ` ${variant}` : ''}`;
		}

		function clearSelection() {
			if (!editor) return;
			if (editor.selectionStart !== editor.selectionEnd) {
				editor.setSelectionRange(editor.selectionStart, editor.selectionStart);
			}
		}

		function buildRegex(searchText) {
			let pattern = escapeRegex(searchText);
			if (wholeWord?.checked) {
				pattern = `\\b${pattern}\\b`;
			}
			const flags = caseSensitive?.checked ? 'g' : 'gi';
			return new RegExp(pattern, flags);
		}

		function refreshMatches(searchText) {
			matches = [];
			currentIndex = -1;

			if (!editor || !searchText) return;

			const regex = buildRegex(searchText);
			let match;
			while ((match = regex.exec(editor.value)) !== null) {
				matches.push({ index: match.index, length: match[0].length });
			}
		}

		function selectMatch(index) {
			if (!editor || index < 0 || index >= matches.length) return;
			const match = matches[index];
			editor.focus();
			editor.setSelectionRange(match.index, match.index + match.length);
			editor.scrollTop = editor.scrollHeight * (match.index / editor.value.length);
			setStatus(`Match ${index + 1} of ${matches.length}`, 'success');
		}

		function find(direction = 'next') {
			const searchText = findInput?.value ?? '';
			if (!searchText) {
				setStatus('Enter text to find', 'error');
				return;
			}

			refreshMatches(searchText);
			if (matches.length === 0) {
				setStatus('No matches found', 'error');
				return;
			}

			if (direction === 'next') {
				currentIndex = (currentIndex + 1) % matches.length;
			} else {
				currentIndex = currentIndex <= 0 ? matches.length - 1 : currentIndex - 1;
			}

			selectMatch(currentIndex);
		}

		function replaceCurrent() {
			if (!editor) return;
			if (currentIndex < 0 || currentIndex >= matches.length) {
				setStatus('No match selected', 'error');
				return;
			}

			const replaceText = replaceInput?.value ?? '';
			const match = matches[currentIndex];
			const content = editor.value;

			const newContent = content.substring(0, match.index) +
				replaceText +
				content.substring(match.index + match.length);

			editor.value = newContent;

			// Rebuild matches and keep selection on same logical index.
			const lengthDiff = replaceText.length - match.length;
			matches.splice(currentIndex, 1);
			for (let i = currentIndex; i < matches.length; i++) {
				matches[i].index += lengthDiff;
			}

			if (matches.length === 0) {
				setStatus('All matches replaced', 'success');
				currentIndex = -1;
				clearSelection();
				return;
			}

			if (currentIndex >= matches.length) currentIndex = 0;
			selectMatch(currentIndex);
		}

		function replaceAll() {
			if (!editor) return;
			const searchText = findInput?.value ?? '';
			const replaceText = replaceInput?.value ?? '';

			if (!searchText) {
				setStatus('Enter text to find', 'error');
				return;
			}

			const regex = buildRegex(searchText);
			const matchesFound = editor.value.match(regex);
			if (!matchesFound || matchesFound.length === 0) {
				setStatus('No matches found', 'error');
				return;
			}

			editor.value = editor.value.replace(regex, replaceText);
			setStatus(`Replaced ${matchesFound.length} occurrence${matchesFound.length > 1 ? 's' : ''}`, 'success');
			matches = [];
			currentIndex = -1;
			clearSelection();
		}

		function open() {
			setStatus('', '');
			matches = [];
			currentIndex = -1;
			if (panelEl) {
				panelEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
			setTimeout(() => findInput?.focus(), 50);
		}

		function clear() {
			if (findInput) findInput.value = '';
			if (replaceInput) replaceInput.value = '';
			setStatus('', '');
			matches = [];
			currentIndex = -1;
			clearSelection();
		}

		function attachListeners() {
			findInput?.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') find('next');
			});
			replaceInput?.addEventListener('keypress', (e) => {
				if (e.key === 'Enter') replaceCurrent();
			});
		}

		attachListeners();

		return {
			open,
			clear,
			findNext: () => find('next'),
			findPrev: () => find('prev'),
			replaceCurrent,
			replaceAll
		};
	}

	window.FindReplace = { createFindReplace };
})();


// Markdown validation helpers.
// Pure functions only; no DOM access here.
(function () {
	function validateMarkdownContent(content) {
		const lines = content.split('\n');
		const issues = [];
		let inBacktickFence = false;
		let backtickFenceLine = null;
		let inTildeFence = false;
		let tildeFenceLine = null;

		const listMarkerPattern = /^[ \t]*(?:\*(?!\*)|\+(?!\+)|-(?!-))/;

		lines.forEach((line, index) => {
			const lineNumber = index + 1;
			const trimmed = line.trim();
			const normalizedLine = line.replace(/^\s+/, '');
			const isBacktickFence = trimmed.startsWith('```');
			const isTildeFence = trimmed.startsWith('~~~');

			if (isBacktickFence && !inTildeFence) {
				if (!inBacktickFence) {
					inBacktickFence = true;
					backtickFenceLine = lineNumber;
				} else {
					inBacktickFence = false;
					backtickFenceLine = null;
				}
				return;
			}

			if (isTildeFence && !inBacktickFence) {
				if (!inTildeFence) {
					inTildeFence = true;
					tildeFenceLine = lineNumber;
				} else {
					inTildeFence = false;
					tildeFenceLine = null;
				}
				return;
			}

			if (inBacktickFence || inTildeFence) return;

			if (/^#{1,6}/.test(normalizedLine) && !/^#{1,6}\s/.test(normalizedLine)) {
				issues.push({ line: lineNumber, message: 'Add a space after the # characters in headings.' });
			}

			const listMarkerMatch = line.match(listMarkerPattern);
			if (listMarkerMatch) {
				const remainder = line.slice(listMarkerMatch[0].length);
				const hasContent = remainder.trim().length > 0;
				if (hasContent && !/^\s/.test(remainder)) {
					issues.push({ line: lineNumber, message: 'List markers (-, *, +) need a space before the text.' });
				}
			}

			const numberedListMatch = line.match(/^[ \t]*\d+\./);
			if (numberedListMatch) {
				const remainder = line.slice(numberedListMatch[0].length);
				const hasContent = remainder.trim().length > 0;
				if (hasContent && !/^\s/.test(remainder)) {
					issues.push({ line: lineNumber, message: 'Numbered lists need a space after the period.' });
				}
			}

			if (/^[ \t]*>/.test(normalizedLine) && !/^[ \t]*>\s/.test(normalizedLine)) {
				issues.push({ line: lineNumber, message: 'Add a space after the blockquote (>) marker.' });
			}

			if (/^[ \t]*-\s\[[ xX]\]/.test(line) && !/^[ \t]*-\s\[[ xX]\]\s/.test(line)) {
				issues.push({ line: lineNumber, message: 'Add a space after task list checkboxes.' });
			}

			if (/^\t+/.test(line)) {
				issues.push({ line: lineNumber, message: 'Replace leading tabs with spaces for consistent rendering.' });
			}

			const trailingWhitespace = line.match(/[ \t]+$/);
			if (trailingWhitespace && trailingWhitespace[0].length > 2) {
				issues.push({ line: lineNumber, message: 'Remove trailing spaces at the end of the line.' });
			}

			if (/\[[^\]]+\]\(\s*\)/.test(line)) {
				issues.push({ line: lineNumber, message: 'Links should contain a destination URL.' });
			}
		});

		if (inBacktickFence) {
			issues.push({ line: backtickFenceLine, message: 'Code fence opened with ``` is not closed.' });
		}

		if (inTildeFence) {
			issues.push({ line: tildeFenceLine, message: 'Code fence opened with ~~~ is not closed.' });
		}

		return issues;
	}

	window.Validation = { validateMarkdownContent };
})();


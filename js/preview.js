// Preview rendering, word count, and scroll sync.
(function () {
	function createPreview({
		editor,
		previewEl,
		wordCountEl,
		parseMarkdown,
		debounce
	}) {
		function updateWordCount(content) {
			if (!wordCountEl) return;
			const text = content.trim();
			const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
			const chars = content.length;
			const lines = content.split('\n').length;

			wordCountEl.innerHTML = `
				<span class="count-item"><strong>${words}</strong> words</span>
				<span class="count-separator">•</span>
				<span class="count-item"><strong>${chars}</strong> chars</span>
				<span class="count-separator">•</span>
				<span class="count-item"><strong>${lines}</strong> lines</span>
			`;
		}

		function render() {
			const content = editor.value;
			updateWordCount(content);

			if (!content.trim()) {
				previewEl.innerHTML = '<div class="preview-placeholder"><p>Your formatted markdown will appear here...</p></div>';
				return;
			}

			try {
				previewEl.innerHTML = parseMarkdown(content);
			} catch (error) {
				console.error('Markdown parsing error:', error);
				previewEl.innerHTML = '<div class="preview-placeholder"><p style="color: #ff6b6b;">Error parsing markdown</p></div>';
			}
		}

		const debouncedRender = debounce(render, 300);

		function updatePreview() {
			debouncedRender();
		}

		function syncScroll() {
			if (window.innerWidth <= 1024) return;
			const previewContent = document.querySelector('.preview-content');
			if (!previewContent) return;

			const editorScrollPercent = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
			const previewScrollTarget = editorScrollPercent * (previewContent.scrollHeight - previewContent.clientHeight);
			previewContent.scrollTop = previewScrollTarget;
		}

		return { updatePreview, syncScroll, updateWordCount };
	}

	window.Preview = { createPreview };
})();


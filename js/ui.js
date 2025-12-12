// UI helpers: custom modal and toast notifications.
(function () {
	function createUI({
		editorState,
		customModal,
		modalIcon,
		modalTitle,
		modalMessage,
		modalConfirm,
		modalCancel,
		undoToast,
		undoBtn
	}) {
		function showModal({ title, message = '', type = 'info', confirmText = 'OK', cancelText = 'Cancel', showCancel = false, danger = false }) {
			return new Promise((resolve) => {
				editorState.modalResolve = resolve;

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

				if (showCancel) {
					customModal.classList.remove('alert-only');
				} else {
					customModal.classList.add('alert-only');
				}

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

		function setupModalListeners() {
			modalConfirm.addEventListener('click', () => hideModal(true));
			modalCancel.addEventListener('click', () => hideModal(false));
			customModal.addEventListener('click', (e) => {
				if (e.target === customModal) {
					hideModal(false);
				}
			});
		}

		function showToast(message, duration = 3000) {
			const toastMessage = undoToast.querySelector('span');
			const undoButton = undoToast.querySelector('#undoBtn');

			undoButton.style.display = 'none';
			toastMessage.textContent = message;

			clearTimeout(editorState.undoTimeout);
			undoToast.classList.add('show');

			editorState.undoTimeout = setTimeout(() => {
				hideUndoToast();
			}, duration);
		}

		function showUndoToast() {
			const toastMessage = undoToast.querySelector('span');

			undoBtn.style.display = 'inline-block';
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

		return { showModal, setupModalListeners, showToast, showUndoToast, hideUndoToast };
	}

	window.UI = { createUI };
})();


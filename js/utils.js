// Shared utility helpers.
(function () {
	function debounce(fn, delayMs) {
		let timeoutId;
		return function debounced(...args) {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => fn.apply(this, args), delayMs);
		};
	}

	window.Utils = { debounce };
})();


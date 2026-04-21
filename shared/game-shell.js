(function () {
	function removeGenericGameLabels(root) {
		const scope = root || document;

		scope.querySelectorAll('h2, h3').forEach((heading) => {
			const text = String(heading.textContent || '').trim().toLowerCase();
			if (text === 'game surface') {
				heading.remove();
			}
		});

		scope.querySelectorAll('.round-strip span').forEach((label) => {
			const text = String(label.textContent || '').trim().toLowerCase();
			if (text === 'round status') {
				label.remove();
			}
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => removeGenericGameLabels(document));
	} else {
		removeGenericGameLabels(document);
	}
})();
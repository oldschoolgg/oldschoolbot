let copyTimeout;
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', function (e) {
        const btn = e.target.closest('.discord_command_copy');
        if (!btn) return;
        const command = btn.getAttribute('data-command');
        if (!command) return;

        // Store original text if not already stored - else double clicking will override original text
        if (!btn.hasAttribute('data-original-text')) {
            btn.setAttribute('data-original-text', btn.textContent);
        }
        const original = btn.getAttribute('data-original-text');

        navigator.clipboard.writeText(command).then(() => {
            btn.classList.add('copied');
            btn.textContent = 'Copied!';
            if (btn.copyTimeout) clearTimeout(btn.copyTimeout);
            btn.copyTimeout = setTimeout(() => {
                btn.classList.remove('copied');
                btn.textContent = original;
                btn.copyTimeout = null;
            }, 1200);
        }).catch(() => {
            btn.classList.add('copied');
            btn.textContent = 'Failed to copy!';
            if (btn.copyTimeout) clearTimeout(btn.copyTimeout);
            btn.copyTimeout = setTimeout(() => {
                btn.classList.remove('copied');
                btn.textContent = original;
                btn.copyTimeout = null;
            }, 2000);
        });
    });
});
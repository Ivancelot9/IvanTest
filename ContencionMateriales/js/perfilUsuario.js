document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById('userDropdownToggle');
    const panel = document.getElementById('userDropdownPanel');

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target)) {
            panel.style.display = 'none';
        }
    });
});
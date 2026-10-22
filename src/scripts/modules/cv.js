// "Hire me" shows the CV in a viewer on desktop. Phones and tablets can't reliably
// render a PDF inside the page, so there the link keeps its default: a new tab.
const canEmbedPdf = () => window.matchMedia('(min-width: 769px) and (pointer: fine)').matches;

export function setupCv() {
    const link = document.querySelector('[data-cv]');
    const dialog = document.getElementById('cvDialog');
    if (!link || !dialog) return;
    const frame = dialog.querySelector('iframe');

    link.addEventListener('click', (e) => {
        if (!canEmbedPdf()) return;
        e.preventDefault();
        // Load the PDF on first open, not with every page
        if (!frame.getAttribute('src')) frame.src = frame.dataset.src;
        dialog.showModal();
    });

    dialog.querySelector('[data-cv-close]')?.addEventListener('click', () => dialog.close());
    // A click on the backdrop lands on the dialog element itself
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
    });
}

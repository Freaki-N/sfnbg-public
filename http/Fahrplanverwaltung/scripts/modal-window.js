var modalWindow = undefined;

function oeffneModal(elemModalWindow) {
    modalWindow = elemModalWindow
    modalWindow.style.display = 'flex';
}

function schliesseModal() {
    if(modalWindow == undefined)
        return;

    modalWindow.style.display = 'none';
}

function oeffnePatchnotes() {
    const patchnotesModal = document.getElementById('patchnotesModal');
    if (!patchnotesModal) {
        console.error('Das Patchnotes-Fenster wurde nicht gefunden.');
        return false;
    }

    oeffneModal(patchnotesModal);
    return true;
}

function zeigePatchnotesBeimErstenAufruf() {
    const patchnotesVersion = '2026-10-10';
    const patchnotesSpeicherKey = 'fahrplanverwaltung-patchnotes-version';

    try {
        if (localStorage.getItem(patchnotesSpeicherKey) === patchnotesVersion) {
            return;
        }
    } catch (error) {
        console.error('Der Patchnotes-Status konnte nicht gelesen werden:', error);
    }

    if (!oeffnePatchnotes()) {
        return;
    }

    try {
        localStorage.setItem(patchnotesSpeicherKey, patchnotesVersion);
    } catch (error) {
        console.error('Der Patchnotes-Status konnte nicht gespeichert werden:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', zeigePatchnotesBeimErstenAufruf, { once: true });
} else {
    zeigePatchnotesBeimErstenAufruf();
}
var modalWindow = undefined;
const patchnotesSpeicherKey = 'fahrplanverwaltung-patchnotes-dismissed-version';

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
    const patchnotesModal = document.getElementById('patchnotesModal');
    if (!patchnotesModal) {
        console.error('Das Patchnotes-Fenster wurde nicht gefunden.');
        return;
    }

    const patchnotesVersion = patchnotesModal.dataset.version;
    if (!patchnotesVersion) {
        console.error('Die Patchnotes-Version wurde nicht festgelegt.');
        return;
    }

    try {
        if (localStorage.getItem(patchnotesSpeicherKey) === patchnotesVersion) {
            return;
        }
    } catch (error) {
        console.error('Der Patchnotes-Status konnte nicht gelesen werden:', error);
    }

    oeffneModal(patchnotesModal);
}

function patchnotesNichtMehrAnzeigen() {
    const patchnotesModal = document.getElementById('patchnotesModal');
    if (!patchnotesModal) {
        console.error('Das Patchnotes-Fenster wurde nicht gefunden.');
        return;
    }

    const patchnotesVersion = patchnotesModal.dataset.version;
    if (!patchnotesVersion) {
        console.error('Die Patchnotes-Version wurde nicht festgelegt.');
        return;
    }

    try {
        localStorage.setItem(patchnotesSpeicherKey, patchnotesVersion);
    } catch (error) {
        console.error('Der Patchnotes-Status konnte nicht gespeichert werden:', error);
        return;
    }

    schliesseModal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', zeigePatchnotesBeimErstenAufruf, { once: true });
} else {
    zeigePatchnotesBeimErstenAufruf();
}
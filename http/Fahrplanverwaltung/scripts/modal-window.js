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
KeyCodes = {}
KeyCodes.ESC = 27;
KeyCodes.DEL = 46;
KeyCodes.F2 = 113;
KeyCodes.UP = 38;
KeyCodes.DOWN = 40;
KeyCodes.RIGHT = 39;
KeyCodes.LEFT = 37;
KeyCodes.SPACE = 32;
KeyCodes.T = 84;

window.addEventListener("keyup", e => {
	if (e.altKey) {
		if (e.keyCode == KeyCodes.T) {
			window.sidepanel.toggle();
		}
	}

	if (window.selectedItem !== null) {
		if (e.keyCode == KeyCodes.ESC) {
			window.selectedItem.deselect();
		}

		if (e.keyCode == KeyCodes.DEL) {
			window.selectedItem.del();
		}

		if (e.keyCode == KeyCodes.F2) {
				window.selectedItem.rename();
		}

		if (e.keyCode == KeyCodes.DOWN) {
			selectByOffset(+1);
		}

		if (e.keyCode == KeyCodes.UP) {
			selectByOffset(-1);
		}

		if (e.keyCode == KeyCodes.RIGHT) {
			window.selectedItem.setSubtasksVisible(true);
		}

		if (e.keyCode == KeyCodes.LEFT) {
			window.selectedItem.setSubtasksVisible(false);
		}

		if (e.keyCode == KeyCodes.SPACE) {
			if (document.activeElement.type != "text") {
				window.selectedItem.toggleSubtasks();
			}
		}
	}

	if (window.currentMenu != null) {
		if (e.keyCode == 27) {
			window.currentMenu.hide();
		}
	}

});

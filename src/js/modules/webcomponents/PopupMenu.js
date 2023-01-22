/**
class Point {
	constructor() {
		this.x = 0;
		this.y = 0;
	}
}
*/

export class PopupMenu extends HTMLElement {
	setFields(title) {
		this.title = title;
		this.domItems = document.createElement("ul");
		this.domItems.hidden = true;
		this.domItems.classList.add("popupMenu")
		this.owner = null;
	}

	addItem(text, callback, accesskey = null, indicator = null) {
		let li = document.createElement("li");
		let a = document.createElement("a");
		a.setAttribute("href", "#")

		if (accesskey != null) {
			a.setAttribute("accesskey", accesskey);
		}

		a.innerText = text
		a.onclick = callback;
		li.appendChild(a);
		li.classList.add("menuItem");

		if (indicator != null) {
			li.appendChild(indicator)
		}

		this.domItems.appendChild(li);
	}

	addTo(owner) {
		if (typeof(owner) == "string") {
			owner = document.querySelector(owner);
		}

		if (typeof(this.domItems) == "undefined") {
			this.setFields("untitled Menu")
		}

		this.setOwner(owner);

		owner.appendChild(this.domItems);
		owner.classList.add('popupMenuButton');

		let clickCallback = (e) => {
			e.preventDefault();
			e.stopPropagation();

			if (this.isShown()) {
				this.hide();
			} else {
				this.show();
			}

			this.reposition(e);

			return false;
		};

		owner.addEventListener('click', clickCallback);
		//owner.attr('oncontextmenu', 'return false;');
	}

	setOwner(owner) {
		this.owner = owner;

		if (this.owner.getAttribute('id') != '') {
			this.domItems.setAttribute('title', 'Menu for #' + owner.getAttribute('id'))
		}
	}

	findBestMenuPosition(menuButtonRect) {
		let menuRect = new DOMRect();
		menuRect.width = this.domItems.offsetWidth;
		menuRect.height = this.domItems.offsetHeight; 

		// First, try positioning the menu right under the button
		menuRect.x = 0;
		menuRect.y = menuButtonRect.height;

		if (this.isBoxInsideView(menuButtonRect, menuRect)) {
			return menuRect; 
		}

		// Now try under the button, but aligned along the right edge
		menuRect.x = -(menuRect.width - menuButtonRect.width)

		if (this.isBoxInsideView(menuButtonRect, menuRect)) {
			return menuRect;
		}

		// Now try spawning it above the button (still aligned to right edge)
		menuRect.y = -menuRect.height;
		return menuRect
	}

	isBoxInsideView(menuButtonRect, menuRect) {
		let topLeftX = menuButtonRect.x + menuRect.x;
		let topLeftY = menuButtonRect.y + menuRect.y;

		let bottomRightX = topLeftX + menuRect.width;
		let bottomRightY = topLeftY + menuRect.height; 

		if (
			topLeftX > document.body.offsetWidth ||
			topLeftX < 0 ||
			topLeftY > document.body.offsetHeight ||
			topLeftY < 0 ||
			bottomRightX > document.body.offsetWidth ||
			bottomRightX < 0 ||
			bottomRightY > document.body.offsetHeight ||
			bottomRightY < 0
		) {
			return false;
		} else {
			return true;
		}
	}

	reposition(e) {
		let ownerTl = e.currentTarget.getBoundingClientRect();

		let menuTl = this.findBestMenuPosition(ownerTl)

		this.domItems.style.left = menuTl.x + "px";
		this.domItems.style.top = menuTl.y + "px";
	}

	isShown() {
		return !this.domItems.hidden;
	}

	show() {
		if (window.currentMenu != null) {
			window.currentMenu.hide();
		}

		this.domItems.hidden = false;
		this.owner.classList.add('hasMenu');

		window.currentMenu = this;
	}

	hide() {
		this.domItems.hidden = true;
		this.owner.classList.remove('hasMenu');
		window.currentMenu = null;
	}
}

window.customElements.define("popup-menu", PopupMenu)

window.currentMenu = null;

window.oncontextmenu = () => { return false; };

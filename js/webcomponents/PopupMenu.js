class Point {
	constructor() {
		this.x = 0;
		this.y = 0;
	}
}

export default class PopupMenu extends HTMLDivElement {
	setFields(title) {
		this.title = title;
		this.domItems = document.createElement("ul");
		this.domItems.hidden = true;
		this.domItems.classList.add("popupMenu")
		this.owner = null;
		this.dropDown = false;
	}

	addItem(text, callback) {
		let li = document.createElement("li");
		li.innerText = text
		li.onclick = callback;

		this.domItems.appendChild(li);
	}

	addTo(owner) {
		this.setOwner(owner);

		owner.appendChild(this.domItems);
		owner.classList.add('popupMenuButton');

		let clickCallback = (e) => {
			e.preventDefault();

			this.reposition(e);

			if (this.isShown()) {
				this.hide();
			} else {
				this.show();
			}

			return true;
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

	addAsRightClick(owner) {
		this.setOwner(owner);

		$(owner).after(this.domItems);

		owner.rightClick(function(e) {
			self.reposition(e);

			if (self.isShown()) {
				self.hide();
			} else {
				self.show();
			}
		});
	}

	positionAtEvent(e) {
		this.domItems.css('left', e.pageX);
		this.domItems.css('top',  e.pageY);
	}

	reposition(e) {
		if (this.dropDown) {	
			let currentTarget = e.currentTarget;
			let marginTop = parseInt(currentTarget.style.marginTop.replace("px", ""));
			let marginLeft = parseInt(currentTarget.style.marginLeft.replace("px", ""));
			let borderTop = parseInt(currentTarget.style.borderTop.replace("px", ""));
			let borderLeft = parseInt(currentTarget.style.borderLeft.replace("px", ""));

			let ownerTl = new Point();
			ownerTl.x = currentTarget.offsetLeft;
			ownerTl.y = currentTarget.offsetTop;

			let menuTl = new Point();
			menuTl.x = ownerTl.x;
			menuTl.y = ownerTl.y + currentTarget.height + marginTop + borderTop + marginTop;

			let dropDownTouchPoint = new Point();
			dropDownTouchPoint.x = menuTl.x + this.domItems.width;
			dropDownTouchPoint.y = menuTl.y + this.domItems.height;

			if (dropDownTouchPoint.y > document.body.height) {
				menuTl.y = ownerTl.y - this.domItems.height();
			}

			if (dropDownTouchPoint.x > document.body.height) {
				p = this.domItems.width() - currentTarget.width();
				p -= marginLeft;
				p -= marginLeft;
				menuTl.x = ownerTl.x - p; //(this.domItems.width() - currentTarget.width());
			}

			this.domItems.style.left = menuTl.x;
			this.domItems.style.top = menuTl.y;
		} else {
			this.positionAtEvent(e);
		}
	}

	addMouseMove(owner) {
		this.setOwner(owner);

		$(owner).after(this.domItems);

		owner.mousemove(function(e) {
			self.show();
			self.domItems.css('left', e.pageX);
			self.domItems.css('top', e.pageY);
		});

		owner.mouseout(function() {
			self.hide();
		});
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

document.registerElement("popup-menu", PopupMenu);

document.body.addEventListener('click', (e) => {
	if (window.currentMenu != null) {
		if (e.target.parent == window.currentMenu.owner) {
			return false;
		}
		
//		window.currentMenu.hide();
	}
});

window.oncontextmenu = () => { return false; };

function Point() {
	this.x = 0;
	this.y = 0;
}

function Menu() {
	var self = this;

	this.domItems = $('<ul class = "dropDownMenu" style = "display: none" />');
	this.owner = null;
	this.dropDown = false;

	Menu.prototype.addItem = function(text, callback) {
		this.domItems.createAppend('<li class = "menuItem" />').text(text).click(function() {
			self.hide();
			callback();	
		});
	};

	Menu.prototype.addTo = function(owner) {
		this.setOwner(owner);

		$('body').after(this.domItems);
		owner.css('cursor', 'pointer');

		owner.click(function(e) {
			self.reposition(e);

			if (self.isShown()) {
				self.hide();
			} else {
				self.show();
			}
		});

		//.children().click(function() { return false});
	};

	Menu.prototype.setOwner = function(owner) {
		this.owner = owner;

		if (owner.attr('id') != '') {
			this.domItems.attr('title', 'Menu for #' + owner.attr('id'))
		}
	}

	Menu.prototype.addAsRightClick = function(owner) {
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
	};

	Menu.prototype.positionAtEvent = function(e) {
		this.domItems.css('left', e.pageX);
		this.domItems.css('top',  e.pageY);
	};

	Menu.prototype.reposition = function(e) {
		if (this.dropDown) {	
			currentTarget = $(e.currentTarget);
			marginTop = parseInt(currentTarget.css('margin-top').replace("px", ""));
			marginLeft = parseInt(currentTarget.css('margin-left').replace("px", ""));
			borderTop = parseInt(currentTarget.css('border-top').replace("px", ""));
			borderLeft = parseInt(currentTarget.css('border-left').replace("px", ""));

			ownerTl = new Point();
			ownerTl.x = currentTarget.offset().left;
			ownerTl.y = currentTarget.offset().top;

			menuTl = new Point();
			menuTl.x = ownerTl.x;
			menuTl.y = ownerTl.y + currentTarget.height() + marginTop + borderTop + marginTop;

			dropDownTouchPoint = new Point();
			dropDownTouchPoint.x = menuTl.x + this.domItems.width();
			dropDownTouchPoint.y = menuTl.y + this.domItems.height();

			if (dropDownTouchPoint.y > $('html').height()) {
				menuTl.y = ownerTl.y - this.domItems.height();
			}

			if (dropDownTouchPoint.x > $('html').width()) {
				p = this.domItems.width() - currentTarget.width();
				p -= marginLeft;
				p -= marginLeft;
				menuTl.x = ownerTl.x - p; //(this.domItems.width() - currentTarget.width());
			}

			this.domItems.css('left', menuTl.x);
			this.domItems.css('top', menuTl.y);
		} else {
			this.positionAtEvent(e);
		}
	};

	Menu.prototype.addMouseMove = function(owner) {
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
	};

	Menu.prototype.isShown = function() {
		return this.domItems.css('display') != "none";
	};

	Menu.prototype.show = function() {
		this.domItems.show();
		this.owner.addClass('hasMenu');

		window.currentMenu = self;
	};

	Menu.prototype.hide = function() {
		this.domItems.hide();
		this.owner.removeClass('hasMenu');
		window.currentMenu = null;
	};

	return this;
}



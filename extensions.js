$.fn.disable = function() {
	return $(this).attr('disabled', 'disabled');
}

$.fn.enable = function() {
	return $(this).removeAttr('disabled');
}

$.fn.rightClick = function(callback) {
	$(this).on("contextmenu", function(e) {
		if (e.which == 3) {
			callback(e);
			e.preventDefault();
		}
	});
};

$.fn.onEnter = function(callback) {
	el = this;

	this.keyup(function(e) {
		if (e.keyCode == 13) {
			callback($(el));
		}
	});
};

$.fn.replaceWithRet = function(newEl) {
	this.replaceWith(newEl);

	return $(newEl);
};

$.fn.createAppend = function(constructor) {
	var childElement = $(constructor);

	$(this).append(childElement);

	return $(childElement);
};

$.fn.model = function() {
	if (typeof(this.data('model')) == "undefined") {
		this.data('model', {});
	}

	return this.data('model');
};



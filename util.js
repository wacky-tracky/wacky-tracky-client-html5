window.host = "http://" + window.location.hostname + ":8082/";

HTMLElement.prototype.onEnter = function(callback) {
	this.addEventListener("keydown", function(e) {
		if (e.keyCode == 13) {
			callback()
		}
	});
}

function registerSuccess() {
	notification('good', 'Thanks for registering, you can now login!');

	window.loginForm.hideRegistration();
	window.content.remove();
}

function tryRegister(username, password, email) {
	hashedPassword = CryptoJS.SHA1(password).toString();

	ajaxRequest({
		url: 'register',
		error: registerFail,
		success: registerSuccess,
		data: {
			username: username,
			password: hashedPassword,
			email: email,
		}
	});
}

function registerFail(req, dat) {
	clearValidationFailures();

	if (typeof(req.responseJSON.uniqueType) != "undefined") {
		switch(req.responseJSON.uniqueType) {
			case "username-too-short":
				highlightValidationFailure("#username", "Your username is too short.");
				return
			case "username-already-exists": 
				highlightValidationFailure("#username", "Your username has been taken.");
				return
			case "username-invalid": 
				highlightValidationFailure("#username", "Your username has some odd characters.");
				return

		}
	}

	generalErrorJson("Register fail. ", req, dat)
}

function generalErrorJson(msg, res) {
	msg = "General JSON Error.";

	generalError(msg);
}

function newTask(text) {
	if (text == "") {
		return;
	}

	window.content.taskInput.clear();

	data = { content: text };

	if (window.selectedItem === null) {
		data.parentId = window.content.list.fields.id;
		data.parentType = 'list';
	} else {
		data.parentId = window.selectedItem.fields.id;
		data.parentType = 'task';
	}

	ajaxRequest({
		url: 'createTask',
		success: window.uimanager.renderTaskCreated,
		data: data
	});
}

function generalError(error) {
	console.log("generalError() = ", error);
	console.log("generalError() stack: ", new Error().stack);

	if (error.status == 403 && error.responseJSON.message == "Login required.") {
		logoutSuccess("expired");
	} else if (error.status == 500) {
		error = "Internal Server Error.";
	} else if (error.statusText == "error") {
		error = "Critical, unspecified client side error."
	} else if (typeof(error.responseJSON) != "undefined" && typeof(error.responseJSON.message) != "undefined") {
		error = error.responseJSON.message
	} else if (typeof(error) == "object") {
		error = error.toString()
	}

	notification('error', 'Error: ' + error);
}

function notification(cls, text) {
	let notification = document.createElement("div");
	notification.classList += cls + " notification";
	notification.textContent = text;
	notification.addEventListener("click", notification.remove);

	document.body.appendChild(notification);
}

function hideAllErrors() {
	document.querySelectorAll('.notification').forEach(e => e.remove());
}

function selectByOffset(offset, currentItem) {
	if (currentItem == null) {
		if (window.selectedItem == null) {
			return;
		} else {
			currentItem = window.selectedItem;
		}
	}

	console.log("ci", currentItem);

	if (currentItem.parent instanceof Task) {
		parentTask = currentItem.parent;

		currentOffset = parentTask.subtasks.indexOf(currentItem);

		if (currentOffset != -1) {
			targetOffset = currentOffset + offset;
			targetTask = parentTask.subtasks[targetOffset];

			if (targetTask != null) {
				targetTask.select();
			} else if (targetOffset >= parentTask.subtasks.length) {
				console.log("foo");
				nextIndex = parentTask.subtasks.indexOf(currentItem) + 1
				selectByOffset(nextIndex, parentTask.parent)
			}
		}
	} else if (currentItem instanceof List) {
		parentList = currentItem;

		currentOffset = parentList.tasks.indexOf(currentItem);

		if (currentOffset != -1) {
			targetOffset = currentOffset + offset;
			targetTask = parentList.tasks[targetOffset];

			if (targetTask != null) {
				targetTask.select();
			}
		}
	}
}

function sidepanelResized() {
}

function logoutRequest() {
	ajaxRequest({
		url: "logout",
		success: logoutSuccess
	});
}

function logoutSuccess(reason) {
	if (reason == "expired") {
		window.alert("Your login session has expired. Please login again...")
	}

	location.reload();
}

function changePasswordSuccess() {
	notification('good', 'Your password has been changed!');
}

function promptChangePassword() {
	password1 = window.prompt("New password");
	password2 = window.prompt("Newpassword (again)");

	if (password1 == password2) {
		changePassword(password1);
	} else {
		generalError('Passwords do not match!');
	}
}

function changePassword(password) {
	hashedPassword = CryptoJS.SHA1(password).toString();

	ajaxRequest({
		url: 'changePassword',
		data: {
			'hashedPassword': hashedPassword
		},
		success: changePasswordSuccess
	});
}




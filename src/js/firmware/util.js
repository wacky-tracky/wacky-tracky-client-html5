window.host = "https://api.wacky-tracky.com/"

import { clearValidationFailures, highlightValidationFailure, ajaxRequest } from "./middleware.js"

HTMLElement.prototype.onEnter = function(callback) {
	this.addEventListener("keydown", function(e) {
		if (e.keyCode == 13) {
			callback()
		}
	});
}

export function isNarrowScreen() {
	return window.innerWidth < 1000;
}

export function registerSuccess() {
	notification('good', 'Thanks for registering, you can now login!');

	window.loginForm.hideRegistration();
	window.content.remove();
}

export function tryRegister(username, password, email) {
	hashPassword(password).then(hashedPassword => {
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
	});
}

export async function hashPassword(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder('utf-8').encode(message);                    

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');

	await hashHex;

    return hashHex;
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
	msg = "General JSON Error. " + res;

	generalError(msg);
}

export function newTask(text) {
	if (text == "") {
		return;
	}

	window.content.taskInput.clear();

	let data = { content: text };

	if (window.selectedItem === null) {
		data.parentId = window.content.list.list.getId();
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

export function notification(cls, text, callback = null) {
	if (text == null) {
		text = cls;
	}

	if (Notification.permission == "granted") { 
		createNativeNotification(cls, text, callback)
	} else {
		createHtmlNotification(cls, text, callback);
	} 
}

function createNativeNotification(cls, text, callback) {
	var options = {
		icon: "/wacky-tracky.75aacf35.png"
	};

	new Notification(text, options)
}

function createHtmlNotification(cls, text, callback) {
	let notification = document.createElement("div");
	notification.classList += cls + " notification";
	notification.textContent = text;

	if (callback == null) {
		notification.addEventListener("click", notification.remove);
	} else { 
		notification.addEventListener("click", () => { callback(notification) });
	}

	document.body.appendChild(notification);
}

export function hideAllErrors() {
	document.querySelectorAll('.notification').forEach(e => e.remove());
}

export function selectByOffset(offset, currentItem) {
	if (currentItem == null) {
		if (window.selectedItem == null) {
			return;
		} else {
			currentItem = window.selectedItem;
		}
	}

	if (typeof(currentItem.constructor.name) == "undefined") {
		return;
	}

	if (currentItem.constructor.name == "Task") {
		if (offset == 1) {
			if (currentItem.nextSibling != null) {
				currentItem.nextSibling.select();
			}
		} else if (offset == -1) {
			if (currentItem.previousSibling != null) {
				currentItem.previousSibling.select();
			}
		}
	} else if (currentItem.constructor.name == "List") {
		let parentList = currentItem;
		let currentOffset = parentList.tasks.indexOf(currentItem);

		if (currentOffset != -1) {
			let targetOffset = currentOffset + offset;
			let targetTask = parentList.tasks[targetOffset];

			if (targetTask != null) {
				targetTask.select();
			}
		}
	}
}

export function logoutRequest() {
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

export function promptChangePassword() {
	let password1 = window.prompt("New password");
	let password2 = window.prompt("Newpassword (again)");

	if (password1 == password2) {
		changePassword(password1);
	} else {
		generalError('Passwords do not match!');
	}
}

function changePassword(password) {
	hashPassword(password).then(hashedPassword => {
		ajaxRequest({
			url: 'changePassword',
			success: changePasswordSuccess,
			data: {
				hashedPassword: hashedPassword
			}
		});
	});
}

function closePopupMenus() {
	if (window.currentMenu != null) {
		window.currentMenu.hide();
	}
}

export function setBootMessage(message) {
	var container = document.querySelector("#bootMessage");
	
	if (container != null) {
		container.innerText = message + "...";
	}
}

export function setupDefaultContextMenuAction() {
	document.body.addEventListener('click', (e) => {
		if (window.currentMenu != null) {
			if (e.target.parent == window.currentMenu.owner) {
				return false;
			}
			
	//		window.currentMenu.hide();
		}
	});
}


document.addEventListener("click", () => {
	closePopupMenus()
});

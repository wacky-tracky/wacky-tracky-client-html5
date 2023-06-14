import { ajaxRequest } from "../../firmware/middleware.js"
import { 
	tryRegister, 
	hashPassword,
	generalErrorJson, 
} from "../../firmware/util.js"

import { 
	clearValidationFailures,
	highlightValidationFailure, 
} from "../../firmware/middleware.js"

export default class LoginForm extends HTMLElement {
	create() {
		this.appendChild(document.querySelector('#loginForm').content.cloneNode(true))
		document.body.appendChild(this);

		this.elUsername = this.querySelector('#username');
		this.elPassword = this.querySelector('#password')

		this.elPassword.onEnter(() => { this.tryLogin() });
	
		this.elEmail = this.querySelector('#email');

		this.elEmail.onEnter = () => {
			tryRegister(this.elUsernameInput.value, this.elPassword.value, this.elEmail.value);
		};

		this.elLoginButton = this.querySelector('button#login');
		this.elLoginButton.onclick = this.tryLogin.bind(this);
	}

	isShown() {
		return document.createElement('body').children('#loginForm').length > 0;
	}

	toggleRegistration() {
		if (!this.isShown()) {
			return;
		}

		if (this.isRegistrationShown()) {
			document.createElement('#emailRow').css('display', 'none');
			document.createElement('button#register').text('Register');
			document.createElement('button#forgotPassword').removeAttr('disabled');
			document.createElement('button#login').text('Login');
		} else {
			document.createElement('#emailRow').fadeIn();
			document.createElement('button#register').text('Cancel');
			document.createElement('button#forgotPassword').attr('disabled', 'disabled');
			document.createElement('button#login').text('Register');
		}
	}

	isRegistrationShown() {
		return document.createElement('#emailRow').css('display') == 'block';
	}

	hideRegistration() {
		if (this.isRegistrationShown()) {
			this.toggleRegistration();
		}

		document.createElement('input#password').focus();
		document.createElement('button#login').effect('highlight');
	}
	
	tryLogin() {
		let username = this.elUsername.value;
		let password = this.elPassword.value;

		hashPassword(password).then(hashedPassword => {
			ajaxRequest({
				url: 'authenticate',
				error: (val) => { this.loginFail(val); },
				success: this.loginSuccess,
				data: {
					username: username,
					password: hashedPassword,
				}
			});
		});

	}

	loginFail(res, dat) {
		console.log("loginFail this() = ", this, ":", res, dat);

		clearValidationFailures();

		this.displayLoginFailError(res)		
		this.enable();
	}

	displayLoginFailError(res) {
		if (typeof res == "object" && res.hasOwnProperty("uniqueType")) {
			switch (res.uniqueType) {
				case "user-not-found":
					highlightValidationFailure("#username", "Username not found");
					return;

				case "user-wrong-password":
					highlightValidationFailure("#password", "Incorrect pasword.");
					return
			}
		}

		generalErrorJson("Login Failure. ", res);
	}

	loginSuccess() {
		window.uimanager.loginSuccess();
	}

	show() {
		this.hidden = false;
	}

	hide() {
		this.hidden = true;
	}

	enable() {
		this.setEnabled(true)
	}

	disable() {
		this.setEnabled(false)
	}

	setEnabled(b) {
		b = !b

		this.elUsername.disabled = b;
		this.elPassword.disabled = b;
		this.querySelectorAll("button").forEach(btn => btn.disabled = b);
	}
}

window.customElements.define("login-form", LoginForm)

export default class LoginForm extends HTMLDivElement {
	create() {
		this.appendChild(document.querySelector('#loginForm').content.cloneNode(true))
		document.body.appendChild(this);

		this.elUsername = this.querySelector('#username');
		this.elPassword = this.querySelector('#password')

		this.elPassword.onEnter(() => { this.tryLogin() });
	
		this.elEmail = this.querySelector('#email');

		this.elEmail.onEnter = () => {
			tryRegister(usernameInput.val(), passwordInput.val(), emailInput.val());
		};

		this.elLoginButton = this.querySelector('button#login');
		this.elLoginButton.onclick = () => { this.tryLogin() } ;
	}

	isShown() {
		return document.createElement('body').children('#loginForm').length > 0;
	};

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
		console.log(this);
		let username = this.elUsername.value;
		let password = this.elPassword.value;

		let hashedPassword = CryptoJS.SHA1(password).toString();

		this.disable();

		ajaxRequest({
			url: 'authenticate',
			error: this.loginFail,
			success: this.loginSuccess,
			data: {
				username: username,
				password: hashedPassword,
			}
		});
	}

	loginFail(res, dat) {
		console.log(this);
		this.enable();

		clearValidationFailures();

		switch (res.responseJSON.uniqueType) {
			case "user-not-found":
				highlightValidationFailure("#username", "Username not found");
				return
			case "user-wrong-password":
				highlightValidationFailure("#password", "Incorrect pasword.");
				return
		}
		generalErrorJson("Login Failure. ", res);
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
		this.elUsername.disabled = b;
		this.elPassword.disabled = b;
		this.querySelectorAll("button").forEach(b => b.disabled = b);
	}
}

document.registerElement("login-form", LoginForm)

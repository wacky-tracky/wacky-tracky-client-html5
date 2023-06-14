export default class SidePanelToggleButton extends HTMLElement {
	setupComponents() {
		this.btn = document.createElement('button')
		this.btn.classList.add("sidePanelToggleButton")
		this.btn.title = "Toggle sidebar"
		this.btn.innerText = "wt"
		this.hidden = true;
		this.appendChild(this.btn);

		//<button id = "sidepanelIcon">wt</button>');

		this.btn.onclick = () => {
			window.sidepanel.toggle();
		}
	}
}

window.customElements.define("side-panel-toggle-button", SidePanelToggleButton)

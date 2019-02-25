export default class SidePanelIcon extends HTMLDivElement {
	setupComponents() {
		this.btn = document.createElement('button')
		this.appendChild(this.btn);

		//<button id = "sidepanelIcon">wt</button>');

		this.btn.click(function() {
			window.sidepanel.toggle();
		});
	}
}

document.registerElement("side-panel-icon", SidePanelIcon);

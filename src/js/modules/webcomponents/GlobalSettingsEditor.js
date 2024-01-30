import { notification } from '../../firmware/util.js'

export class GlobalSettingsEditor extends HTMLElement {
  setupComponents () {
    this.appendChild(document.querySelector('template#globalSettingsEditor').content.cloneNode(true))

    this.btnSetupNotifications = this.querySelector("#setupNotifications")
    this.btnSetupNotifications.onclick = () => {
      this.setupNotifications()
    }

    if (Notification.permission === 'granted') {
      this.btnSetupNotifications.disabled = true
    }

    this.btnTestNotifications = this.querySelector("#testNotifications")
    this.btnTestNotifications.onclick = () => { 
      this.testNotifications()
    }

    this.txtInstallDetails = this.querySelector("#installDetails")
    this.setupInstallDetails()

    this.setupServiceWorkerInfo()

    this.setupLocalStorageButtons()

    window.globalSettings = this
  }

  setupServiceWorkerInfo() {
    this.txtSwInfo = this.querySelector("#swInfo")

    this.btnGetVersion = this.querySelector("#getSwVersion")

    if (!("serviceWorker" in navigator)) {
      this.txtSwInfo.innerText = " Service workers are not supported in your browser. "
      this.txtSwInfo.classList += "error"
      this.btnGetVersion.disabled = true
    } else {
      if (navigator.serviceWorker.controller === null) {
        this.txtSwInfo.innerText = " Service worker controller is null :("
        this.btnGetVersion.disabled = true
      } else {
        this.txtSwInfo.innerText = " Service worker controller is setup. "
      }
    }

    this.btnGetVersion.onclick = () => {
      navigator.serviceWorker.controller.postMessage("reqGetVersion")	
    }
  }

  setupLocalStorageButtons() {
    this.querySelector('#nukeDatabase').onclick = () => {
      window.dbal.local.deleteEverything()
    }

    this.querySelector('#nukeCache').onclick = () => {
      window.caches.delete("wt-cache").then(() => {
        console.log('nuke success')
        window.alert('success')
        window.location.reload()
      })
    }
  }

  setupInstallDetails() {
    if (window.installPrompt === null) {
      this.txtInstallDetails.innerText = "Your browser won't allow installation at the moment."
    } else {
      var button = document.createElement('button')
      button.innerText = 'install'
      button.onclick = () => { window.installPrompt.prompt() }

      this.txtInstallDetails.innerText = "Installation is available! Click install below to install this as a native app. "
      this.txtInstallDetails.appendChild(button)
    }
  }

  setupNotifications() {
    Notification.requestPermission()
  }

  testNotifications() {
    notification("Test notification")
  }
}

window.customElements.define("global-settings-editor", GlobalSettingsEditor)

import './SidePanelToggleButton.js'
import './SidePanelListButton.js'
import './GlobalSettingsEditor.js'

import { ajaxRequest } from '../../firmware/middleware.js'
import { logoutRequest, promptChangePassword } from '../../firmware/util.js'

const iconDirectoryClosed = '&#128193&nbsp'
const iconDirectoryOpen = '&#128194&nbsp'
const iconTag = '&nbsp&nbsp&#x1F4D1&nbsp'

export class SidePanel extends HTMLElement {
  setupElements () {
    this.dom = document.createElement('aside')
    this.dom.setAttribute('title', 'Side Panel')
    this.appendChild(this.dom)

    this.currentSublistTitle = null
    this.currentSublistDom = null

    this.dom.appendChild(document.querySelector('template#sidePanel').content.cloneNode(true))

    this.domMenuButton = this.dom.querySelector('#sidepanelMenuButton')

    this.subtitle = this.querySelector('#subtitle')
    this.subtitle.innerText = '-'

    if (typeof (ENVIRONMENT_NAME) !== 'undefined') {
      this.subtitle.innerText = ENVIRONMENT_NAME
    }

    this.mnu = document.createElement('popup-menu')
    this.mnu.addTo(this.domMenuButton)
    this.mnu.addItem('Toggle sidebar', () => { this.toggle() }, 't')
    this.mnu.addItem('Settings', () => {
      const settings = document.createElement('global-settings-editor')
      settings.setupComponents()

      window.content.setTab(settings)
    })
    this.mnu.addItem('Logout', logoutRequest)

    this.domLists = this.querySelector('#listList')

    this.domTagContainer = this.querySelector('#tagList')
    this.domTagContainer.title = 'Tags'

    this.domButtonNewTag = this.querySelector('button#newTag')
    this.domButtonNewTag.onclick = () => { this.createTag() }

    this.domButtonNewList = this.querySelector('button#newList')
    this.domButtonNewList.onclick = () => { this.createList() }

    this.domButtonRefresh = this.querySelector('button#refresh')
    this.domButtonRefresh.onclick = () => { window.uimanager.refreshLists(true) }

    this.domButtonIssue = this.querySelector('button#raiseIssue')
    this.domButtonIssue.onclick = () => { window.open('http://github.com/wacky-tracky/wacky-tracky-client-html5/issues/new') }

    this.toggleIcon = document.createElement('side-panel-toggle-button')
    this.toggleIcon.setupComponents()
  }

  getToggleButton () {
    return this.toggleIcon
  }

  toggle () {
    if (this.dom.hidden) {
      this.dom.hidden = false
      this.toggleIcon.hidden = true
    } else {
      this.dom.hidden = true
      this.toggleIcon.hidden = false
    }
  }

  createTag () {
    var title = window.prompt('Tag name?')

    if (title === '') {
      return
    }

    ajaxRequest({
      url: 'createTag',
      data: {
        title: title
      },
      success: window.dbal.remote.fetchTags
    })
  }

  createList () {
    const title = window.prompt('List name?')

    if (title === '') {
      return
    }

    ajaxRequest({
      url: 'CreateList',
      data: {
        title: title
      },
      success: window.uimanager.refreshLists
    })
  }

  addMenuItem (menuItem) {
    const li = document.createElement('li')
    li.title = menuItem.list.getTitle()
    li.appendChild(menuItem)

    let owner = this.domLists

    const listSeparator = '>'
    if (menuItem.list.title.includes(listSeparator)) {
      let titleComponents = menuItem.list.title.split(listSeparator)
      titleComponents.length--
      titleComponents = titleComponents.join(listSeparator)

      const menuListTitleEl = menuItem.querySelector('.listTitle')
      menuListTitleEl.innerText = menuListTitleEl.innerText.replace(titleComponents + listSeparator, '')

      if (this.currentSublistTitle !== titleComponents) {
        this.currentSublistTitle = titleComponents

        const sublist = document.createElement('ul')
        sublist.classList.add('sublist')
        sublist.title = 'Sub list called ' + this.currentSublistTitle
        this.domLists.appendChild(sublist)

        const sublistItems = document.createElement('div')
        sublistItems.classList.add('subListItems')
        sublistItems.hidden = true

        this.currentSublistDom = sublistItems

        const title = document.createElement('a')
        const indicator = document.createElement('span')
        indicator.innerHTML = iconDirectoryClosed
        title.classList.add('subListTitle')
        title.classList.add('listMenuLink')
        title.setAttribute('role', 'button')
        title.onclick = () => {
          if (sublistItems.hidden) {
            sublistItems.hidden = false
            indicator.innerHTML = iconDirectoryOpen
          } else {
            sublistItems.hidden = !sublistItems.hidden
            indicator.innerHTML = iconDirectoryClosed
          }
        }

        title.appendChild(indicator)

        const text = document.createElement('span')
        text.innerText = titleComponents
        title.title = 'Open sublist'
        title.appendChild(text)

        sublist.appendChild(title)
        sublist.appendChild(sublistItems)

        owner = sublistItems
      } else {
        owner = this.currentSublistDom
      }
    } else {
      this.currentSublistTitle = null
      this.currentSublistDom = null

      owner = this.domLists
    }

    owner.append(li)
  }

  deselectAll () {
    for (const menuItem of this.domLists.querySelectorAll('side-panel-list-button')) {
      menuItem.deselect()
    }
  }

  addTag (mdlTag) {
    const elTag = document.createElement('side-panel-tag-button')
    elTag.setTag(mdlTag)
    elTag.setupComponents()

    if (window.lastTag !== mdlTag.getTitle()) {
      window.lastTag = mdlTag.getTitle()

      const tagName = document.createElement('h4')
      tagName.innerHTML = iconTag + mdlTag.getTitle()
      this.domTagContainer.append(tagName)

      this.lastDomTags = document.createElement('ul')
      this.lastDomTags.classList.add('tagList')
      this.domTagContainer.append(this.lastDomTags)
    }

    const li = document.createElement('li')
    li.append(elTag)
    // this.lastDomTags.append(li)
  }

  toDom () {
    return this.dom
  }

  clearLists () {
    while (this.domLists.hasChildNodes()) {
      this.domLists.firstChild.remove()
    }
  }

  clearTags () {
    const tags = this.querySelector('#tagList')

    while (tags.hasChildNodes()) {
      tags.firstChild.remove()
    }
  }

  /**
  renderTags(tags) {
    let ret = ""

    tags.forEach(tag => {
      ret += '.tag' + tag.id + '.tagTitle { border-left: 4px solid ' + tag.backgroundColor + ' !important }' + "\n"
      ret += '.tag' + tag.id + '.indicator { background-color:' + tag.backgroundColor + ' !important }' + "\n"
      this.addTag(new Tag(tag))
    })

    //$('body').append($('<style type = "text/css">' + ret + '</style>'))

  }
  */

  addListMenuItem (mdlList, list) {
    const item = document.createElement('side-panel-list-button')
    item.setFields(list)
    item.setupComponents()
    item.setListCallback(mdlList, list)

    this.addMenuItem(item)

    return item
  }

  hide () {
    this.dom.hide()
  }

  setupMenu () {
    const menuUser = document.createElement('popup-menu')
    menuUser.addItem('Toggle', this.toggle)
    menuUser.addItem('Change password', promptChangePassword)
    menuUser.addItem('Logout', logoutRequest)
    menuUser.addTo(this.domTitle)
  }
}

window.customElements.define('side-panel', SidePanel)

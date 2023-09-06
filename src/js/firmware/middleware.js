import { generalError } from './util.js'

export function ajaxRequest (params) {
  if (typeof (params.error) !== 'function') {
    params.error = generalError
  }

  if (typeof (params.success) !== 'function') {
    throw new Error('Success callback is not a function, it is: ' + typeof (params.success))
  }

  // Assigning the callbacks to variables here is important, because the fetch
  // promise mangles the "this" context on the callbacks.
  const callbackSuccess = (data) => { params.success(data) }
  const callbackError = (data) => { params.error(data) }

  let isSuccessful = true

  const url = new URL(window.location.protocol + '//' + window.location.hostname + ":8080/api/" + params.url)

  if (typeof (params.data) !== 'undefined') {
    Object.keys(params.data).forEach(key => url.searchParams.append(key, params.data[key]))
  }

  window.fetch(url, {
    method: 'GET',
    credentials: 'include'
  })
    .then(resp => {
      if (!resp.ok) {
        Promise.reject(resp)

        isSuccessful = false
        return 'Fetch request is not OK';
      }

      return resp.json()
    })
    .then(json => {
      if (isSuccessful) {
        callbackSuccess(json)
      } else {
        callbackError(json)
      }
    }).catch(err => {
      Promise.reject(err)
      callbackError(err)
    })
}

// FIXME move to UiManager
export function clearValidationFailures() {
  document.querySelectorAll('p.validationError').forEach(e => e.remove());
  document.querySelectorAll('input.validationError').forEach(e => e.classList -= 'validationError');
}

// FIXME move to UiManager
export function highlightValidationFailure(selector, message) {
  let element = document.querySelector(selector)

  element.classList += 'validationError'

  let errorMessage = document.createElement("p")
  errorMessage.classList += "validationError"
  errorMessage.innerText = message

  element.parentElement.querySelectorAll('p.validationError').forEach(e => e.remove());
  element.parentElement.appendChild(errorMessage);

}

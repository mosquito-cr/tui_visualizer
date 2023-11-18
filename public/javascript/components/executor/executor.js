"use strict";

import BaseComponent from '../../lib/base-component.js'

const html = await BaseComponent.fetchHTML('/javascript/components/executor/executor.html')
const css = await BaseComponent.fetchCSS('/javascript/components/executor/executor.css')

export default class Executor extends BaseComponent {
  constructor () {
    super()

    this.html = html
    this.css = css

    this.attachHTML()
    this.attachCSS()

    this.work = this.shadowRoot.querySelector("#work")
    this.idTag = this.shadowRoot.querySelector("#id")
  }

  connectedCallback() {
    this.idTag.textContent = this.dataset.id
  }

  message(message) {
    switch(message.event) {
      case "starting": 
        this.work.querySelector("#work-name").textContent = message.from_queue + ": " + message.job_run
        this.work.classList.remove("hidden")
        break
      case "job-finished":
        this.work.classList.add("hidden")
        break
      default:
        console.log(message.event)
    }
  }
}

customElements.define('mosquito-executor', Executor)

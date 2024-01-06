"use strict";

import BaseComponent from '../../lib/base-component.js'
import Builder from "../../lib/builder.js"

const html = await BaseComponent.fetchHTML('/javascript/components/overseer/overseer.html')
const css = await BaseComponent.fetchCSS('/javascript/components/overseer/overseer.css')

export default class Overseer extends BaseComponent {
  constructor () {
    super()

    this.html = html
    this.css = css

    this.attachHTML()
    this.attachCSS()

    this.executors = []
    this.busyExecutors = []
  }

  connectedCallback() {
    this.idTag.textContent = `Overseer<${this.dataset.id.slice(-6)}>`
  }

  updateSummary() {
    this.summaryTag.textContent = `${this.busyExecutors.length}/${this.executors.length} busy`
    if (this.summaryTag.classList.contains('hidden'))
      this.summaryTag.classList.remove('hidden')
  }

  get idTag() {
    return this.shadowRoot.getElementById('id')
  }

  get summaryTag() {
    return this.shadowRoot.getElementById('summary')
  }

  fetchExecutor(id) {
    const executor = this.executors.find(executor => executor.dataset.id === id)
    if (executor) return executor
    const tag = Builder.tag('mosquito-executor', {dataset: {id}})
    this.executors.push(tag)
    this.shadowRoot.querySelector('#executors').appendChild(tag)
    return tag
  }

  dispatchExecutorMessage(executorId, message) {
    const executor = this.fetchExecutor(executorId)
    executor.message(message)

    switch(message.event) {
      case "starting":
        if (! this.busyExecutors.includes(executorId))
          this.busyExecutors.push(executorId)
        break
      case "job-finished":
        const index = this.busyExecutors.indexOf(executorId)
        if (index > -1)
          this.busyExecutors.splice(index, 1)
        break
    }

    this.updateSummary()
  }
}

customElements.define('mosquito-overseer', Overseer)

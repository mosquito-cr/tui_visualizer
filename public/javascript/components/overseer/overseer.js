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
  }

  connectedCallback() {
    this.idTag.textContent = this.dataset.id
  }

  get idTag() {
    return this.shadowRoot.getElementById('id')
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
  }
}

customElements.define('mosquito-overseer', Overseer)

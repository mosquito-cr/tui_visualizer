"use strict";

import BaseComponent from '../../lib/base-component.js'
import Builder from "../../lib/builder.js"
import Executor from './executor.js'

const html = await BaseComponent.fetchHTML('/javascript/components/overseer/overseer.html')
const css = await BaseComponent.fetchCSS('/javascript/components/overseer/overseer.css')

export default class Overseer extends BaseComponent {
  constructor () {
    super()

    this.html = html
    this.css = css

    this.attachHTML()
    this.attachCSS()

    this.executors = {}
    this.busyExecutors = []
  }

  connectedCallback() {
    this.idTag.textContent = `Overseer<${this.dataset.id.slice(-6)}>`
  }

  updateSummary() {
    const executorCount = Object.keys(this.executors).length
    this.summaryTag.textContent = `${this.busyExecutors.length}/${executorCount} busy`
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
    const foundExecutor = this.executors[id]
    if (foundExecutor) return foundExecutor

    const fragment = this.shadowRoot.querySelector("template#executor").content.cloneNode(true)
    fragment.querySelector(".executor-row").dataset.executorId = id
    fragment.querySelector(".progress-row").dataset.executorId = id

    this.shadowRoot.querySelector("#executors").appendChild(fragment)
    const insertedRow = this.shadowRoot.querySelector(`.executor-row[data-executor-id="${id}"]`)
    const insertedProgressBar = this.shadowRoot.querySelector(`.progress-row[data-executor-id="${id}"]`)
    return this.executors[id] = new Executor(id, insertedRow, insertedProgressBar)
  }

  dispatchExecutorMessage(executorId, message) {
    const executor = this.fetchExecutor(executorId)

    switch(message.event) {
      case "starting":
        executor.startWorkAnimation(message)

        if (! this.busyExecutors.includes(executorId))
          this.busyExecutors.push(executorId)
        break

      case "job-finished":
        executor.stopWorkAnimation(message)

        const index = this.busyExecutors.indexOf(executorId)

        if (index > -1)
          this.busyExecutors.splice(index, 1)

        setTimeout(this.updateSummary.bind(this), 40)
        break
    }
  }
}

customElements.define('mosquito-overseer', Overseer)

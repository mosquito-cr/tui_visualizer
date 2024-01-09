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

    this.executors = {}
    this.progressBars = {}
    this.executorTimeouts = {}
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
    const foundExecutorRow = this.executors[id]
    if (foundExecutorRow) return foundExecutorRow

    const fragment = this.shadowRoot.querySelector("template#executor").content.cloneNode(true)
    fragment.querySelector(".executor-row").dataset.executorId = id
    fragment.querySelector(".progress-row").dataset.executorId = id

    this.shadowRoot.querySelector("#executors").appendChild(fragment)
    this.executors[id] = this.shadowRoot.querySelector(`.executor-row[data-executor-id="${id}"]`)
    this.progressBars[id] = this.shadowRoot.querySelector(`.progress-row[data-executor-id="${id}"]`)

    return this.executors[id]
  }

  dispatchExecutorMessage(executorId, message) {
    const executor = this.fetchExecutor(executorId)
    executor.querySelector(".executor-id").textContent = executorId
    const progressBar = this.progressBars[executorId].querySelector(".progress-bar")

    clearTimeout(this.executorTimeouts[executorId])
    clearInterval(this.executorTimeouts[executorId])

    switch(message.event) {
      case "starting":
        if (! this.busyExecutors.includes(executorId))
          this.busyExecutors.push(executorId)

        executor.querySelector(".working-on").textContent = message.from_queue + ": " + message.job_run

        const animationFrameLength = 50 // ms
        const progressIncrement = 100 / (message.expected_duration_ms / animationFrameLength)

        let progressWidth = progressIncrement

        this.executorTimeouts[executorId] = setInterval(() => {
          progressWidth += progressIncrement
          if (progressWidth > 100) progressWidth = 100
          progressBar.style.width = progressWidth + '%'
        }, animationFrameLength)
        break
      case "job-finished":
        progressBar.style.width = "100%"

        // for a less "blinky" UI, don't make things "idle" until it's been idle for a bit
        this.executorTimeouts[executorId] = setTimeout(() => {
          const index = this.busyExecutors.indexOf(executorId)
          if (index > -1)
            this.busyExecutors.splice(index, 1)

          executor.querySelector(".working-on").textContent = "idle"
        }, 40)
        break
    }

    this.updateSummary()
  }
}

customElements.define('mosquito-overseer', Overseer)

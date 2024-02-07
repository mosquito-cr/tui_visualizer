"use strict";

import Executor from './executor.js'
import Nest from './nest.js'

export default class Overseer {
  static template = null

  static setTemplate(elem) {
    Overseer.template = elem
  }

  onMessage(channel, message) {
    // overseer message
    if (channel.length == 3) {
      console.log(message)
      return
    }

    // queuelist message
    else if (channel.length == 4) { }

    // executor message
    else if (channel.length == 5) {
      this.executorNest
        .findOrHatch(channel[4])
        .onMessage(channel, message)

      this.executorMessage(channel[4], message)
      return
    }
  }

  constructor(overseerId) {
    this.id = overseerId
    this.element = null
    this.updateTimeout = null
    this.lastActiveAt = null
  }

  appendTo(element) {
    const template = Overseer.template.content.cloneNode(true)
    template.querySelector(".overseer").dataset.id = this.id
    element.appendChild(template)

    this.element = element.querySelector(`.overseer[data-id="${this.id}"]`)
    this.executorNest = new Nest(this.element.querySelector(".executors tbody"), Executor)
    this.updateSummary()
  }

  updateSummary() {
    const executorCount = this.executorNest.count
    const busyExecutorCount = Object.values(this.executorNest.hatchlings).filter(executor => executor.busy).length

    const summary = this.element.querySelector(".summary")

    if (busyExecutorCount > 0)
      summary.textContent = `${busyExecutorCount}/${executorCount} busy`
    else
      summary.textContent = `idle`

    if (summary.classList.contains('hidden'))
      summary.classList.remove('hidden')

    this.element.querySelector('.overseer-id').textContent = `Overseer<${this.id.slice(-6)}>`
  }

  executorMessage(executorId, message) {
    switch(message.event) {
      case "starting":
        clearTimeout(this.updateTimeout)
        this.updateSummary()
        break

      case "job-finished":
        clearTimeout(this.updateTimeout)
        this.updateTimeout = setTimeout(() => {
          this.updateSummary()
        }, 80)
        break
    }
  }
}

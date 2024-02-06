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
    this.busyExecutors = []
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
    const summary = this.element.querySelector(".summary")

    if (this.busyExecutors.length > 0)
      summary.textContent = `${this.busyExecutors.length}/${executorCount} busy`
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

        if (! this.busyExecutors.includes(executorId)) {
          this.busyExecutors.push(executorId)
          this.updateSummary()
        }
        break

      case "job-finished":
        clearTimeout(this.updateTimeout)
        this.updateTimeout = setTimeout(() => {
          const index = this.busyExecutors.indexOf(executorId)

          if (index > -1)
            this.busyExecutors.splice(index, 1)
          this.updateSummary()
        }, 80)
        break
    }
  }
}

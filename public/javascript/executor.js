"use strict";

export default class Executor {
  static animationFrameLength = 50 // ms
  static template = null
  static setTemplate(elem) {
    this.template = elem
  }

  appendTo(element) {
    const template = Executor.template.content.cloneNode(true)
    template.querySelector(".executor-row").dataset.id = this.id
    template.querySelector(".progress-row").dataset.id = this.id

    element.appendChild(template)
    this.detailsRow = element.querySelector(`.executor-row[data-id="${this.id}"]`)
    this.progressRow = element.querySelector(`.progress-row[data-id="${this.id}"]`)

    this.detailsRow.querySelector(".executor-id").textContent = this.id
  }

  constructor(executorId) {
    this.id = executorId
    this.timeout = null
  }

  set progress(value) {
    const progressBar = this.progressRow.querySelector('.progress-bar')
    progressBar.style.width = value + '%'

    if (value >= 100) {
      progressBar.classList.add('spin')
    } else {
      progressBar.classList.remove('spin')
    }
  }

  onMessage(channel, message) {
    switch(message.event) {
      case "starting":
        this.busy = true
        this.startWorkAnimation(message)

        break

      case "job-finished":
        this.busy = false
        this.stopWorkAnimation(message)

        break
    }
  }

  clearRefreshTimers() {
    clearTimeout(this.timeout)
    clearInterval(this.timeout)
  }

  startWorkAnimation(workDetails) {
    this.clearRefreshTimers()
    this.detailsRow.querySelector(".working-on").textContent = workDetails.from_queue + ": " + workDetails.job_run

    const progressIncrement = 100 / (workDetails.expected_duration_ms / this.constructor.animationFrameLength)

    let progressPercent = 0

    this.timeout = setInterval(() => {
      progressPercent += progressIncrement
      if (progressPercent > 100) progressPercent = 100
      this.progress = progressPercent
    }, this.constructor.animationFrameLength)
  }

  stopWorkAnimation(executorId, workDetails) {
    this.clearRefreshTimers()
    this.progress = 100

    // for a less "blinky" UI, don't make things "idle" until it's been idle for long enough
    // that a new job would be assigned if it existed.
    this.timeout = setTimeout(() => {
      this.progress = 0
      this.detailsRow.querySelector(".working-on").textContent = "idle"
    }, 40)
  }
}

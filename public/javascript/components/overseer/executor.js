"use strict";

export default class Executor {
  constructor(executorId, detailsRow, progressRow) {
    this.executorId = executorId
    this.detailsRow = detailsRow
    this.progressBar = progressRow.querySelector('.progress-bar')
    this.busy = false

    this.fillId()

    this.timeout = null
  }

  set progress(value) {
    this.progressBar.style.width = value + '%'

    if (value >= 100) {
      this.progressBar.classList.add('spin')
    } else {
      this.progressBar.classList.remove('spin')
    }
  }

  static animationFrameLength = 50 // ms

  fillId() {
    this.detailsRow.querySelector(".executor-id").textContent = this.executorId
  }

  clearRefreshTimers() {
    clearTimeout(this.timeout)
    clearInterval(this.timeout)
  }

  startWorkAnimation(workDetails) {
    this.clearRefreshTimers()
    this.detailsRow.querySelector(".working-on").textContent = workDetails.from_queue + ": " + workDetails.job_run

    const progressIncrement = 100 / (workDetails.expected_duration_ms / this.constructor.animationFrameLength)

    let progressPercent = progressIncrement

    this.timeout = setInterval(() => {
      progressPercent += progressIncrement
      if (progressPercent > 100) progressPercent = 100
      this.progress = progressPercent
    }, this.animationFrameLength)
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

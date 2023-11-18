"use strict";

import BaseComponent from '../../lib/base-component.js'

const html = await BaseComponent.fetchHTML('/javascript/components/message-stream/message-stream.html')
const css = await BaseComponent.fetchCSS('/javascript/components/message-stream/message-stream.css')

export default class MessageStream extends BaseComponent {
  constructor () {
    super()

    this.html = html
    this.css = css

    this.attachHTML()
    this.attachCSS()

    this.firstScroll = true
    this.streamMessages = true
  }

  isScrolledToBottom() {
    return new Promise(resolve => {
      const observer = new IntersectionObserver(([entry]) => {
        resolve(entry.intersectionRatio === 1)
        observer.disconnect()
      })
      observer.observe(this.elem("#scroll-anchor"));
    })
  }

  async checkIfScrolledToBottom() {
    const atBottom = await this.isScrolledToBottom()
    this.elem("#scroll-to-bottom").checked = atBottom
  }

  connectedCallback() {
    this.elem("#scroller").addEventListener("scroll", (event) => {
      clearTimeout(this.scrollEventTimeout)
      this.scrollEventTimeout = setTimeout(this.checkIfScrolledToBottom.bind(this), 50)
    })

    this.elem("#scroll-to-bottom").addEventListener("change", this.scrollToBottomChanged.bind(this))
    this.elem("#start-stop").addEventListener("click", this.startStopClicked.bind(this))
    this.setStartStopText()
  }

  // Event Responders
  messageReceived(message) {
    if (! this.streamMessages) return
    this.elem("#messages").textContent += JSON.stringify(message) + "\n"
    this.tryFirstScroll()
  }

  scrollToBottomChanged(event) {
    if (event.target.checked) this.scrollToBottom()
  }

  startStopClicked(event) {
    switch (event.target.dataset.action) {
      case "start":
        this.streamMessages = true
        event.target.dataset.action = "stop"
        event.target.textContent = event.target.dataset.textWhileStarted
        break
      case "stop":
        this.streamMessages = false
        event.target.dataset.action = "start"
        event.target.textContent = event.target.dataset.textWhileStopped
        break
    }
  }

  // scroll-anchors only work after the scrollable container has scrolled
  // cf https://css-tricks.com/books/greatest-css-tricks/pin-scrolling-to-bottom/
  tryFirstScroll() {
    if (! this.firstScroll) return

    const currentScroll = this.elem("#scroller").scrollTop
    this.scrollToBottom()
    if (currentScroll != this.elem("#scroller").scrollTop) {
      this.firstScroll = false
    }
  }

  scrollToBottom() {
    this.elem("#scroll-anchor").scrollIntoView()
  }

  setStartStopText() {
    if (this.streamMessages)
      this.elem("#start-stop").innerText = this.elem("#start-stop").dataset.textWhileStarted 
    else
      this.elem("#start-stop").innerText = this.elem("#start-stop").dataset.textWhileStopped
  }
}

customElements.define('mosquito-message-stream', MessageStream)

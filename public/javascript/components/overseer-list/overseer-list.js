"use strict";

import BaseComponent from '../../lib/base-component.js'
import Builder from "../../lib/builder.js"

const html = await BaseComponent.fetchHTML('/javascript/components/overseer-list/overseer-list.html')
const css = await BaseComponent.fetchCSS('/javascript/components/overseer-list/overseer-list.css')

export default class OverseerList extends BaseComponent {
  constructor () {
    super()

    this.html = html
    this.css = css

    this.childNest = []

    this.attachHTML()
    this.attachCSS()

    this.list = this.shadowRoot.querySelector("#overseers")
  }

  update(overseers) {
    overseers.forEach(overseer_id => this.fetchChild(overseer_id))
  }

  fetchChild(id) {
    const child = this.childNest.find(child => child.dataset.id === id)
    if (child) return child
    const tag = Builder.tag('mosquito-overseer', {dataset: {id}})
    this.childNest.push(tag)
    this.list.appendChild(tag)

    return tag
  }

  dispatchExecutorMessage(overseerId, executorId, message) {
    this.fetchChild(overseerId)
        .dispatchExecutorMessage(executorId, message)
  }
}

customElements.define('mosquito-overseer-list', OverseerList)

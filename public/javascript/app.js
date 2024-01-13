"use strict";

// TODO:
// - prefetch a list of overseers and executors, so the page isn't stale when it loads
// - global count of executors and busy executors in all overseers
// - flag/color which indicates an overseer is doing coordinator activities
// - be able to click into an executor to see it's details:
//  - when it was started
//  - how many jobs it's done since start
//  - rate of jobs
// - be able to click into a job to see it's details
//   - how many times the job is enqueued
// - when an overseer exits, it should be removed from the list

import HotReload from "./hot_reload.js"
HotReload("ws://localhost:3000/hot-reload")

import Builder from "./lib/builder.js"

import EventStream from "./event_stream.js"
import TabManager from "./tabs.js"

import Nest from "./nest.js"
import Queue from "./components/queue/queue.js"
import QueueList from "./components/queue-list/queue-list.js"
import Overseer from "./overseer.js"
import Executor from "./executor.js"
import MessageStream from "./components/message-stream/message-stream.js"

const messageStream = document.querySelector("mosquito-message-stream")
const overseerNest = new Nest(document.querySelector("#overseers"), Overseer)
Overseer.setTemplate(document.querySelector("template#overseer"))
Executor.setTemplate(document.querySelector("template#executor"))

const queueList = document.querySelector("mosquito-queue-list")

const eventStream = new EventStream("ws://localhost:3000/events")

eventStream.on("list-queues", queues => {
  queueList.update(queues)
  queues.forEach(queue_name => eventStream.queueDetail(queue_name))
})

eventStream.on("list-overseers", overseers => {
  console.log(overseers)
  // Overseer.update(overseers)
})
eventStream.on("message", message => messageStream.messageReceived(message))
eventStream.on("queue-detail", message => {
  queueList.updateDetails(message.queue.name, message.queue)
})

eventStream.on("broadcast", event => {
  const parts = event.channel.split(":")
  switch (parts[1]) {
    case "overseer":
      overseerNest.findOrHatch(parts[2]).onMessage(parts, event.message)
      break
    case "queue":
      dispatchQueueMessage(parts, event.message)
      break
  }
})

eventStream.on("ready", () => {
  eventStream.listQueues()
  eventStream.listOverseers()
})


function dispatchQueueMessage(channel, message) {
  const queueName = channel[2]
  queueList.dispatchMessage(queueName, message)
}

function go() {
  const tabs = document.querySelector("#tabs")
  const tabContent = document.querySelector("#tab-content")
  const rootTabs = new TabManager(tabs, tabContent)
  rootTabs.manageHistory = true
}

if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", go)
else
  go()

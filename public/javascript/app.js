"use strict";

import HotReload from "./hot_reload.js"
HotReload("ws://localhost:3000/hot-reload")

import Builder from "./lib/builder.js"

import EventStream from "./event_stream.js"
import TabManager from "./tabs.js"

import Queue from "./components/queue/queue.js"
import QueueList from "./components/queue-list/queue-list.js"
import Overseer from "./components/overseer/overseer.js"
import OverseerList from "./components/overseer-list/overseer-list.js"
import Executor from "./components/executor/executor.js"
import MessageStream from "./components/message-stream/message-stream.js"

const messageStream = document.querySelector("mosquito-message-stream")
const overseerList = document.querySelector("mosquito-overseer-list")
const queueList = document.querySelector("mosquito-queue-list")

const eventStream = new EventStream("ws://localhost:3000/events")

eventStream.on("list-queues", queues => {
  queueList.update(queues)
  queues.forEach(queue_name => eventStream.queueDetail(queue_name))
})

eventStream.on("list-overseers", overseers => overseerList.update(overseers))
eventStream.on("message", message => messageStream.messageReceived(message))
eventStream.on("queue-detail", message => {
  queueList.updateDetails(message.queue.name, message.queue)
})

eventStream.on("broadcast", event => {
  const parts = event.channel.split(":")
  switch (parts[1]) {
    case "overseer":
      if (parts.length == 3) // overseer
        dispatchOverseerMessage(parts, event.message)
      else if (parts.length == 5) // executor
        dispatchOverseerSubMessage(parts, event.message)
      break;
    case "queue":
      dispatchQueueMessage(parts, event.message)
      break;
  }
})

eventStream.on("ready", () => {
  eventStream.listQueues()
  eventStream.listOverseers()
})


function dispatchOverseerMessage(channel, message) {
  // console.log(message)
}

function dispatchOverseerSubMessage(channel, message) {
  if (channel[3] != "executor") return
  const overseerId = channel[2]
  const executorId = channel[4]
  overseerList.dispatchExecutorMessage(overseerId, executorId, message)
}

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

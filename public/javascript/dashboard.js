"use strict";

import EventStream from "./event_stream.js"

import Nest from "./nest.js"
import Overseer from "./overseer.js"
import Executor from "./executor.js"

const overseerNest = new Nest(document.querySelector("#overseers"), Overseer)
Overseer.setTemplate(document.querySelector("template#overseer"))

const eventStream = new EventStream("ws://localhost:3000/events")

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

async function fetchOverseers() {
  fetch("/api/overseers")
  .then(response => response.json())
  .then(({overseers}) => {
    overseers.forEach(overseerId => {
      overseerNest.findOrHatch(overseerId)
      fetchOverseerExecutors(overseerId)
    })
  }).catch(error => console.error(error))
}

async function fetchOverseerExecutors(overseerId) {
  fetch(`/api/overseers/${overseerId}/executors`)
  .then(response => response.json())
  .then(({executors}) => {
    executors.forEach(executor => {
      const overseer = overseerNest.findOrHatch(overseerId)

      overseer
        .executorNest
        .findOrHatch(executor.id)
        .setState({
          progress: executor.current_job == null ? 0 : 100,
          spin: true,
          job: executor.current_job,
          queue: executor.current_job_queue
        })

      overseer.updateSummary()
    })
  }).catch(error => console.error(error))
}

function go() {
  fetchOverseers()
}

if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", go)
else
  go()

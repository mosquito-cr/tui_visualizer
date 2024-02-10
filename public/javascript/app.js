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

// import Queue from "./components/queue/queue.js"
// import QueueList from "./components/queue-list/queue-list.js"
// import MessageStream from "./components/message-stream/message-stream.js"
// const messageStream = document.querySelector("mosquito-message-stream")

// const queueList = document.querySelector("mosquito-queue-list")

// const eventStream = new EventStream("ws://localhost:3000/events")

// eventStream.on("list-queues", queues => {
//   queueList.update(queues)
//   queues.forEach(queue_name => eventStream.queueDetail(queue_name))
// })

// eventStream.on("list-overseers", overseers => {
//   overseers.forEach(overseerId => {
//     overseerNest.findOrHatch(overseerId)
//   })
// })

// eventStream.on("queue-detail", message => {
//   queueList.updateDetails(message.queue.name, message.queue)
// })


// // eventStream.on("message", message => messageStream.messageReceived(message))

// function dispatchQueueMessage(channel, message) {
//   const queueName = channel[2]
//   queueList.dispatchMessage(queueName, message)
// }



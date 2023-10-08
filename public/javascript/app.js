"use strict";

import HotReload from "./hot_reload.js"

const hot_reload = new HotReload("ws://localhost:3000/hot_reload")

hot_reload.connect()

const eventStream = new WebSocket("ws://localhost:3000/events")
eventStream.onmessage = function(e) {
  console.log(`message from events stream: ${e.data}`)
}

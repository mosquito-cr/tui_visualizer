"use strict";

import HotReload from "./hot_reload.js"
HotReload("ws://localhost:3000/hot-reload")

import EventStream from "./event_stream.js"
EventStream("ws://localhost:3000/events")

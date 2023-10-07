"use strict";

class HotReload {
  constructor() {
    this.reloadTimeout = null
    this.socket = null
    this.hasBeenConnected = false
  }

  async connect() {
    const testSocket = new WebSocket("ws://localhost:3000/hot_reload")

    const waitForConnecting = new Promise((resolve, reject) => {
      const check = () => {
        if (testSocket.readyState === WebSocket.CONNECTING) {
          setTimeout(check, 100)
        } else {
          resolve()
        }
      }

      check()
    })

    await waitForConnecting

    if (testSocket.readyState === WebSocket.OPEN) {

      if (this.hasBeenConnected) {
        console.log("connected! (automatic reload)")
        this.reload()
        return
      }

      console.log("connected!")

      this.socket = testSocket
      this.hasBeenConnected = true
      this.socket.onmessage = this.onmessage.bind(this)
      this.socket.onclose = this.onclose.bind(this)
    } else {
      console.log("hot reload failed to connect :(")
      setTimeout(this.connect.bind(this), 100)
    }
  }

  onclose(e) {
    console.log("hot reload connection closed")
    this.socket = null
    this.reloadTimeout = null
    setTimeout(this.connect.bind(this), 100)
  }

  onmessage(e) {
    clearTimeout(this.reloadTimeout)
    this.reloadTimeout = setTimeout(this.reload, 300)
  }

  reload() {
    location.reload()
  }
}

const hot_reload = new HotReload()
hot_reload.connect()

const eventStream = new WebSocket("ws://localhost:3000/events")
eventStream.onmessage = function(e) {
  console.log(`message from events stream: ${e.data}`)
}

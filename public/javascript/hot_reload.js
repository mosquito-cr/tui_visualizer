"use strict";

export default class HotReload {
  constructor(path) {
    this.path = path
    this.reloadTimeout = null
    this.socket = null
    this.hasBeenConnected = false
  }

  async connect() {
    const testSocket = new WebSocket(this.path)

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
        this.reload()
        return
      }

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
    this.socket = null
    this.reloadTimeout = null
    setTimeout(this.connect.bind(this), 100)
  }

  onmessage(e) {
    clearTimeout(this.reloadTimeout)
    this.reloadTimeout = setTimeout(this.reload, 300)
  }

  reload() {
    console.log("reloading...")
    location.reload()
  }
}

"use strict";

class MosquitoEventStream {
  constructor(path) {
    this.path = path
    this.socket = null
    this.connect()

    this.messagesDiv = document.getElementById("messages")
  }

  connect() {
    this.socket = new WebSocket(this.path)
    this.socket.onopen = this.onopen.bind(this)
    this.socket.onmessage = this.onmessage.bind(this)
    this.socket.onerror = this.onerror.bind(this)
    this.socket.onclose = this.onclose.bind(this)

    window.addEventListener("beforeunload", (e) => {
      this.socket.close()
    }, {passive: true})
  }

  onopen(e) { }
  onmessage(e) {
    this.messagesDiv.innerHTML += e.data + "<br>"
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight
  }
  onerror(e) {
    console.log("event stream error")
    console.dir(e)
  }
  onclose(e) {
    // console.log("event stream closed")
    // console.dir(e)
  }
}

const EventStream = (path) => new MosquitoEventStream(path)
export default EventStream

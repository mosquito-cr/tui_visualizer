require "./socket_broadcaster"

class EventStream < SocketBroadcaster
  def register(output : HTTP::WebSocket)
    super
    output.on_message do |message|
      message_received(output, message)
    end
  end

  def message_received(socket : HTTP::WebSocket, message : String)
    case message
    when "ping"
      socket.send({ type: "pong" }.to_json)
    when "list-queues"
      socket.send({
        type: "list-queues",
        queues: Mosquito::Api.list_queues.map(&.name)
      }.to_json)

    when "list-overseers"

    when %r|overseer\((.*)\)/executors|

    when /executor\((.*)\)/
      id = $~[1]
      executor = Mosquito::Api.executor(id)

      socket.send({
        type: "executor-detail",
        executor: { id: id, current_job: executor.current_job }
      }.to_json)
    when /queue\((.*)\)/
      name = $~[1]
      queue = Mosquito::Api.queue(name)

      socket.send({
        type: "queue-detail",
        queue: { name: name, sizes: queue.sizes }
      }.to_json)
    else
      Log.error { "Unknown message received: #{message}" }
    end
  end
end


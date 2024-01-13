require "kemal"
require "fswatch"
require "mosquito"

class SocketBroadcaster
  @outputs = [] of HTTP::WebSocket

  delegate size, to: @outputs

  def initialize
  end

  def broadcast(message)
    @outputs.each do |output|
      output.send message
    end
  end

  def register(output : HTTP::WebSocket)
    @outputs << output
    output.on_close { @outputs.delete output }
  end
end

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
        queues: Mosquito::Inspector.list_queues.map(&.name)
      }.to_json)
    when "list-overseers"
      socket.send({
        type: "list-overseers",
        overseers: Mosquito::Inspector.list_overseers.map(&.name)
      }.to_json)
    when /queue\((.*)\)/
      name = $~[1]
      queue = Mosquito::Inspector.queue(name)

      socket.send({
        type: "queue-detail",
        queue: { name: name, sizes: queue.sizes }
      }.to_json)
    else
      Log.error { "Unknown message received: #{message}" }
    end
  end
end

get "/" do
  File.read("public/index.html")
end

hot_reload = SocketBroadcaster.new

FSWatch.watch "." do |event|
  next if /\.git/ =~ event.path
  hot_reload.broadcast("hot reload")
end

ws "/hot-reload" do |socket|
  hot_reload.register socket
end

event_stream = Mosquito::Inspector.event_receiver
event_stream_clients = EventStream.new

def message_formatter(broadcast : Mosquito::Backend::BroadcastMessage) : String
  {
    type: "broadcast",
    channel: broadcast.channel,
    message: JSON.parse(broadcast.message)
  }.to_json
end

spawn do
  loop do
    message = event_stream.receive
    event_stream_clients.broadcast message_formatter(message)
  end
end

ws "/events" do |socket|
  event_stream_clients.register socket
end

Kemal.run

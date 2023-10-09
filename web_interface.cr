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
      output.send "pong" if message == "ping"
    end
  end
end

get "/" do
  File.read("public/index.html")
end

hot_reload = SocketBroadcaster.new

FSWatch.watch "." do |event|
  hot_reload.broadcast("hot reload")
end

ws "/hot-reload" do |socket|
  hot_reload.register socket
end

event_stream = Mosquito::Inspector.event_receiver
event_stream_clients = EventStream.new

def message_formatter(message : Mosquito::Backend::BroadcastMessage) : String
 {
   :channel => message.channel,
   :message => message.message
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

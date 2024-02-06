require "kemal"
require "fswatch"
require "mosquito"

Mosquito.configure do |settings|
  settings.idle_wait = 10.seconds
  settings.redis_url = "redis://localhost:6379/2"
end

Log.setup do |s|
  backend = Log::IOBackend.new
  # s.bind "redis.*", :trace, backend
  s.bind "mosquito.*", :debug, backend
end

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

    when %r|overseer\((.*)\)/executors|

    when /executor\((.*)\)/
      id = $~[1]
      executor = Mosquito::Inspector.executor(id)

      socket.send({
        type: "executor-detail",
        executor: { id: id, current_job: executor.current_job }
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

get "/overseers" do
  overseers = Mosquito::Inspector::Overseer.all
  {
    overseers: overseers.map(&.instance_id)
  }.to_json
end

get "/overseers/:id" do |env|
  id = env.params.url["id"]
  overseer = Mosquito::Inspector::Overseer.new(id)
  {
    id: id,
    last_active_at: overseer.last_heartbeat.to_s,
  }.to_json
end

get "/overseers/:id/executors" do |env|
  id = env.params.url["id"]
  format_executor = ->(executor : Mosquito::Inspector::Executor) do
    {
      id: executor.instance_id,
      current_job: executor.current_job,
      current_job_queue: executor.current_job_queue
    }
  end

  overseer = Mosquito::Inspector::Overseer.new(id)
  {
    id: id,
    executors: overseer.executors.map(&format_executor)
  }.to_json
end

get "/executors/:id" do |env|
  id = env.params.url["id"]
  executor = Mosquito::Inspector::Executor.new(id)
  {
    executor: {
      id: id,
      current_job: executor.current_job,
    }
  }.to_json
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

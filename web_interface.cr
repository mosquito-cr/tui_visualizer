require "kemal"
require "fswatch"
require "mosquito"

class Dispatcher(T)
  @output = [] of Channel(T)

  def initialize(@input : Channel(T))
  end

  def initialize()
    @input = Channel(T).new
  end

  def allocate
    Channel(T).new.tap {|c| @output << c }
  end

  def release(c)
    @output.delete(c)
  end

  def broadcast(message)
    @output.each(&.send message)
  end
end

get "/" do
  File.read("public/index.html")
end


hot_reload = Dispatcher(String).new

FSWatch.watch "." do |event|
  hot_reload.broadcast("hot reload")
end

ws "/hot_reload" do |socket|
  my_channel = hot_reload.allocate
  socket.on_close { hot_reload.release my_channel }
  loop { socket.send my_channel.receive }
end

event_stream = Mosquito::Inspector.event_receiver
event_stream_clients = Dispatcher.new(event_stream)

ws "/events" do |socket|
  my_channel = event_stream_clients.allocate
  puts "client connected to /events socket... "

  socket.on_close do
    event_stream_clients.release my_channel
    puts "client disconnected from /events socket... "
  end

  loop { socket.send my_channel.receive }
end

Kemal.run

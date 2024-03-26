require "./current"
require "./event_stream"
require "./socket_broadcaster"

require "./api/*"

Current.global(tab : Symbol = :none)

module Mosquito::InspectWeb
  macro render(file)
    ::render({{ __DIR__ }} + "/views/" + {{ file }}, {{ __DIR__ }} + "/views/layout.html.ecr")
  end
end

require "./http/overseers"
require "./http/queues"
require "./http/events"
require "./http/hot_reload"

before_all do
  Current.reset
end


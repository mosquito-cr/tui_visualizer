require "kemal"
require "mosquito"

require "./init"

require "./src/current"
require "./src/event_stream"
require "./src/socket_broadcaster"

require "./src/http/*"
require "./src/api/*"

Current.global(tab : Symbol = :none)

before_all do
  Current.reset
end

Kemal.run

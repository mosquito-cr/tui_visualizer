require "kemal"
require "mosquito"

require "./init"

require "./src/socket_broadcaster"
require "./src/event_stream"

require "./src/http/*"
require "./src/api/*"

class Current
  @@instances : Hash(UInt64, Current) = {} of UInt64 => self
  def self.instance : self
    @@instances[Fiber.current.hash] ||= new
  end

  def reset
  end

  def self.reset
    instance.reset
  end

  macro global(declaration)
    def self.{{declaration.var}}
      instance.{{declaration.var}}
    end

    def self.{{declaration.var}}=(value)
      instance.{{declaration.var}} = value
    end

    def reset
      previous_def
      @{{declaration.var}} = {{declaration.value}}
    end

    property {{ declaration.var }} : {{declaration.type}} = {{declaration.value}}
  end

  global tab : Symbol = :none
end

before_all do
  Current.reset
end

Kemal.run

get "/queues" do |env|
  queues = Mosquito::Api::Queue.all
  render "src/views/queues.html.ecr", "src/views/layout.html.ecr"
end

get "/queues/:id" do |env|
  queue = Mosquito::Api::Queue.new env.params.url["id"]
  render "src/views/queue.html.ecr", "src/views/layout.html.ecr"
end

get "/job_run/:id" do |env|
  job_id = env.params.url["id"]
  job = Mosquito::Api::JobRun.new job_id

  unless job.found?
    env.response.status = HTTP::Status::UNAUTHORIZED
  end

  render "src/views/job.html.ecr", "src/views/layout.html.ecr"
end

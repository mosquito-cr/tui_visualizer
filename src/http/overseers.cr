get "/overseers" do |env|
  Current.tab = :overseers
  render "src/views/overseers.html.ecr", "src/views/layout.html.ecr"
end

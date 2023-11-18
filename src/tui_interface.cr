# ┌───┐
# │   │
# ├───┼─
# │   │
# └───┘

require "keimeno"
require "./tui_interface/*"

class MosquitoInterface < Keimeno::Base
  @queues : Array(Mosquito::Inspector::Queue)
  @last_update : Time

  def initialize
    @full_screen = true
    @queues = [] of Mosquito::Inspector::Queue
    @runners = [] of Mosquito::Inspector::Runner
    @last_update = Time::UNIX_EPOCH
  end

  INTERVAL = 0.2.seconds

  # In this case, input comes from the mosquito api, not from the keyboard
  def wait_for_input
    now = Time.utc
    dwell = now - @last_update

    if dwell > INTERVAL
      @last_update = now

      Mosquito::Inspector.list_queues
        .reject { |q| @queues.includes? q }
        .each { |q| @queues.push q }

      Mosquito::Inspector.list_runners
        .reject { |runner| @runners.includes? runner }
        .each { |runner| @runners.push runner }
    else
      sleep_time = INTERVAL - dwell
      sleep sleep_time
    end
  end

  def display
    banner

    List.render("#{@runners.size} Runners: ", @runners) do |runner|
      "#{runner.name[-4..]} #{runner.last_active} #{runner.status}"
    end

    puts

    List.render("#{@queues.size} Queues:", @queues) do |queue|
      s = queue.name
      s += ' '

      {% for name in ["scheduled", "waiting", "pending", "dead"] %}
        s += {{ name }}[0].upcase
        s += queue.{{name.id}}_job_runs.size.to_s
        s += ' '
      {% end %}

      s
    end

      # tasks = [] of Mosquito::Inspector::Task


      # last_index = tasks.size - 1
      # tasks.each_with_index do |task, index|
      #   puts "#{task.id} (#{task.type}, #{task.status}" #, enqueued #{decode_time_ago task.enqueue_time})"
      # end

      # puts "│"
    puts
  end

  def banner
    puts "┌───────────────────────────────────────┐"
    puts "│ Mosquito Primitive Backend Visualizer │"
    puts "└───────────────────────────────────────┘"
  end

  def decode_time_ago(time)
    time_ago = Time.utc - time

    if time_ago < 3.seconds
      "just now"
    elsif time_ago < 1.hour
      "#{time_ago.to_i} seconds ago"
    elsif time_ago < 1.day
      "#{time_ago.hours} hours ago"
    elsif time_ago < 1.week
      "#{time_ago.days} days ago"
    elsif time_ago < 4.weeks
      "#{time_ago.days / 7} weeks ago"
    elsif time_ago < 52.weeks
      "#{time_ago.days / 30} months ago"
    else
      "#{time_ago.days / 365} years ago"
    end
  end
end

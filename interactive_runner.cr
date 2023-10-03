require "mosquito"

Mosquito.configure do |settings|
  settings.redis_url = (ENV["REDIS_URL"]? || "redis://localhost:6379")
  # settings.run_from = ["default"]
end

Log.setup(:debug)

class ShortLivedRunner < Mosquito::Runner
  @run_start : Time = Time::UNIX_EPOCH
  property run_duration = 3.seconds
  property run_forever = false

  def start
    @run_start = Time.utc

    run

    loop do
      sleep 1

      break unless keep_running?
    end

    stop
  end

  def current_run_length
    Time.utc - @run_start
  end

  def keep_running?
    run_forever || current_run_length < @run_duration
  end
end

class LongJob < Mosquito::QueuedJob
  def perform
    log "It only takes me 1 second to do this"
    sleep 1
  end
end

class EveryThreeSecondsJob < Mosquito::PeriodicJob
  run_every 3.seconds

  def perform
    log "I'm running every 3 seconds, taking 1 second"
    sleep 1
  end
end

runner = ShortLivedRunner.new

loop do
  count = 10
  duration = 3.seconds

  print <<-MENU
  1. Enqueue a job
  2. Run worker for #{duration.seconds} seconds
  3. Enqueue #{count} jobs
  4. Run worker indefinitely

  Choose: 
  MENU

  choice = gets

  next if choice.nil?

  case choice.chomp
  when "1"
    puts "Enqueuing a three second job."
    LongJob.new.enqueue

  when "2"
    puts "Running worker for #{duration.seconds} seconds."

    runner.run_forever = false
    runner.run_duration = duration
    runner.start

  when "3"
    puts "Enqueuing #{count} jobs."
    count.times do
      LongJob.new.enqueue
    end

  when "4"
    puts "Running worker indefinitely."
    runner.run_forever = true
    runner.start

  else
    puts "Invalid choice"
  end
end

class List
  def self.render(title, collection, *, indent = 0)
    count = collection.size
    prefix = "│" * indent

    puts title

    collection.each.with_index do |e, i|
      if i == count - 1
        print "└"
      else
        print "├"
      end

      print yield e
      puts
    end
  end
end

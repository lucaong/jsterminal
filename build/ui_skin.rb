ui_js = File.new(ARGV.first || "./src/ui/ui.js", "r")
ui_markup = File.new(ARGV[1] || "./src/ui/ui.html", "r")
ui_skin = File.new(ARGV[2] || "./tmp/ui_skin.js", "w")

ui_skin.write ui_js.read.gsub("!!BUILDER-WILL-SUBSTITUTE-UI-HTML-HERE!!", ui_markup.read.gsub('"', '\"').gsub(/([^\\])\\([^\\"])/, '\\1\\\\\\\\\\\\\2').gsub("\n", "").gsub(/\s+/, " ").gsub(/>\s+</, "><"))
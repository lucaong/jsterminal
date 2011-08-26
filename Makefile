all: ./dist/jsterminal.js

./tmp/ui_skin.js : ./src/ui/ui.js ./src/ui/ui.html
	ruby ./build/ui_skin.rb

./dist/jsterminal.js : ./src/core.js ./tmp/ui_skin.js ./src/basic_commands.js ./src/commands.js ./src/boot.js
	mkdir -p ./dist
	cat ./src/core.js ./tmp/ui_skin.js ./src/basic_commands.js ./src/commands.js ./src/boot.js > ./dist/jsterminal.js
	cp ./src/index.html ./dist/index.html

./dist/jsterminal.min.js : ./dist/jsterminal.js
	uglifyjs -o ./dist/jsterminal.min.js ./dist/jsterminal.js

clean:
	rm -rf ./dist

minify: ./dist/jsterminal.min.js

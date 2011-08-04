all: ./dist/jsterminal.js

./dist/jsterminal.js : ./src/core.js ./src/skin.js ./src/basic_commands.js ./src/commands.js ./src/boot.js
	mkdir -p ./dist
	cat ./src/core.js ./src/skin.js ./src/basic_commands.js ./src/commands.js ./src/boot.js > ./dist/jsterminal.js
	cp ./src/index.html ./dist/index.html

./dist/jsterminal.min.js : ./dist/jsterminal.js
	uglifyjs -o ./dist/jsterminal.min.js ./dist/jsterminal.js

clean:
	rm -rf ./dist

minify: ./dist/jsterminal.min.js

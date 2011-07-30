all: ./dist/jsterminal.js

./dist/jsterminal.js : ./src/core.js ./src/commands.js ./src/skin.js
	mkdir -p ./dist
	cat ./src/core.js ./src/commands.js ./src/skin.js > ./dist/jsterminal.js
	cp ./src/index.html ./dist/index.html

./dist/jsterminal.min.js : ./dist/jsterminal.js
	uglifyjs -o ./dist/jsterminal.min.js ./dist/jsterminal.js

clean:
	rm -rf ./dist

minify: ./dist/jsterminal.min.js

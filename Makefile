./dist/jsterminal.js : ./src/core.js ./src/commands.js ./src/skin.js
	mkdir -p ./dist
	cat ./src/core.js ./src/commands.js ./src/skin.js > ./dist/jsterminal.js
	cp ./src/index.html ./dist/index.html

clean:
	rm -rf ./dist
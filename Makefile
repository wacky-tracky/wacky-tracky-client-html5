dist:
	parcel build src/index.html --target=browser --no-content-hash
	mv dist/src.*.js dist/src.js
	mv dist/src.*.js.map dist/src.js.map
	mv dist/style.*.css dist/style.css
	mv dist/style.*.css.map dist/style.css.map

clean:
	rm -rf dist

.PHONY: dist

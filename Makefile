dist:
	parcel build src/index.html --target=browser --no-content-hash
	cp src/robots.txt dist/robots.txt
	mkdir dist/wallpapers
	cp wallpapers/* dist/wallpapers/

clean:
	rm -rf dist

.PHONY: dist

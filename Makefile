dist:
	parcel build --public-url "/dist" src/index.html --target=browser

clean:
	rm -rf dist

.PHONY: dist

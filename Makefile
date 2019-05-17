dist:
	parcel build src/index.html --target=browser --no-content-hash

clean:
	rm -rf dist

.PHONY: dist

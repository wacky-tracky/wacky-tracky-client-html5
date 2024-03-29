dist:
	rm -rf dist
	parcel build src/index.html --no-content-hash
	cp src/robots.txt dist/robots.txt
	mkdir -p dist/wallpapers
	cp wallpapers/* dist/wallpapers/ || :
	ln -sf dist build
	cd dist && tar cavf ../webui.tgz .

docker: container

contianer: dist
	buildah bud .

clean:
	rm -rf dist

.PHONY: dist

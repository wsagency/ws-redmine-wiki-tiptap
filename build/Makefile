.PHONY: build watch clean install

install:
	npm install

build: install
	npm run build

watch: install
	npm run watch

clean:
	rm -rf node_modules
	rm -f ../assets/javascripts/wiki_tiptap.bundle.js

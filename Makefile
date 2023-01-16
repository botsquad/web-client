BUBBLE_PATH=../../bubble

release:
	vsntool bump_patch || :
	npm run build && npm publish

.PHONY: dev

dev:
	npm run dev

external-types:
	(cd $(BUBBLE_PATH); mix action_json_schema) | node_modules/.bin/json2ts > src/action_types.ts
	(cd $(BUBBLE_PATH); mix show_json_schema) | node_modules/.bin/json2ts --ignoreMinAndMaxItems > src/show_types.ts

release:
	vsntool bump_patch || :
	npm run build && npm publish

.PHONY: dev

dev:
	npm run dev

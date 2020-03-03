release:
	vsntool bump_patch || :
	npm run build && npm publish

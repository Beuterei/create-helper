publish:
	npx np "$(npm pkg get version | sed 's/\"//g')" --no-publish
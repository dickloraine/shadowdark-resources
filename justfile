set windows-shell := ["powershell.exe", "-NoLogo", "-Command"]

build: build-all-markdown build-html-standalone build-html-standalone-images build-pdf

build-all-markdown: build-markdown build-markdown-images build-markdown-split build-markdown-split-images build-markdown-obsidian build-markdown-obsidian-images

build-all-html: build-html-standalone build-html-standalone-images build-html build-html-images

dev:
    uv run .\convert.py html -i --dry-run ./dist/dev
    npm run --prefix ./app dev

build-markdown:
    uv run convert.py markdown dist/markdown

build-markdown-images:
    uv run convert.py markdown -ic dist/markdown-images

build-markdown-split:
    uv run convert.py markdown -s --no-single-file dist/markdown-split

build-markdown-split-images:
    uv run convert.py markdown -isc --no-single-file dist/markdown-split-images

build-markdown-obsidian:
    uv run convert.py markdown -so --alternative-layout --no-uppercase-headers --header-level 2 dist/markdown-obsidian

build-markdown-obsidian-images:
    uv run convert.py markdown -isco --alternative-layout --no-uppercase-headers --header-level 2 dist/markdown-obsidian-images

build-html:
    uv run .\convert.py html dist/html

build-html-images:
    uv run .\convert.py html -i dist/html-images

build-html-standalone:
    uv run .\convert.py html -a dist/html-standalone

build-html-standalone-images:
    uv run .\convert.py html -ai dist/html-standalone-images

build-pdf:
    uv run .\convert.py pdf dist/pdf

deploy:
    uv run .\convert.py html -i -b /shadowdark-resources/ --dry-run ./dist/dev
    npm run --prefix ./app deploy

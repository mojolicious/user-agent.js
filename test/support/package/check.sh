#!/bin/sh
# Install the packed package into an empty project and use it the way consumers will
set -eu

root=$(pwd)
dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT

npm run clean
npm run build
npm pack --pack-destination "$dir"

cp test/support/package/app.js test/support/package/app.ts test/support/package/browser.ts \
  test/support/package/tsconfig.json "$dir"
cd "$dir"
npm init -y > /dev/null
npm pkg set type=module
npm install --no-audit --no-fund ./mojojs-user-agent-*.tgz "@types/node@$(node -p 'process.versions.node.split(".")[0]')" \
  "typescript@$(node -p "require('$root/node_modules/typescript/package.json').version")" \
  "esbuild@$(node -p "require('$root/node_modules/esbuild/package.json').version")"

npx tsc -p tsconfig.json
npx tsc -p tsconfig.json --module preserve --moduleResolution bundler
node app.js
node app.ts

# Browsers get their own types and a bundle without Node.js modules
npx tsc --ignoreConfig --noEmit --strict --target ES2023 --module preserve --moduleResolution bundler --customConditions browser \
  --lib ESNext,DOM browser.ts
npx esbuild browser.ts --bundle --format=esm --platform=browser --outfile=browser.js
echo 'Browser consumer works'

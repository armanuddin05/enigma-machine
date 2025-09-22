#!/bin/bash
set -e

echo "Building Next.js static site..."
rm -rf out
npm run build

echo "Deploying to gh-pages branch..."
git add -A
git commit -m "Temp commit for build" || echo "No changes to commit"
git push origin main

git checkout --orphan gh-pages
git reset --hard
cp -r out/* .
git add .
git commit -m "Deploy static site"
git push -f origin gh-pages

git checkout main
echo "Deployment complete!"

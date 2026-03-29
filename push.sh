#!/bin/bash
# Push vers GitHub - Create France Nuxt
# Usage: bash push.sh "ton message de commit"

cd "D:\SiteWebCreateFrance-nuxt"

git add .
git commit -m "${1:-Update}"
git push origin main

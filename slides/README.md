

mkdir slides
cd slides
yarn init
yarn add --dev @marp-team/marp-cli

slides/package.json:
{
  "name": "slides",
  "version": "1.0.0",
  "license": "MIT",
  "scripts": {
    "slides": "marp '../README.md' -o slides.html"
  },
  "devDependencies": {
    "@marp-team/marp-cli": "^0.23.0"
  }
}


README.md:
---
marp: true
theme: default
class: invert
---

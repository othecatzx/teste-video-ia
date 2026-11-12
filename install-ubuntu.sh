#!/usr/bin/env bash
set -euo pipefail
sudo apt-get update
sudo apt-get install -y ffmpeg python3-pil espeak-ng fonts-dejavu-core
node --version
node src/generate.mjs --doctor

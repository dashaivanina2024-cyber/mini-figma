#!/bin/bash

cd "$(dirname "$0")" || exit 1

for node_dir in "$HOME"/.local/node-*/bin /opt/homebrew/bin /usr/local/bin; do
  [ -d "$node_dir" ] && PATH="$node_dir:$PATH"
done
export PATH

if ! command -v npm >/dev/null 2>&1; then
  echo "Node.js не найден. Установи с https://nodejs.org и запусти снова."
  read -n 1 -s -r -p "Нажми любую клавишу, чтобы закрыть..."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Устанавливаю зависимости..."
  npm install
fi

npm run dev

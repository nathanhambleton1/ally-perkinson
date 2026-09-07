#!/usr/bin/env bash
# Local preview:  ./serve.sh   →  http://localhost:4000
cd "$(dirname "$0")" || exit 1
PORT="${1:-4000}"
echo "→ http://localhost:$PORT"
exec python3 -m http.server "$PORT" --bind 127.0.0.1

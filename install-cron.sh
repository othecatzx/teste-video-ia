#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
NODE="$(command -v node)"
mkdir -p "$ROOT/logs" "$ROOT/output"
# São Paulo clock, run three times daily; flock prevents overlap
CRON="CRON_TZ=America/Sao_Paulo
0 9,15,21 * * * /usr/bin/flock -n $ROOT/.render.lock /bin/bash -lc 'cd \"$ROOT\" && \"$NODE\" src/generate.mjs >> logs/cron.log 2>&1'"
(crontab -l 2>/dev/null | sed '/# fabrica-terror-2d start/,/# fabrica-terror-2d end/d'; echo '# fabrica-terror-2d start'; printf '%s\n' "$CRON"; echo '# fabrica-terror-2d end') | crontab -
echo 'Cron instalado: 09:00, 15:00 e 21:00 (America/Sao_Paulo). Verifique o timezone do cron da sua distribuição.'

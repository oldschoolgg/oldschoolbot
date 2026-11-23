#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/deploy-config.sh"
deploy_load_config

declare -A colours=(
	['.log']='\033[0;32m'
	['.debug.log']='\033[0;35m'
	['.err']='\033[0;31m'
)
reset='\033[0m'

prefix_log() {
	local file="$1" colour="$2" name
	name="$(basename "$file")"
	tail -n 0 -F -- "$file" 2>&1 | while IFS= read -r line; do
		if [[ -t 1 ]]; then
			printf '%b%s:%b %s\n' "$colour" "$name" "$reset" "$line"
		else
			printf '%s: %s\n' "$name" "$line"
		fi
	done
}

for suffix in '.err' '.log' '.debug.log'; do
	file="${LOG_DIR}/${BOT_NAME}${suffix}"
	touch "$file"
	prefix_log "$file" "${colours[$suffix]}" &
done

wait

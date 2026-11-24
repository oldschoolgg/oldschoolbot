#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/deploy-config.sh"

backup=true
watch=false
for argument in "$@"; do
	case "$argument" in
		--bk) backup=true ;;
		--nobk) backup=false ;;
		--watch) watch=true ;;
		--no-watch) watch=false ;;
		*) echo "Unknown option: $argument" >&2; exit 2 ;;
	esac
done

declare -a RESULTS=()
record() {
	RESULTS+=("$1")
	echo "$1"
}
fail() {
	printf '%s\n\t' "${RESULTS[@]}" >&2
	if [[ -t 1 && "${TERM:-dumb}" != 'dumb' ]] && tput colors >/dev/null 2>&1; then
		printf '\033[1;31mFAIL:\033[0m \033[0;33m%s\033[0m\n' "$1"
	else
		printf 'FAIL: %s\n' "$1"
	fi
	exit 1
}
line_count() {
	[[ -f "$1" ]] && wc -l < "$1" || printf '0\n'
}
show_new_errors() {
	local old_count="$1" file="${LOG_DIR}/${BOT_NAME}.err" now_count
	now_count="$(line_count "$file")"
	if (( now_count > old_count )); then
		tail -n "$((now_count - old_count))" "$file"
	fi
}
service_state() {
	sudo systemctl show "$SERVICE_NAME" --property=ActiveState --property=SubState --property=NRestarts --no-pager
}
service_healthy() {
	[[ "$(sudo systemctl show "$SERVICE_NAME" --value --property=ActiveState)" == 'active' ]] &&
	[[ "$(sudo systemctl show "$SERVICE_NAME" --value --property=SubState)" == 'running' ]]
}
service_stopped() {
	[[ "$(sudo systemctl show "$SERVICE_NAME" --value --property=ActiveState)" == 'inactive' ]] &&
	[[ "$(sudo systemctl show "$SERVICE_NAME" --value --property=SubState)" == 'dead' ]] &&
	! sudo systemctl is-active --quiet "$SERVICE_NAME"
}

deploy_load_config || exit 1
trap 'code=$?; trap - ERR; fail "Command failed (exit $code): $BASH_COMMAND"' ERR

cwd="$(pwd -P)"
branch="$(git branch --show-current)"
dsn_ok=false
dsn_query="&${DATABASE_URL#*\?}&"
[[ "$dsn_query" == *"&${EXPECTED_APPLICATION_NAME}&"* ]] && dsn_ok=true

echo "cwd:$([[ "$cwd" == "$BOT_PATH" ]] && echo 0 || echo 1); branch:$([[ "$branch" == "$BOT_BRANCH" ]] && echo 0 || echo 1); dsn:$($dsn_ok && echo 0 || echo 1)"
[[ "$cwd" == "$BOT_PATH" ]] || fail "CWD is $cwd; expected $BOT_PATH"
[[ "$branch" == "$BOT_BRANCH" ]] || fail "Branch is $branch; expected $BOT_BRANCH"
$dsn_ok || fail "DATABASE_URL lacks $EXPECTED_APPLICATION_NAME"
record "Sanity checks passed: bot=$BOT_NAME branch=$BOT_BRANCH path=$BOT_PATH"

tracked_changes="$(git status --porcelain --untracked-files=no)"
if [[ -n "$tracked_changes" ]]; then
	preserve="preserve-$(date +%y%m%d%H%M%S)"
	git switch -c "$preserve"
	if ! git diff --cached --quiet; then
		git commit -m 'Preserve staged changes before deployment'
	fi
	if ! git diff --quiet; then
		git add -u
		git commit -m 'Preserve unstaged changes before deployment'
	fi
	git switch "$BOT_BRANCH"
	record "Preserved tracked changes: branch=$preserve conditions=tracked-modifications files=$(printf '%s' "$tracked_changes" | tr '\n' ',')"
else
	record 'No tracked changes to preserve'
fi

before_pull="$(git rev-parse HEAD)"
if ! git pull "$BOT_REMOTE" "$BOT_BRANCH"; then
	conflict="${BOT_BRANCH}-conflict-$(date +%y%m%d%H%M%S)"
	git branch "$conflict"
	fail "Pull failed; preserved conflict state on branch=$conflict"
fi
after_pull="$(git rev-parse HEAD)"
schema_changed=false
if ! git diff --quiet "$before_pull" "$after_pull" -- "$SCHEMA_PATH"; then
	schema_changed=true
fi
record "Pull complete: $BOT_REMOTE/$BOT_BRANCH schema_changed=$schema_changed"

if $backup; then
	~/scripts/cyr_backup.sh --commit="$before_pull" "$BOT_NAME"
	record "Backup complete: $BOT_NAME $before_pull"
else
	record 'Backup skipped by --nobk'
fi

if $schema_changed; then
	pnpm gen && pnpm build:packages && pnpm build:quick
else
	pnpm build:packages && pnpm build:quick
fi
record "Build complete: prisma_generate=$schema_changed"

pnpm shutdown
sleep 112
sudo systemctl status "$SERVICE_NAME" --no-pager || true
sleep 5
service_stopped || fail "Service did not stop cleanly: $(service_state)"
record "Service stopped: $SERVICE_NAME"

[[ "$(git branch --show-current)" == "$BOT_BRANCH" ]] || fail 'Branch changed before database update'
[[ "$(git rev-parse HEAD)" == "$after_pull" ]] || fail 'Commit changed before database update'

if $schema_changed; then
	pnpm prisma db push
	record 'Prisma database push complete'
else
	record 'Prisma database push skipped: schema unchanged'
fi

if $watch; then
	bash "$SCRIPT_DIR/deploy-watch.sh" &
	record "Watcher started: pid=$!"
fi

err_file="${LOG_DIR}/${BOT_NAME}.err"
err_before="$(line_count "$err_file")"
sleep 2
resets_before="$(sudo systemctl show "$SERVICE_NAME" --value --property=NRestarts)"
sudo systemctl start "$SERVICE_NAME"
record "Service start requested: $SERVICE_NAME"

sleep 3
service_state
resets_after="$(sudo systemctl show "$SERVICE_NAME" --value --property=NRestarts)"
if ! service_healthy; then
	sleep 3
	service_state
	show_new_errors "$err_before"
	resets_after="$(sudo systemctl show "$SERVICE_NAME" --value --property=NRestarts)"
fi

if (( resets_after > resets_before )); then
	sudo systemctl stop "$SERVICE_NAME"
	show_new_errors "$err_before"
	sudo systemctl reset-failed "$SERVICE_NAME"
	fail "Service restarted: $resets_before -> $resets_after"
fi
service_healthy || fail "Service is unhealthy: $(service_state)"

err_after="$(line_count "$err_file")"
if (( err_after > err_before )); then
	show_new_errors "$err_before"
	if [[ -t 1 ]]; then
		printf '\033[0;31mWARNING: %s.err gained %s line(s).\033[0m\n' "$BOT_NAME" "$((err_after - err_before))"
	else
		printf 'WARNING: %s.err gained %s line(s).\n' "$BOT_NAME" "$((err_after - err_before))"
	fi
fi
record "Deploy complete: service=$SERVICE_NAME resets=$resets_before->$resets_after"

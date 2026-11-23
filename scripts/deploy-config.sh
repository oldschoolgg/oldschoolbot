#!/usr/bin/env bash

deploy_env_value() {
	local key="$1"
	local value
	value="$(sed -n -E "s|^[[:space:]]*${key}[[:space:]]*=[[:space:]]*(.*)[[:space:]]*$|\\1|p" .env | tail -n 1)"
	value="${value#\"}"
	value="${value%\"}"
	value="${value#\'}"
	value="${value%\'}"
	printf '%s' "$value"
}

deploy_load_config() {
	[[ -f .env ]] || { echo 'Missing .env' >&2; return 1; }

	BOT_NAME="$(deploy_env_value BOT_NAME)"
	DATABASE_URL="$(deploy_env_value DATABASE_URL)"

	case "$BOT_NAME" in
		neo)
			BOT_PATH='/home/cyr/neobso'
			BOT_BRANCH='main'
			BOT_REMOTE='cyr'
			;;
		bso)
			BOT_PATH='/home/cyr/bso'
			BOT_BRANCH='bso'
			BOT_REMOTE='origin'
			;;
		osb)
			BOT_PATH='/home/cyr/osb'
			BOT_BRANCH='master'
			BOT_REMOTE='origin'
			;;
		*)
			echo "Unsupported BOT_NAME: ${BOT_NAME:-<empty>}" >&2
			return 1
			;;
	esac

	SCHEMA_PATH='prisma/schema.prisma'
	SERVICE_NAME="${BOT_NAME}.service"
	LOG_DIR="$HOME/logs"
	EXPECTED_APPLICATION_NAME="application_name=prisma-${BOT_NAME}"
}

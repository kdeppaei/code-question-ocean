#!/usr/bin/env bash
set -euo pipefail

JUDGE0_VERSION="1.13.1"
INSTALL_DIR="/opt/judge0"

if [[ "$(uname -s)" != "Linux" ]] || ! grep -q 'Ubuntu 22.04' /etc/os-release; then
  echo "This installer requires Ubuntu 22.04 LTS." >&2
  exit 1
fi
if [[ "${EUID}" -ne 0 ]]; then
  echo "Run with sudo: sudo bash setup.sh" >&2
  exit 1
fi
if [[ -e "${INSTALL_DIR}" ]]; then
  echo "${INSTALL_DIR} already exists; refusing to overwrite it." >&2
  exit 1
fi
for command in docker curl unzip openssl sed; do
  command -v "${command}" >/dev/null || { echo "Missing command: ${command}" >&2; exit 1; }
done
docker compose version >/dev/null

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf -- "${TEMP_DIR}"' EXIT
curl --fail --location --silent --show-error \
  "https://github.com/judge0/judge0/releases/download/v${JUDGE0_VERSION}/judge0-v${JUDGE0_VERSION}.zip" \
  --output "${TEMP_DIR}/judge0.zip"
unzip -q "${TEMP_DIR}/judge0.zip" -d "${TEMP_DIR}/release"
SOURCE_CONF="$(find "${TEMP_DIR}/release" -maxdepth 2 -type f -name judge0.conf -print -quit)"
if [[ -z "${SOURCE_CONF}" ]]; then
  echo "Downloaded archive does not contain judge0.conf." >&2
  exit 1
fi
SOURCE_DIR="$(dirname "${SOURCE_CONF}")"
install -d -m 0750 "${INSTALL_DIR}"
cp -a "${SOURCE_DIR}/." "${INSTALL_DIR}/"

REDIS_PASSWORD="$(openssl rand -hex 32)"
POSTGRES_PASSWORD="$(openssl rand -hex 32)"
SECRET_KEY_BASE="$(openssl rand -hex 64)"
AUTHN_TOKEN="$(openssl rand -hex 32)"

sed -i \
  -e "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=${REDIS_PASSWORD}|" \
  -e "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=${POSTGRES_PASSWORD}|" \
  -e "s|^SECRET_KEY_BASE=.*|SECRET_KEY_BASE=${SECRET_KEY_BASE}|" \
  -e "s|^AUTHN_HEADER=.*|AUTHN_HEADER=X-Auth-Token|" \
  -e "s|^AUTHN_TOKEN=.*|AUTHN_TOKEN=${AUTHN_TOKEN}|" \
  -e "s|^ALLOW_ENABLE_NETWORK=.*|ALLOW_ENABLE_NETWORK=false|" \
  -e "s|^ENABLE_NETWORK=.*|ENABLE_NETWORK=false|" \
  -e "s|^ENABLE_COMPILER_OPTIONS=.*|ENABLE_COMPILER_OPTIONS=false|" \
  -e "s|^ENABLE_COMMAND_LINE_ARGUMENTS=.*|ENABLE_COMMAND_LINE_ARGUMENTS=false|" \
  -e "s|^ENABLE_CALLBACKS=.*|ENABLE_CALLBACKS=false|" \
  -e "s|^ENABLE_ADDITIONAL_FILES=.*|ENABLE_ADDITIONAL_FILES=true|" \
  -e "s|^MAX_EXTRACT_SIZE=.*|MAX_EXTRACT_SIZE=2048|" \
  -e "s|^MAX_CPU_TIME_LIMIT=.*|MAX_CPU_TIME_LIMIT=5|" \
  -e "s|^MAX_WALL_TIME_LIMIT=.*|MAX_WALL_TIME_LIMIT=8|" \
  -e "s|^MAX_MEMORY_LIMIT=.*|MAX_MEMORY_LIMIT=256000|" \
  "${INSTALL_DIR}/judge0.conf"

chmod 0600 "${INSTALL_DIR}/judge0.conf"
cd "${INSTALL_DIR}"
docker compose up -d db redis
sleep 10
docker compose up -d

cat <<EOF
Judge0 v${JUDGE0_VERSION} is running locally.
Reverse-proxy it behind HTTPS, then configure CodeDive with:
  JUDGE0_API_URL=https://judge.example.com
  JUDGE0_AUTH_HEADER=X-Auth-Token
  JUDGE0_AUTH_TOKEN=${AUTHN_TOKEN}
Keep this token private.
EOF

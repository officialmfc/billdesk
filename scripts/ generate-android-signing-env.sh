#!/usr/bin/env bash
set -euo pipefail

KEYSTORE_FILE="${1:-manager-release.keystore}"
ALIAS="${2:-manager-release}"

if ! command -v keytool >/dev/null 2>&1; then
  echo "keytool not found. Install a JDK first." >&2
  exit 1
fi

if [ -f "$KEYSTORE_FILE" ]; then
  echo "Keystore already exists: $KEYSTORE_FILE"
else
  echo "Creating keystore: $KEYSTORE_FILE"
  keytool -genkeypair \
    -v \
    -storetype PKCS12 \
    -keystore "$KEYSTORE_FILE" \
    -alias "$ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000
fi

printf "Enter ANDROID_KEYSTORE_PASSWORD: "
stty -echo
read -r STORE_PASSWORD
stty echo
printf "\n"

printf "Enter ANDROID_KEY_PASSWORD: "
stty -echo
read -r KEY_PASSWORD
stty echo
printf "\n"

if base64 --help >/dev/null 2>&1; then
  KEYSTORE_BASE64="$(base64 < "$KEYSTORE_FILE" | tr -d '\n')"
else
  KEYSTORE_BASE64="$(openssl base64 -in "$KEYSTORE_FILE" -A)"
fi

cat <<EOF

Paste these into GitHub Secrets or Variables:

ANDROID_KEYSTORE_BASE64=$KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD=$STORE_PASSWORD
ANDROID_KEY_ALIAS=$ALIAS
ANDROID_KEY_PASSWORD=$KEY_PASSWORD

EOF

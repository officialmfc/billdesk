#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
REPO_ROOT="$(cd "${APP_DIR}/../../.." && pwd)"
ANDROID_DIR="${APP_DIR}/android"
ADB_BIN="${ADB_BIN:-adb}"
PACKAGE_NAME="com.mfc.manager"
DEFAULT_KEYSTORE_PATH="${REPO_ROOT}/scripts/manager-release.keystore"
TEMP_KEYSTORE_PATH=""
ENV_FILES=(
  "${REPO_ROOT}/.env.local"
  "${REPO_ROOT}/.env"
  "${APP_DIR}/.env.local"
  "${APP_DIR}/.env"
)

cleanup() {
  if [[ -n "${TEMP_KEYSTORE_PATH}" && -f "${TEMP_KEYSTORE_PATH}" ]]; then
    rm -f "${TEMP_KEYSTORE_PATH}"
  fi
}
trap cleanup EXIT

fail() {
  echo "manager-pro: $*" >&2
  exit 1
}

trim_quotes() {
  local value="$1"

  if [[ "${value}" == \"*\" && "${value}" == *\" ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "${value}" == \'*\' && "${value}" == *\' ]]; then
    value="${value:1:${#value}-2}"
  fi

  printf '%s' "${value}"
}

load_env_key_from_file() {
  local env_file="$1"
  local key="$2"

  if [[ ! -f "${env_file}" ]]; then
    return 1
  fi

  local line value
  line="$(grep -E "^[[:space:]]*(export[[:space:]]+)?${key}=" "${env_file}" | tail -n 1 || true)"
  if [[ -z "${line}" ]]; then
    return 1
  fi

  line="${line#export }"
  value="${line#${key}=}"
  value="$(trim_quotes "${value}")"

  printf -v "${key}" '%s' "${value}"
  export "${key}"
  return 0
}

load_env_files() {
  local loaded_any=0
  local env_file
  local key

  for env_file in "${ENV_FILES[@]}"; do
    for key in \
      ANDROID_KEYSTORE_PATH \
      ANDROID_KEYSTORE_BASE64 \
      ANDROID_KEYSTORE_PASSWORD \
      ANDROID_KEY_ALIAS \
      ANDROID_KEY_PASSWORD; do
      if load_env_key_from_file "${env_file}" "${key}"; then
        loaded_any=1
      fi
    done
  done

  if [[ "${loaded_any}" -eq 1 ]]; then
    echo "manager-pro: loaded local signing env values"
  else
    echo "manager-pro: no local signing env file values found; using current process environment"
  fi
}

prompt_secret() {
  local var_name="$1"
  local prompt_label="$2"
  local value="${!var_name:-}"

  if [[ -n "${value}" ]]; then
    return 0
  fi

  printf "%s: " "${prompt_label}"
  read -r -s value
  printf "\n"

  if [[ -z "${value}" ]]; then
    fail "${prompt_label} is required."
  fi

  printf -v "${var_name}" '%s' "${value}"
  export "${var_name}"
}

decode_base64_to_file() {
  local input="$1"
  local output="$2"

  if printf '%s' "${input}" | base64 --decode >"${output}" 2>/dev/null; then
    return 0
  fi

  if printf '%s' "${input}" | base64 -d >"${output}" 2>/dev/null; then
    return 0
  fi

  if printf '%s' "${input}" | openssl base64 -d -A -out "${output}" 2>/dev/null; then
    return 0
  fi

  return 1
}

resolve_keystore_path() {
  if [[ -n "${ANDROID_KEYSTORE_PATH:-}" && -f "${ANDROID_KEYSTORE_PATH}" ]]; then
    printf '%s' "${ANDROID_KEYSTORE_PATH}"
    return 0
  fi

  if [[ -n "${ANDROID_KEYSTORE_BASE64:-}" ]]; then
    TEMP_KEYSTORE_PATH="$(mktemp "${TMPDIR:-/tmp}/manager-pro-keystore.XXXXXX")"
    if ! decode_base64_to_file "${ANDROID_KEYSTORE_BASE64}" "${TEMP_KEYSTORE_PATH}"; then
      fail "Could not decode ANDROID_KEYSTORE_BASE64."
    fi
    printf '%s' "${TEMP_KEYSTORE_PATH}"
    return 0
  fi

  if [[ -f "${DEFAULT_KEYSTORE_PATH}" ]]; then
    printf '%s' "${DEFAULT_KEYSTORE_PATH}"
    return 0
  fi

  fail "Missing keystore. Set ANDROID_KEYSTORE_PATH or place scripts/manager-release.keystore in the repo root."
}

detect_connected_device() {
  if [[ -n "${ANDROID_SERIAL:-}" ]]; then
    local device_state
    device_state="$("${ADB_BIN}" -s "${ANDROID_SERIAL}" get-state 2>/dev/null || true)"
    if [[ "${device_state}" != "device" ]]; then
      fail "Device ${ANDROID_SERIAL} is not authorized/ready. Approve the USB debugging prompt on the phone, then rerun."
    fi

    printf '%s' "${ANDROID_SERIAL}"
    return 0
  fi

  if ! command -v "${ADB_BIN}" >/dev/null 2>&1; then
    fail "adb is not available on PATH."
  fi

  local devices
  devices="$("${ADB_BIN}" devices | awk 'NR > 1 && $2 == "device" {print $1}')"
  local count
  count="$(printf '%s\n' "${devices}" | sed '/^$/d' | wc -l | tr -d ' ')"

  case "${count}" in
    0)
      fail "No connected Android device found."
      ;;
    1)
      local device_serial
      device_serial="${devices}"

      local device_state
      device_state="$("${ADB_BIN}" -s "${device_serial}" get-state 2>/dev/null || true)"
      if [[ "${device_state}" != "device" ]]; then
        fail "Device ${device_serial} is not authorized/ready. Approve the USB debugging prompt on the phone, then rerun."
      fi

      printf '%s' "${device_serial}"
      ;;
    *)
      fail "Multiple Android devices found. Set ANDROID_SERIAL to choose one."
      ;;
  esac
}

resolve_release_apk() {
  local release_dir="${ANDROID_DIR}/app/build/outputs/apk/release"
  local device_abi="${1:-}"
  local apk_path=""

  if [[ -n "${device_abi}" ]]; then
    case "${device_abi}" in
      arm64-v8a)
        if [[ -f "${release_dir}/app-arm64-v8a-release.apk" ]]; then
          apk_path="${release_dir}/app-arm64-v8a-release.apk"
        fi
        ;;
      armeabi-v7a)
        if [[ -f "${release_dir}/app-armeabi-v7a-release.apk" ]]; then
          apk_path="${release_dir}/app-armeabi-v7a-release.apk"
        fi
        ;;
      x86_64)
        if [[ -f "${release_dir}/app-x86_64-release.apk" ]]; then
          apk_path="${release_dir}/app-x86_64-release.apk"
        fi
        ;;
      x86)
        if [[ -f "${release_dir}/app-x86-release.apk" ]]; then
          apk_path="${release_dir}/app-x86-release.apk"
        fi
        ;;
    esac
  fi

  if [[ -z "${apk_path}" ]]; then
    apk_path="$(find "${release_dir}" -maxdepth 1 -type f -name 'app-*-release.apk' | sort | head -n 1 || true)"
  fi

  if [[ -z "${apk_path}" && -f "${release_dir}/app-release.apk" ]]; then
    apk_path="${release_dir}/app-release.apk"
  fi

  if [[ -z "${apk_path}" || ! -f "${apk_path}" ]]; then
    fail "Release APK not found in ${release_dir}."
  fi

  printf '%s' "${apk_path}"
}

echo "manager-pro: preparing release build"
load_env_files
prompt_secret ANDROID_KEYSTORE_PASSWORD "Enter ANDROID_KEYSTORE_PASSWORD"
prompt_secret ANDROID_KEY_ALIAS "Enter ANDROID_KEY_ALIAS"
prompt_secret ANDROID_KEY_PASSWORD "Enter ANDROID_KEY_PASSWORD"

ANDROID_KEYSTORE_PATH="$(resolve_keystore_path)"
export ANDROID_KEYSTORE_PATH

echo "manager-pro: building release APK"
(
  cd "${ANDROID_DIR}"
  ./gradlew assembleRelease
)

DEVICE_SERIAL="$(detect_connected_device)"
DEVICE_ABI="$("${ADB_BIN}" -s "${DEVICE_SERIAL}" shell getprop ro.product.cpu.abi | tr -d '\r')"
RELEASE_APK="$(resolve_release_apk "${DEVICE_ABI}")"
MANAGER_PRO_APK="${ANDROID_DIR}/app/build/outputs/apk/release/manager-pro.apk"

cp "${RELEASE_APK}" "${MANAGER_PRO_APK}"

echo "manager-pro: uninstalling existing package on ${DEVICE_SERIAL}"
"${ADB_BIN}" -s "${DEVICE_SERIAL}" uninstall "${PACKAGE_NAME}" >/dev/null 2>&1 || true

echo "manager-pro: installing production APK"
"${ADB_BIN}" -s "${DEVICE_SERIAL}" install -r -d "${MANAGER_PRO_APK}"

echo "manager-pro: launching app"
"${ADB_BIN}" -s "${DEVICE_SERIAL}" shell monkey -p "${PACKAGE_NAME}" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || true

echo "manager-pro: done"

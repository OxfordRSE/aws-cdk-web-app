#!/bin/bash

set -e

# Default to empty
PROFILE=""
ARGS=()

# Parse arguments, capture --profile
while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)
      PROFILE="$2"
      shift 2
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

# If profile was specified, export it
if [ -n "$PROFILE" ]; then
  export AWS_PROFILE="$PROFILE"
  echo "[INFO] Using AWS_PROFILE=$AWS_PROFILE"
else
  echo "[ERROR] No profile specified. Make sure to use --profile <profile_name> in the command."
  exit 1
fi

# Call CDK with rest of args
npx cdk "${ARGS[@]}"

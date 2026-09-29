#!/usr/bin/env bash
# Prints an xcconfig overriding Base.xcconfig with the MORNI_* values that are set
# in the environment (GitHub repository variables in CI). Empty values are skipped
# so the defaults in Base.xcconfig still apply.
set -euo pipefail
for name in MORNI_BUNDLE_ID MORNI_APP_GROUP MORNI_TEAM_ID MORNI_WEB_DOMAIN MORNI_SUPABASE_HOST \
            MORNI_SUPABASE_ANON_KEY MORNI_REVENUECAT_KEY MORNI_GOOGLE_CLIENT_ID MORNI_GOOGLE_REVERSED_CLIENT_ID; do
  value="${!name:-}"
  if [[ -n "$value" ]]; then
    # xcconfig treats "//" as a comment: hosts must be given without a scheme.
    value="${value#https://}"
    echo "$name = $value"
  fi
done

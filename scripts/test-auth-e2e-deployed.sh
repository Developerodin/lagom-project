#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${TEST_BASE_URL:-}" ]]; then
  echo "Set TEST_BASE_URL to your deployed HTTPS origin, e.g.:"
  echo "  TEST_BASE_URL=https://studiolagomdesign.com npm run test:auth-e2e:deployed"
  exit 1
fi

export TEST_EXPECT_PRODUCTION=1
npm run test:auth-e2e

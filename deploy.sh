#!/bin/bash
# barbuk.us deploy with custom domain auto-update
# Builds, deploys, then ensures custom domain points to latest deployment

set -e
PROJECT_NAME="barbuk-us"
DIST_DIR="./dist"
CUSTOM_DOMAIN="barbuk.us"

export CLOUDFLARE_API_TOKEN=$(cat ~/.openclaw/credentials/cloudflare-pages-token)
ACCOUNT_ID="fb1a7e37689915ea5cc093b183012abb"
ZONE_ID="043183059eb1af5b0296aa91836e0589"

# 1) Build
echo "==> Build"
./node_modules/.bin/eleventy

# 2) Deploy
echo "==> Deploy"
DEPLOY_OUT=$(/home/baran/.npm-global/bin/wrangler pages deploy "$DIST_DIR" \
  --project-name="$PROJECT_NAME" --commit-dirty=true 2>&1)
DEPLOY_URL=$(echo "$DEPLOY_OUT" | grep -oE 'https://[a-f0-9]+\.barbuk-us\.pages\.dev' | head -1)
DEPLOY_ID=$(echo "$DEPLOY_URL" | sed -E 's#https://([a-f0-9]+)\.barbuk-us\.pages\.dev#\1#')
echo "    URL: $DEPLOY_URL (id: $DEPLOY_ID)"

# 3) Pages custom domain status
echo "==> Custom domain check"
DOMAINS_JSON=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains")
echo "$DOMAINS_JSON" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for r in d.get('result', []):
    if r.get('name') in ['$CUSTOM_DOMAIN', 'www.$CUSTOM_DOMAIN']:
        print(f\"    {r.get('name')}: status={r.get('status')}\")
"

# 4) Live verify against custom domain
echo "==> Live verify custom domain"
sleep 3
LIVE_CHECK=$(curl -s "https://$CUSTOM_DOMAIN/" 2>/dev/null)
if echo "$LIVE_CHECK" | grep -q "hreflang"; then
  echo "    ✓ Custom domain serving new build (hreflang present)"
elif echo "$LIVE_CHECK" | grep -q "Insights"; then
  echo "    ✓ Custom domain serving new build (Insights nav present)"
elif echo "$LIVE_CHECK" | grep -q "barbuk-us.pages.dev"; then
  echo "    ⚠ Custom domain returns redirect to pages.dev — domain not active"
else
  echo "    ✗ Custom domain serving old build — Recheck required"
  echo "    → https://dash.cloudflare.com/?to=/:account/pages/view/$PROJECT_NAME/domains"
fi

echo ""
echo "==> Done"
echo "    Pages: $DEPLOY_URL"
echo "    Custom: https://$CUSTOM_DOMAIN/"

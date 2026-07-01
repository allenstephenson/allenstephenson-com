# Midwest City Resource Directory Demo Maintenance

This is a static concept demo, not an official city service. Resource records live in `data/midwest-city-resources.json` and are rendered by `resource-directory.js` on `resource-directory.html`.

## Update workflow

1. Edit `data/midwest-city-resources.json`.
2. Prefer official or authoritative sources: provider websites, City of Midwest City, Oklahoma County, Oklahoma state agencies, 211/HeartLine, schools, hospitals, and established nonprofits.
3. Use original plain-English descriptions; do not copy proprietary directory text.
4. Set `lastVerified` to the date the source was checked in `YYYY-MM-DD` format.
5. Use `confidence` values consistently:
   - `High`: official provider/government page confirms the core details.
   - `Medium`: authoritative secondary source or partial official confirmation.
   - `Low`: needs direct provider confirmation before use in a production directory.
6. Run validation and link checks before publishing.

## Checks

```bash
node scripts/validate-resources.mjs
node scripts/check-resource-links.mjs
```

The link checker depends on provider websites being reachable from the current environment. A failed link check may indicate a real broken link, a temporary outage, bot protection, or a server that blocks automated `HEAD`/`GET` requests.

## Publishing

This repository is a static Cloudflare Pages site. Commit changes to the configured branch and let Cloudflare Pages publish from the repository. If a direct deploy command is later added, document it here.

## Human verification priorities

Before using this as a production civic service, a human reviewer should confirm phone numbers, hours, eligibility rules, intake procedures, ADA/language accessibility, and whether organizations want to be listed.

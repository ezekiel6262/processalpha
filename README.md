# ProcessAlpha

ProcessAlpha is an outcome-blind trading-process journal. It separates decision quality from profit and loss, scores only pre-committed process checks, identifies recurring rule violations, and uses Gemini for process coaching without recommending assets, directions, prices or position sizes.

## Live product

- Production: https://processalpha.vercel.app
- Health: https://processalpha.vercel.app/api/health
- Repository: https://github.com/ezekiel6262/processalpha

## Product flow

```text
Completed trade process record
        |
        +--> deterministic process score (never based on P&L)
        +--> local-first IndexedDB journal and JSON export
        +--> /api/review --> Gemini 3.6 Flash outcome-blind coaching
```

Cloud synchronization is designed around Supabase Auth, Postgres and row-level security. Until that marketplace resource is provisioned, the production health endpoint reports the journal as `browser-local`; records remain real and exportable, but device-local.

## Production safeguards

- Gemini key is server-only in Vercel.
- The model never receives entry price, exit price or P&L.
- Structured-output schema constrains the review.
- Request-size limits, per-instance throttling and upstream timeouts.
- Security headers, structured logs and a non-secret health endpoint.
- Journal writes happen before any AI request; a model outage cannot lose the record.

## Local development

```bash
vercel link
vercel env pull .env.local --environment=production
vercel dev
```

Required secret: `GEMINI_API_KEY`.

## Privacy and limitations

Trade records currently remain inside the user's browser unless exported. Gemini receives thesis, invalidation and four process booleans, but not prices or realized outcome. ProcessAlpha provides reflection support, not financial advice.

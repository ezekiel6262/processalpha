# ProcessAlpha Submission Kit

## One-line pitch

ProcessAlpha is an outcome-blind trading decision journal that separates process quality from financial outcome, detects repeated discipline gaps, and turns them into testable rules.

## Short description

Most trading journals reward wins and punish losses, even when the decision quality says the opposite. ProcessAlpha captures a trader's original thesis, invalidation condition, and four process commitments, then calculates a transparent 100-point decision score independent of profit and loss. It uses the user's real journal history to reveal recurring process gaps, provides privacy-filtered educational feedback, and turns insights into a practical rulebook. The product works locally without an account and supports private cloud synchronization and export.

## Problem

Outcome bias makes traders confuse luck with skill. A profitable trade can reinforce bad behavior, while a disciplined loss can cause a good process to be abandoned. Existing journals commonly emphasize returns, charts, and execution statistics without preserving the quality of the original decision.

## Solution

ProcessAlpha creates a feedback loop around controllable behavior:

1. Record the thesis and invalidation condition.
2. Score risk definition, opposing evidence, confirmation, and exit discipline.
3. Display profit and loss separately from decision quality.
4. Detect recurring gaps across real records.
5. Produce an outcome-blind process review and a specific next rule.
6. Save that rule in a persistent rulebook.

## Key features

- Deterministic 100-point process score
- Decision and outcome matrix that separates luck from discipline
- Outcome-blind process review that excludes entry price, exit price, and realized profit and loss
- Real-record pattern analytics with no seeded demo data
- Persistent personal rulebook
- Local-first browser storage
- Passwordless private cloud sync with row-level security
- JSON export and user-controlled portability
- Responsive commercial interface, privacy policy, terms, health endpoint, and public source code

## AI use

AI reviews only the documented thesis, invalidation condition, process commitments, and aggregate process statistics. It is instructed not to infer market facts or recommend an asset, direction, price, or position size. The deterministic score remains independent of the model.

## Technical architecture

- Static responsive frontend deployed on Vercel
- IndexedDB local journal for account-free use
- Supabase Auth and Postgres for optional cloud sync
- Per-user row-level security on journal records
- Server-side AI request with structured JSON output, request limits, payload limits, and timeouts
- GitHub-connected production deployment

## Privacy and safety

Prices and realized outcomes are excluded from the AI review request. Secret keys remain server-side. Users can stay local, export records, delete entries, and sign out. The product explicitly states that it provides educational process coaching, not financial advice.

## Links

- Product: https://processalpha.vercel.app
- Workspace: https://processalpha.vercel.app/app
- Repository: https://github.com/ezekiel6262/processalpha
- Health: https://processalpha.vercel.app/api/health
- Privacy: https://processalpha.vercel.app/privacy
- Terms: https://processalpha.vercel.app/terms

## Suggested demo credentials

No shared credentials are required. The local journal works immediately. For cloud sync, use the presenter's own email address and hide it from the recording.

## Honest current limitation

The dedicated Supabase project must be active for passwordless sign in and cloud synchronization. Local journaling, scoring, patterns, rulebook, export, and AI process review remain independent of cloud storage.

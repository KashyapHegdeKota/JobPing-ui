# Authentication and refresh protection

The browser observes API 429/503 responses and respects Retry-After before another
request in the same operation family. The waiting state survives a reload within
the tab; the server remains authoritative across tabs/devices. Each signed-in
account has separate read/write/analytics browser cooldowns. No tokens, passwords,
queries or response bodies are saved with cooldown deadlines. Storage is bounded
and optional; blocked storage does not disable API protection.

The login dialog guards double submissions and handles Firebase throttling with
a local minimum wait, generic errors and no automatic credential/popup retries.
Provider-side abuse protection must be configured at Firebase/Identity Platform.
The SDK is called directly, so local timers cannot impose a custom global login
quota. Google sign-in and email/password provider protection are separate flows.

Feed requests preserve displayed jobs on errors, including a throttled filter
update. The display identifies pending filter updates; successful responses replace
old query results while retaining newer live observations. The Retry jobs action
requests data without a page reload and is disabled during cooldown. Companies
reference requests are coalesced and cached briefly; failed requests are not cached
as empty data. Preferences and analytics also retain their last successful data
and prevent repeated requests while cooling down.

One WebSocket is maintained for the feed independently of filters. Reconnects use
exponential delay with jitter, resetting after 30 seconds of stability. Reconnect
page refreshes coalesce with an existing first-page request. Unmount cancels owned
requests, timers and the socket. Browsers do not expose failed WebSocket handshake
HTTP headers, so stream failures use conservative backoff. There is no rapid SSE
fallback loop that could evade the shared backend stream limit.

Deploy with the coordinated sibling backend request-limits changes. Default backend
mode is off until the operator supplies a secret and enables shadow/enforce mode;
page reload limits at Vercel and provider/Oracle DDoS settings are separate operational
changes. See sibling `JobPing/docs/authentication-and-edge-protection.md` and
`JobPing/docs/deployment.md` for activation, capacity review and rollback.

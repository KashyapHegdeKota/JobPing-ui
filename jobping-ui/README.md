This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Workspace design

The public homepage implements the supplied landing HTML, including its animated
briefcase, compact navigation and account entry points. The live feed is now at
`/jobs`; update saved feed links to this route. Landing account actions reuse the
Firebase sign-in/sign-up dialog, and Daily recap opens `/profile` preferences.
Feed analytics retain their existing backend page identity.
Successful Google or email authentication from the landing page opens `/jobs`.
Closing the dialog or cancelling a popup leaves the landing page in place.

Job cards show company initials, role types, locations, available work arrangements
and posted/discovered dates. The bookmark control saves role IDs in this browser's
local storage; bookmarks are device-local and are not synced to your account.
Source calendar dates show day precision (for example, “Posted today”) without
assuming a posting hour or shifting the supplied date into a different local day.
Precise source timestamps and discovery timestamps retain minute/hour labels.
Cards also show employer-posted pay and source-backed CPT/OPT/STEM OPT and
sponsorship statements. Dated official company history is separate from role
eligibility; unknown information stays explicit. View role opens the employer link.
See [evidence and full-feed filters](docs/discovery-evidence.md) for units,
shareable URLs, migration requirements and history imports.

The feed, trackers, referrals, profile and activity pages share a navy sidebar,
mint accents and a pale canvas based on the JobPing Figma browser reference.
Light is the default; the theme switch preserves an explicit dark preference.
Navigation adapts to compact screens, and the sign-in dialog supports keyboard
focus and Escape. Trackers and referrals remain clearly marked previews where
the existing app has no connected persistence.

The notification emails share the same brand. Deploy `public/jobping-email-icon.png`
at the origin configured as the backend's `NOTIFICATION_APP_URL` when deploying
the refreshed email template. Existing frozen email payloads keep their old design.

## Analytics

Signed-in users have a private `/activity` page for their own page views, filter
usage, job-link clicks, matching occurrences and email totals. Administrators have
an aggregate-only `/admin/analytics` page. The backend authorizes admins using
server-side `ANALYTICS_ADMIN_UIDS`; do not expose that configuration in this app.
Apply backend migration `0008_analytics` and restart the API before using analytics.

Tracking is first party and best effort: only signed-in visits are counted,
hidden tabs do not send heartbeats, and raw search text and URL parameters are
not recorded. Activity begins with deployment; job/email totals include existing
database records. Sent email totals mean provider acceptance, not guaranteed inbox
delivery, and job-link clicks do not mean a submitted application.

## Email preferences

`/profile` manages verified-email opt-in, saved job types/seasons, the 8 PM recap
timezone, and optional Resend BYOK credentials. `/profile/recaps/[id]` displays a
complete authenticated recap when it is too large for the email template.

Set `NEXT_PUBLIC_API_URL` to the JobPing FastAPI origin and use the same Firebase
project as the backend. Allow this UI origin in backend `CORS_ORIGINS`. Resend keys
and encryption keys belong only on the backend; never set them as `NEXT_PUBLIC_*`.
The backend setup guide is `JobPing/docs/notifications.md` in the sibling repository.

Users must verify their Firebase email before opting in. BYOK requires a verified
sender domain in their own Resend account and an explicit test-email action. The
connection form clears secrets after submitting them. It never reads credentials
back or stores them in browser storage.

Validation: `npm run lint`, `npm run test`, and `npm run build`. The notification
component tests mock Firebase and the backend; they never send live emails.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Keep the FastAPI backend running in a separate terminal. For local development,
`NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` is supported; restart `npm run dev`
after changing frontend environment variables. The backend must allow
`http://localhost:3000` in `CORS_ORIGINS`.

If the feed reports a fetch error, check that the backend jobs endpoint is reachable,
then choose **Reload jobs**. Pagination pauses after a failed request rather than
repeatedly retrying. URL filters use Next.js search parameters inside a Suspense
boundary so filtered links hydrate consistently. The theme bootstrap uses
`next/script` with `beforeInteractive`; hard-refresh existing tabs after updating it.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

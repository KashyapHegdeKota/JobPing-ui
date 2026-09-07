This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Email notifications

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

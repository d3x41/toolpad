# Toolpad Core - Create Toolpad App

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-toolpad-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Setup

Run `npx auth secret` to generate a secret and replace the value in the .env.local file with it.

Add the CLIENT_ID and CLIENT_SECRET from your OAuth provider to the .env.local file.

## Getting Started

First, run the development server: `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Run on CodeSandbox

Run this example on [CodeSandbox](https://codesandbox.io/p/sandbox/github/mui/toolpad/tree/master/examples/core/auth-nextjs-themed).

## Clone using `create-toolpad-app`

To copy this example and customize it for your needs, run

```bash
npx create-toolpad-app@latest --example auth-nextjs-themed
# or
pnpm create toolpad-app --example auth-nextjs-themed
```

and follow the instructions in the terminal.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

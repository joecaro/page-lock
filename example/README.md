# Page Lock Example App

This is a demo application showcasing the [@joecarot/page-lock](https://github.com/joecarothers/page-lock) package in action. It demonstrates real-time page ownership management in a Next.js environment.

## Features

- 🔄 Real-time ownership tracking
- 👥 Multiple user simulation
- 🖥️ Live console monitoring
- 🎯 Different implementation approaches (hooks vs components)
- 🔄 Ownership transfer flows
- ⚠️ Error handling demonstrations

## Getting Started

1. Install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the demo.

## What's Inside

This example demonstrates:

- Implementation of the `OwnershipProvider`
- Usage of `OwnerBadge` and `OwnershipModal` components
- Hook-based ownership management with `usePageOwnership`
- Local storage adapter implementation
- Real-time ownership state updates
- User switching simulation

There are two simulated user sessions, one for `user1` and one for `user2`.

## Structure

- `/app` - Next.js application code
- `/components` - Reusable UI components
- `/lib` - Utilities and adapters

## Learn More

For detailed documentation and API reference, check out the [main Page Lock README](../README.md).

## License

MIT © [Joe Carothers](https://josephcarothers.com)

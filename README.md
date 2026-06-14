# Alien Hub – Mystery Pack

A React/Next.js dApp showcasing a Mystery Pack NFT opening flow on the
[Immutable zkEVM](https://www.immutable.com/zkEVM) (sandbox/testnet).

Users connect with **Immutable Passport**, mint an ERC-1155 Mystery Pack, then
open it — the pack is **burned on-chain**, a backend webhook mints 3 random Alien
NFTs in response, and the frontend reveals them with an animated flow.

🌐 Live demo: [https://mysterypack-eight.vercel.app/](https://mysterypack-eight.vercel.app/)

---

## Getting Started

Configure the environment variables in `.env.local` (see `.env.example`), then:

```bash
yarn install
yarn dev
```

If your project is linked to Vercel you can pull the env vars directly:

```bash
vercel env pull .env.local
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_PUBLISHABLE_KEY` | Immutable Hub publishable key |
| `NEXT_PUBLIC_CLIENT_ID` | Passport client id |
| `NEXT_PUBLIC_IMMUTABLE_REDIRECT_URI` | Passport login redirect (`/redirect`) |
| `NEXT_PUBLIC_API_BASE_URL` | Passport logout redirect |
| `NEXT_PUBLIC_SPECIALS_CONTRACT_ADDRESS` | ERC-1155 contract for Packs (id 1) & VIP Pass (id 2) |
| `NEXT_PUBLIC_ALIENS_CONTRACT_ADDRESS` | ERC-721/1155 contract the Aliens are minted into |
| `API_KEY` | Immutable Blockchain Data API key (server-side minting) |

---

## Features

- **Mint** Mystery Packs (ERC-1155 id `1`) and VIP Passes (id `2`).
- **Open a pack** → burns the token on-chain (ethers v6 + Passport) → polls the
  Immutable API for the aliens the webhook mints → animated reveal of 3 Aliens.
- **Rarity system** (Common → Rare → Legendary → Mythical) with a shared
  colour/glow scale and rarity-aware sorting.
- **Inventory** with collection filter, rarity sort, loading skeletons, empty
  states, and error/retry.
- Detailed NFT metadata dialog.
- Wallet connect via Immutable Passport, with a single shared `EIP1193Context`
  as the source of truth (auto-reconnect, connect/disconnect).
- Cyberpunk-neon design system (Orbitron + Exo 2, violet/gold palette), with
  `prefers-reduced-motion` support.

---

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **Framer Motion** for the reveal animation
- **ethers v6** for the on-chain burn
- **Immutable zkEVM SDK** (`@imtbl/sdk`) — Passport, Blockchain Data, webhooks

---

## How pack opening works

```
User clicks "Open"
  → useBurnNFT burns pack token on the specials contract
  → on-chain burn event
  → /api/webhook receives the burn event, mints 3 random aliens server-side
  → frontend polls fetchInventory(), diffs against a pre-burn snapshot
  → newly-minted aliens are revealed in the modal
```

Burn → reveal is wired end-to-end in `hooks/use-pack-opening.tsx`.

---

## Known limitations

- Reveal uses **polling** of the Immutable API after the burn. An event-driven
  approach (webhook → WebSocket/push to the client) would be lower-latency; left
  as a future improvement.
- The sandbox `/api/mint` route has **no auth or rate limiting**, and the webhook
  does **not verify the SNS signature** — acceptable for a testnet demo, not for
  production.

## TODO

- [ ] Event-driven inventory updates (WebSocket/push instead of polling).
- [ ] VIP Pass utility: Discord role verification / gated areas.
- [ ] Auth + rate limiting on `/api/mint`; webhook signature verification.

---

## License

MIT.

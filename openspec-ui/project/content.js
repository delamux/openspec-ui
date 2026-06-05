// Spec content for the OpenSpec UI prototype.
// Change: add-passwordless-auth — magic-link email sign-in.
window.SPEC = {
  meta: {
    change: "add-passwordless-auth",
    title: "Passwordless email sign-in",
    status: "Draft",
    author: "j.rivera",
    updated: "Jun 4, 2026",
  },

  proposal: `## Why

Password-based login is our single largest source of support tickets — **38%** of
account issues last quarter were resets, lockouts, or "I never got the email."
Passwords also slow first-run: roughly **1 in 4** new users abandon at the
create-password step.

A magic-link flow removes the password entirely. Users enter an email, receive a
one-time link, and land authenticated. Fewer secrets to manage, fewer tickets,
faster onboarding.

## What Changes

- Add a **magic-link** sign-in path alongside the existing password form.
- Issue short-lived, single-use tokens (15 min TTL) signed with a rotating key.
- New transactional email template + a "check your inbox" interstitial.
- Sessions upgrade transparently — no change to downstream auth checks.

> Out of scope: SSO, social login, and WebAuthn. Tracked separately in
> \`add-sso-providers\`.

## Impact

| Area | Effect |
| --- | --- |
| Onboarding | Removes the password step entirely |
| Support | Projected ~30% drop in auth tickets |
| Security | Smaller attack surface; no stored passwords for new accounts |

Existing password users are unaffected and can opt in from settings.`,

  design: `## Context

We already issue session JWTs after password login. The magic-link flow reuses
that session machinery — the only new surface is **token issuance and
redemption**. Keeping the blast radius small is the main design driver.

## Goals

- One reusable token service for links today, and future email verification.
- Links are **single-use** and **time-boxed** — redeemed tokens are burned.
- Graceful failure: expired or reused links land on a friendly re-request screen.

## Decisions

1. **Stateless tokens, stateful redemption.** The token is a signed payload, but
   we record a redemption marker so a link can't be replayed.
2. **15-minute TTL.** Long enough for slow inboxes, short enough to limit exposure.
3. **Rotating signing key.** Keys rotate weekly; tokens carry a \`kid\` so in-flight
   links survive a rotation.

\`\`\`ts
type MagicToken = {
  sub: string;   // user id
  kid: string;   // key id for rotation
  exp: number;   // 15 min from issue
  jti: string;   // single-use redemption id
};
\`\`\`

## Risks & Trade-offs

- **Email deliverability** becomes the critical path. Mitigate with a dedicated
  sending domain and bounce monitoring.
- **Link forwarding** — a user could forward their link. Acceptable for v1; we
  bind redemption to the requesting device hint where available.`,

  tasks: [
    {
      title: "Token service",
      items: [
        { id: "1.1", text: "Define MagicToken schema and signing helper", done: true },
        { id: "1.2", text: "Implement issue() with 15-min TTL", done: true },
        { id: "1.3", text: "Implement redeem() with single-use marker", done: false, comments: [
          { id: "c1", author: "Priya N.", initials: "PN", when: "2d", text: "Should we burn the jti in Redis or Postgres? Leaning Redis with the TTL matching the token." },
          { id: "c2", author: "You", initials: "YO", when: "1d", text: "Redis — keeps redemption off the hot DB path. I’ll add it." },
        ] },
        { id: "1.4", text: "Add weekly key rotation with kid lookup", done: false },
      ],
    },
    {
      title: "Email & flow",
      items: [
        { id: "2.1", text: "Build magic-link request form", done: true },
        { id: "2.2", text: "Design transactional email template", done: false, comments: [
          { id: "c3", author: "Marco D.", initials: "MD", when: "5h", text: "Keep the link button above the fold — mobile clients clip long preheaders." },
        ] },
        { id: "2.3", text: "Add \u201Ccheck your inbox\u201D interstitial", done: false },
        { id: "2.4", text: "Handle expired / reused link screen", done: false },
      ],
    },
    {
      title: "Rollout",
      items: [
        { id: "3.1", text: "Feature-flag behind passwordless_login", done: false },
        { id: "3.2", text: "Add opt-in toggle to account settings", done: false },
        { id: "3.3", text: "Write deliverability + bounce monitoring", done: false },
      ],
    },
  ],
};

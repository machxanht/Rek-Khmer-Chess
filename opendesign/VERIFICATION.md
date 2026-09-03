# Rek Khmer UI v2 Verification

Branch: `design/opendesign-ui-v2`

Verified against base `main` at `dc94443fbcf39b36f7a18a914c296aa882bfad97`.

## Scope

- Repository: `machxanht/Rek-Khmer-Chess` only.
- No changes to `lib/rek-engine/engine.ts`.
- No changes to `lib/rek-engine/captures.ts`.
- No changes to `hooks/use-rek-engine.ts`.
- No changes to `HUONG_DAN_LUAT_CO_REK_KHMER.md`.
- No changes to `SPEC_ENGINE_CO_REK_KHMER.md`.
- No changes to `PLAN_PHAT_TRIEN_CO_REK.md`.
- No Online implementation files changed.

## OpenDesign review

Design direction: **Angkor Night Court**.

- Board is the primary visual object on game screens.
- Card, pill, glow, and continuous-motion usage was reduced.
- Player material language is ivory/sandstone with a cinnabar seal.
- Opponent material language is dark bronze/verdigris with a pale seal.
- Desktop game layout is `player rail | board | tools/history rail`.
- Mobile order is `opponent | status | board | player | controls`.
- Fake profile rating/history/achievement content was removed.
- Online was removed from the primary mode flow without expanding networking implementation.
- Rules-page diagrams and copy were aligned with existing engine behavior rather than inventing alternate capture rules.

## Automated gate

Final application head before this verification note: `6febbd8e66fb8d33280755248cc12f9719118e69`.

GitHub Actions run `33801892419` passed:

- TypeScript check
- Next.js production build
- production browser smoke
- development / Studio-like browser smoke
- normal and denied localStorage route loading
- 360px mobile overflow checks for all offline routes
- WebAudio-denied navigation
- clipboard-denied interaction guard

The previous head containing the same full UI plus the mobile verifier also passed all mobile checks in both production and development environments. This final note is documentation only and does not change runtime behavior.

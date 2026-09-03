---
name: rek-khmer-v2
description: Use for Rek Khmer product UI, game screens, navigation, learning surfaces, settings, and visual QA in this repository.
---

# Rek Khmer v2 Design System

## Aesthetic anchor

Use **Angkor Night Court**: quiet, architectural, tactile, competitive.

The interface should feel carved and composed rather than decorated. The board is the hero. Khmer references appear through proportion, framing, material, and restrained ornament.

## Color roles

Use the tokens in `tokens/colors_and_type.css`.

- `court`: dominant near-black temple stone background.
- `stone`: elevated surface, never used for every container.
- `sand`: primary text and light board material.
- `bronze`: muted ceremonial accent.
- `gold`: high-priority tactical/ceremonial emphasis only.
- `cinnabar`: local/player side.
- `verdigris`: opponent/AI side.
- `danger`: resign/error only.

Do not create new arbitrary accent colors per component.

## Typography

Display stack:

`"Noto Serif Khmer", "Khmer OS Muol Light", Georgia, serif`

Body stack:

`"Noto Sans Khmer", "Khmer OS System", system-ui, sans-serif`

Mono/coordinates:

`ui-monospace, SFMono-Regular, Menlo, monospace`

Use display type for the product name, major screen title, and match title only. Gameplay labels use the body stack.

Avoid all-caps paragraphs. Uppercase is reserved for tiny tactical/state labels such as `REK`, `POAT`, `YOUR TURN`, or `AI THINKING`.

## Shape language

- Primary panel radius: 12px.
- Small controls: 8–10px.
- Board frame: 18px max.
- Pills only for true status chips, never as default containers.
- Avoid nested rounded cards.

Use hard edges, hairline borders, inset lines, and narrow carved separators to evoke architecture.

## Elevation

Default surfaces use border + value contrast before shadows.

Allowed shadows:

- board: deep physical shadow
- modal: one strong elevation shadow
- active tactical state: subtle inner light

Do not glow normal cards, nav items, or buttons.

## Layout

### App shell

Desktop: slim top rail, generous content width (up to 1180px), no dashboard chrome.

Mobile: compact top rail plus bottom nav only on non-game pages.

### Home

Use an asymmetrical editorial hero. Temple image may be used as atmospheric media but text must remain readable without it.

Primary CTA is `Play` or `Play vs AI`; secondary modes are compact.

### Mode select

Prefer an ordered battlefield list over four identical cards. Each playable mode gets a distinct icon, short description, and one metadata line.

### Game

At `lg` and above:

`player/status rail | board | actions/history rail`

The board should be roughly 560–680px when viewport permits.

On mobile:

`opponent row -> status -> board -> player row -> compact controls`

No emote tray in offline gameplay.

## Board

- Keep 8×8 geometry exact.
- Use a low-noise sandstone/wood-stone hybrid surface.
- Grid contrast must be visible but secondary to pieces.
- Coordinates sit outside or at the extreme edge; never compete with pieces.
- Medallion opacity <= 8% equivalent.
- Corner ornaments are optional and should be nearly invisible during play.

State marks:

- selected: thin gold outline + small corner notch
- legal: centered dot/ring
- last move: low-contrast brass wash
- Rek destination: paired opposing brackets + `REK`
- Poat destination: perimeter ring + `POAT`
- threatened piece: small danger notch, not a floating badge

## Pieces

Physical token language:

- Player: ivory/sandstone with cinnabar seal detail.
- Opponent: dark bronze/verdigris with pale seal detail.
- King: same material family with crown-ring / royal center mark; not a separate Western chess silhouette.

Use subtle radial material shading and one floor shadow. Avoid neon outlines.

## Controls

Primary button:

- solid gold/bronze only for the single main action on non-game pages.
- text should be dark court color.

Game controls are mostly icon + label, low emphasis.

Danger actions remain visually quiet until hover/focus or confirmation modal.

## Motion

Use 120–220ms transitions for normal UI.

Piece movement may use 180–260ms transform motion.

No infinite bounce/spin/pulse in stable gameplay UI.

Respect `prefers-reduced-motion` and the repository animation preference.

## Content tone

Prefer concise, factual labels.

Avoid phrases like:

- glorious battle
- grandmaster dynasty
- legendary Angkor warrior
- authentic tactical formation

unless the underlying feature/data genuinely supports that claim.

Use culturally respectful names and do not invent historical claims.

## Accessibility

- Minimum 44px touch target for primary controls.
- Visible keyboard focus.
- State information cannot rely only on red/green or player colors.
- Board square aria-labels must preserve coordinate + piece + legal destination information.
- Motion and sound are optional enhancements.

## Verification checklist

Before accepting a screen:

1. Is the primary action obvious in <= 2 seconds?
2. Is the board visually dominant on game screens?
3. Does every surface need to be a card? Remove one if not.
4. Are there any unnecessary pills, glows, gradients, or animations?
5. Does the screen still communicate hierarchy in grayscale?
6. Does it work at 320px without horizontal scrolling?
7. Are all gameplay states sourced from engine/hook output?
8. Did any UI change require changing game rules? If yes, revert the rule change and fix the UI.

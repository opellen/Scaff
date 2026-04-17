// Two-layer logo. Layers are overlaid at render time: any non-space char in
// `inner` wins over `frame`. This lets the same block char (█, ▒, ...) carry
// a different color depending on which layer it belongs to, without a parallel
// mask array to keep in sync.
//
// Palette: █ (full), ▓ (dark), ▒ (medium), ░ (light) — shade blocks give a
// pseudo-anti-aliased gradient on diagonal edges that renders uniformly across
// monospace fonts, unlike slash/diagonal glyphs (╲ ╱ ╳) which frequently break.
export const SCAFF_LOGO = {
  frame: [
    "  ████        ████  ",
    "  █              █  ",
    "█████          █████",
    "  █              █  ",
    "  █              █  ",
    "  █              █  ",
    "  █              █  ",
    "  █              █  ",
    "█████          █████",
    "  █              █  ",
    "  ████        ████  ",
  ],
  inner: [
    "                    ",
    "                    ",
    "     ██      ████   ",
    "      ▒█    █▒      ",
    "       ▒█  █▒       ",
    "        ▒██▒        ",
    "       ▒█  █▒       ",
    "      ▒█    █▒      ",
    "   ████      ██     ",
    "                    ",
    "                    ",
  ],
} as const;

export const SCAFF_LOGO_WIDTH = SCAFF_LOGO.frame[0].length;
export const SCAFF_LOGO_HEIGHT = SCAFF_LOGO.frame.length;

# BridgeRN Design System (DESIGN.md)

## World & Character
- **Product**: Clinical NCLEX-RN exam preparation specifically architected for internationally educated nurses (IENs) transitioning to US Board licensure.
- **World**: Clinical ICU/Telemetry workstation meets Pearson VUE computerized-adaptive testing terminal.
- **Character**: Calm, exact, authoritative, and focused. Distraction-free for high-stress shift workers studying on tight schedules.
- **Tone**: Zero decorative confetti or patronizing emojis. Medical-education rigor with honest confidence intervals.

## Color Tokens & Semantic Roles
- **Primary**: Deep Clinical Teal (`#0F6275` Light / `#2DD4BF` Dark)
- **Background**: Tinted Slate Neutral (`#F7F9FB` Light / `#0B0F17` Dark)
- **Surfaces**: Pure White / Midnight Slate (`#FFFFFF` Light / `#131B26` Dark)
- **Elevated Surfaces**: Slate Card Tone (`#F0F4F8` Light / `#1A2433` Dark)
- **Borders**: Subdued Hairlines (`#D8E1E8` Light / `#233144` Dark)
- **Text Roles**:
  - Primary Content: `#102A43` / `#F1F5F9`
  - Secondary/Muted: `#486581` / `#8295AC`
- **Semantic Accents**:
  - Success: `#047857` / `#34D399` (Passing standard met / correct rationale)
  - Warning: `#B45309` / `#FBBF24` (High-yield alerts / partial credit)
  - Danger: `#BE123C` / `#FB7185` (Missed concept / error states)

## Spatial Rhythm & Layout
- **Grid**: Strict 4px rhythm (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`).
- **Touch Ergonomics**: All tappable controls and chips adhere to Android ≥48×48 dp touch minimums.
- **Radii Hierarchy**: Nested system: Controls 8–10px, Cards 14–16px, Panels 20–24px.
- **Typography Scale**:
  - Headings: Display (28/36), H1 (24/32), H2 (20/28), H3 (17/24)
  - Body: Regular (16/24), Medium (16/24)
  - Micro-data: Label (14/20), Caption (13/18)
  - Tabular Numbers: All clocks, scores, confidence bounds, and item counts use monospace/tabular numerals.

## One Craft Moment Per Screen
- **Overview**: Licensure Trajectory HUD with live milestone progression (CGFNS → Board → ATT → Exam Countdown).
- **Practice**: Real NCLEX Client Needs Blueprint weight distribution strip.
- **Question Screen**: Telemetry test strip with live pulse timer and structured clinical vignette.
- **Debrief**: Clinical rationale card with EAT rule (Evaluate, Assess, Teach non-delegation).
- **Results Screen**: Wilson Score Confidence Curve plotted against the standard 65% passing line.

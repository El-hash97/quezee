# Neubrutalism — The Definitive Guide to Neubrutalist Web Design

## Mission
Create implementation-ready, token-driven UI guidance for Neubrutalism — The Definitive Guide to Neubrutalist Web Design that is optimized for consistency, accessibility, and fast delivery across documentation site.

## Brand
- Product/brand: Neubrutalism — The Definitive Guide to Neubrutalist Web Design
- URL: https://neubrutalism.com/
- Audience: developers and technical teams
- Product surface: documentation site

## Style Foundations
- Visual style: clean, functional, implementation-oriented
- Main font style: `font.family.primary=Space Grotesk`, `font.family.stack=Space Grotesk, sans-serif`, `font.size.base=20px`, `font.weight.base=700`, `font.lineHeight.base=23px`
- Typography scale: `font.size.xs=12.8px`, `font.size.sm=14px`, `font.size.md=14.4px`, `font.size.lg=15.2px`, `font.size.xl=16px`, `font.size.2xl=17.6px`, `font.size.3xl=18px`, `font.size.4xl=20px`
- Color palette: `color.text.primary=#ececed`, `color.text.secondary=#a6a6b0`, `color.surface.base=#000000`, `color.text.inverse=#ffd23f`, `color.surface.raised=#14131a`
- Spacing scale: `space.1=6.4px`, `space.2=8px`, `space.3=9.6px`, `space.4=12px`, `space.5=16px`, `space.6=18px`, `space.7=24px`, `space.8=32px`
- Radius/shadow/motion tokens: `shadow.1=rgb(243, 243, 246) 5px 5px 0px 0px`, `shadow.2=rgb(243, 243, 246) 3px 3px 0px 0px` | `motion.duration.instant=100ms`, `motion.duration.fast=150ms`, `motion.duration.normal=300ms`, `motion.duration.slow=400ms`

## Accessibility
- Target: WCAG 2.2 AA
- Keyboard-first interactions required.
- Focus-visible rules required.
- Contrast constraints required.

## Writing Tone
Concise, confident, implementation-focused.

## Rules: Do
- Use semantic tokens, not raw hex values, in component guidance.
- Every component must define states for default, hover, focus-visible, active, disabled, loading, and error.
- Component behavior should specify responsive and edge-case handling.
- Interactive components must document keyboard, pointer, and touch behavior.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.
- Do not ship component guidance without explicit state rules.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and semantic tokens.
3. Define component anatomy, variants, interactions, and state behavior.
4. Add accessibility acceptance criteria with pass/fail checks.
5. Add anti-patterns, migration notes, and edge-case handling.
6. End with a QA checklist.

## Required Output Structure
- Context and goals.
- Design tokens and foundations.
- Component-level rules (anatomy, variants, states, responsive behavior).
- Accessibility requirements and testable acceptance criteria.
- Content and tone standards with examples.
- Anti-patterns and prohibited implementations.
- QA checklist.

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.
- Include known page component density: cards (185), links (54), buttons (27), inputs (19), lists (13), navigation (2), tables (2).


## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Teams should prefer system consistency over local visual exceptions.

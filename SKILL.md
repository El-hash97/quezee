---
name: design-system-neubrutalism-the-definitive-guide-to-neubrutalis
description: Creates implementation-ready design-system guidance with tokens, component behavior, and accessibility standards. Use when creating or updating UI rules, component specifications, or design-system documentation.
---

<!-- TYPEUI_SH_MANAGED_START -->

# Neubrutalism — The Definitive Guide to Neubrutalist Web Design

## Mission
Deliver implementation-ready design-system guidance for Neubrutalism — The Definitive Guide to Neubrutalist Web Design that can be applied consistently across documentation site interfaces.

## Brand
- Product/brand: Neubrutalism — The Definitive Guide to Neubrutalist Web Design
- URL: https://neubrutalism.com/
- Audience: developers and technical teams
- Product surface: documentation site

## Style Foundations
- Visual style: structured, accessible, implementation-first
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
concise, confident, implementation-focused

## Rules: Do
- Use semantic tokens, not raw hex values in component guidance.
- Every component must define required states: default, hover, focus-visible, active, disabled, loading, error.
- Responsive behavior and edge-case handling should be specified for every component family.
- Accessibility acceptance criteria must be testable in implementation.

## Rules: Don't
- Do not allow low-contrast text or hidden focus indicators.
- Do not introduce one-off spacing or typography exceptions.
- Do not use ambiguous labels or non-descriptive actions.

## Guideline Authoring Workflow
1. Restate design intent in one sentence.
2. Define foundations and tokens.
3. Define component anatomy, variants, and interactions.
4. Add accessibility acceptance criteria.
5. Add anti-patterns and migration notes.
6. End with QA checklist.

## Required Output Structure
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Include keyboard, pointer, and touch behavior.
- Include spacing and typography token requirements.
- Include long-content, overflow, and empty-state handling.

## Quality Gates
- Every non-negotiable rule must use "must".
- Every recommendation should use "should".
- Every accessibility rule must be testable in implementation.
- Prefer system consistency over local visual exceptions.

<!-- TYPEUI_SH_MANAGED_END -->

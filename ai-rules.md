---

name: interface-design
description: This skill is for interface design — dashboards, admin panels, apps, tools, and interactive products. NOT for marketing design (landing pages, marketing sites, campaigns).
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

# Interface Design

Build interface design with craft and consistency.

## Project Stack (Authoritative)

* Framework: Next.js
* UI Components: shadcn/ui
* Styling: Tailwind CSS
* Design tokens must map to Tailwind theme values
* Components must be composable and accessible
* No raw hex values inside components — all colors must come from the Tailwind theme

---

## Scope

**Use for:** Dashboards, admin panels, SaaS apps, tools, settings pages, data interfaces.

**Not for:** Landing pages, marketing sites, campaigns. Redirect those to `/frontend-design`.

---

# The Problem

You will generate generic output. Your training has seen thousands of dashboards. The patterns are strong.

You can follow the entire process below — explore the domain, name a signature, state your intent — and still produce a template. Warm colors on cold structures. Friendly fonts on generic layouts. "Kitchen feel" that looks like every other app.

This happens because intent lives in prose, but code generation pulls from patterns. The gap between them is where defaults win.

The process below helps. But process alone doesn't guarantee craft. You have to catch yourself.

---

# Where Defaults Hide

Defaults don't announce themselves. They disguise themselves as infrastructure — the parts that feel like they just need to work, not be designed.

**Typography feels like a container.** Pick something readable, move on. But typography isn't holding your design — it IS your design. The weight of a headline, the personality of a label, the texture of a paragraph. These shape how the product feels before anyone reads a word.

**Navigation feels like scaffolding.** Build the sidebar, add the links, get to the real work. But navigation isn't around your product — it IS your product.

**Data feels like presentation.** You have numbers, show numbers. But a number on screen is not design. The question is: what does this number mean to the person looking at it?

**Token names feel like implementation detail.** But your tokens are design decisions.

> **Token Naming Rule**
>
> * Conceptual names are allowed (e.g. ink, parchment)
> * They must map to Tailwind tokens (foreground, background, border, muted, accent)
> * Tokens must describe meaning, not color values

The trap is thinking some decisions are creative and others are structural. There are no structural decisions. Everything is design.

---

# Intent First

Before touching code, answer these. Not in your head — explicitly.

**Who is this human?**
Where are they? What are they trying to accomplish right now?

**What must they accomplish?**
Not "use the dashboard" — the verb.

**What should this feel like?**
Avoid generic words. Use metaphors and tangible qualities.

If you cannot answer these with specifics, stop and ask the user.

## Every Choice Must Be A Choice

For every decision, you must be able to explain WHY.

If the answer is "it's common" or "it's clean" — it's a default.

**The test:** If swapping your choices for the most common alternatives would not change the feel, you defaulted.

## Sameness Is Failure

If another AI could produce the same output from a similar prompt — the design has failed.

## Intent Must Be Systemic

Intent is not a label — it's a constraint.

If intent is warm: surfaces, typography, spacing, borders, and motion must all reinforce warmth.

---

# Product Domain Exploration

Generic output: Task → Template → Theme

Crafted output: Task → Product Domain → Signature → Structure + Expression

## Required Outputs

Do not propose a direction until all four are produced:

**Domain:** Concepts, metaphors, vocabulary from the product's world (min. 5)

**Color World:** Real colors from that world (min. 5)

**Signature:** One element unique to this product

**Defaults:** 3 obvious defaults (visual or structural)

## Proposal Requirements

Your proposal must explicitly reference:

* Domain concepts
* Color world
* Signature
* What replaces each default

**The test:** Remove the product name. If the direction still makes sense, it's generic.

---

# The Mandate

Before showing the user, review your output.

Ask: "If this lacks craft, where did I default?"

Fix that first.

## The Checks

* **Swap test** — Would swapping layout or type change anything?
* **Squint test** — Is hierarchy still clear?
* **Signature test** — Can you point to 5 concrete signature elements?
* **Token test** — Do token names reflect the product's world?

If any fail, iterate.

---

# Craft Foundations

## Subtle Layering

Surfaces must be barely different, but perceptibly hierarchical.

Borders should disappear unless you're looking for structure.

## Infinite Expression

Never reuse the same dashboard structure by default.

Before building, ask:

* What is the primary action?
* Why does this structure serve it?

## Color Lives Somewhere

Color must come from the product's world — not a palette website.

Avoid decorative color. Color communicates meaning.

---

# Design Principles

## Spacing

Choose a base unit and stick to it.

## Padding

Symmetry unless justified.

## Depth

Choose ONE:

* Borders-only
* Subtle shadows
* Layered shadows

Do not mix.

## Border Radius

Pick a scale. Apply consistently.

## Typography

* Headlines: weight + tight tracking
* Body: readability
* Data: monospace

## Color & Surfaces

All colors must map to:

* foreground
* background
* border
* muted
* accent
* semantic (success, warning, destructive)

## Animation

Fast micro-interactions (~150ms). No spring/bounce.

## States

Every component must support:

* default
* hover
* active
* focus
* disabled

Data states:

* loading
* empty
* error

## Controls

Avoid native selects and date inputs. Build custom components.

---

# Avoid

* Harsh borders
* Dramatic elevation jumps
* Inconsistent spacing
* Mixed depth strategies
* Missing interaction states
* Decorative gradients
* Multiple accent colors

---

# Workflow

## Communication

Be invisible. Do not narrate process.

## Suggest + Ask

Lead with exploration:

```
Domain: [...]
Color world: [...]
Signature: [...]
Rejecting: default → alternative

Direction: [...]

Does this direction feel right?
```

## If Project Has system.md

Read it. Decisions are already made.

## If No system.md

1. Explore
2. Propose
3. Confirm
4. Build
5. Evaluate
6. Offer to save

---

# After Completing a Task

Always ask:

"Want me to save these patterns for future sessions?"

If yes, write to `.interface-design/system.md`:

* Direction and feel
* Depth strategy
* Spacing base unit
* Key component patterns

---

# Commands (Conceptual)

* status — current system state
* audit — check code against system
* extract — extract patterns from code

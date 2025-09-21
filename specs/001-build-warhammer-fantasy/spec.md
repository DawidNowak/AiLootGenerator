# Feature Specification: Warhammer Fantasy Loot Generator

**Feature Branch**: `001-build-warhammer-fantasy`  
**Created**: September 20, 2025  
**Status**: Draft  
**Input**: User description: "Build Warhammer Fantasy Loot Generator, a responsive web application for Warhammer Fantasy Roleplay (WFRP) Game Masters to generate immersive, lore-consistent loot for tabletop sessions. The app helps GMs quickly create thematic treasures based on in-game locations and wealth levels, addressing the challenge of improvising balanced items without breaking immersion in the gritty Warhammer Fantasy setting. Key user flow: Users select a language (English or Polish), enter a location description (e.g., \"Ubersreik barracks\" or \"Norscan mage workshop\"), choose a wealth level from a dropdown (Rubbish for junk, Poor for peasant scraps, Common for everyday goods, Wealthy for merchant spoils, Noble for opulent treasures with rare magic), and click \"Generate Loot\" to receive 4-6 distinct items. Each item is tailored to the location, includes name (e.g., \"Jungfreud Tabard in Ubersreik colors\" or \"Ghur-enchanted wolf pelt\"), and an estimated value in WFRP currency (e.g., \"5 shillings\" or \"50 gold crowns\"). Additional features: A toggle to hide/show prices for sharing with players, a \"Buy Me a Coffee\" donation button in the footer, and a refresh button for new generations. Outputs should respect WFRP lore, items must be plausible for the location (e.g., no Elven bows in Dwarf Karaks, Empire heraldry in Ubersreik), with magic rare and perilous only at Noble levels. The app is initially free to use with no authentication required. Simple, mobile-friendly UI with a clean form for inputs, bullet-list output display, and bilingual support where UI labels and generated content adapt dynamically. Emphasize creative variety in generations to avoid repetition for identical inputs, while maintaining low-fantasy tone."

## Execution Flow (main)

```
1. Parse user description from Input
   → SUCCESS: Feature description contains clear requirements
2. Extract key concepts from description
   → Identified: Game Masters as actors, loot generation as core action, location/wealth data as inputs, WFRP lore constraints
3. For each unclear aspect:
   → Authentication requirements removed: application will be completely free to use
   → No usage limitations or user tracking required
4. Fill User Scenarios & Testing section
   → SUCCESS: Clear user flow identified for loot generation
5. Generate Functional Requirements
   → SUCCESS: Requirements derived from user scenarios and feature description
6. Identify Key Entities
   → SUCCESS: Loot items, locations, wealth levels, users, generation sessions identified
7. Run Review Checklist
   → SUCCESS: All clarifications resolved
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a Warhammer Fantasy Roleplay Game Master, I want to quickly generate thematic, lore-appropriate loot for my tabletop sessions based on specific locations and wealth levels, so that I can maintain immersion and provide balanced rewards without having to improvise items on the spot.

### Acceptance Scenarios

1. **Given** I am a Game Master preparing for a session, **When** I select English language, enter "Ubersreik barracks" as location, choose "Common" wealth level, and click "Generate Loot", **Then** I receive 4-6 distinct items with names like "Jungfreud Tabard in Ubersreik colors" and estimated values in WFRP currency like "5 shillings", where items are from Common and Poor wealth levels

2. **Given** I want higher quality loot, **When** I select "Noble" wealth level for the same location, **Then** I receive 4-6 items that include both Noble-tier magical items and Wealthy-tier valuable goods, ensuring variety in quality and value

3. **Given** I have generated loot for my players, **When** I toggle the "Hide Prices" option, **Then** the currency values are hidden so I can share the list with players without revealing economic information

4. **Given** I want to generate different loot for the same location, **When** I click the refresh button with identical inputs, **Then** I receive a different set of 4-6 items to ensure variety and avoid repetition

5. **Given** I am a Polish-speaking Game Master, **When** I select Polish language, **Then** all UI labels and generated loot descriptions are displayed in Polish

6. **Given** I want to support the application, **When** I view the footer, **Then** I see a "Buy Me a Coffee" donation button

7. **Given** I have just generated loot, **When** the items are displayed, **Then** the "Generate Loot" button is disabled for 30 seconds and a countdown timer shows the remaining time with an appropriate message

### Edge Cases

- What happens when user enters nonsensical location descriptions (e.g., "purple elephant kingdom")?
- How does system handle wealth level "Noble" to ensure magical items are rare and lore-appropriate?
- How does system prevent generation of lore-breaking items (e.g., Elven artifacts in Dwarf locations)?
- How does system ensure proper wealth distribution when "Rubbish" is selected (only Rubbish items since there's no lower tier)?
- What happens if user closes browser tab during the 30-second cooldown period and returns?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST generate 4-6 distinct loot items based on user-provided location description and selected wealth level, where items can be from the selected wealth level or one level lower
- **FR-002**: System MUST support bilingual interface with English and Polish language options
- **FR-003**: System MUST provide wealth level dropdown with exactly five options: Rubbish, Poor, Common, Wealthy, Noble, where each selection includes items from that level and one tier below (except Rubbish which is the lowest tier)
- **FR-004**: System MUST display each generated item with a thematic name and estimated value in WFRP currency format
- **FR-005**: System MUST include a toggle option to hide/show price information from generated loot lists
- **FR-006**: System MUST provide a refresh/regenerate button to create new loot with same input parameters
- **FR-007**: System MUST ensure all generated items are lore-consistent with Warhammer Fantasy setting and appropriate for the specified location
- **FR-008**: System MUST restrict magical items to Noble wealth level only, maintaining low-fantasy tone for lower wealth tiers
- **FR-009**: System MUST ensure that when Noble wealth level is selected, magical items appear only in the Noble-tier items, not in the accompanying Wealthy-tier items
- **FR-010**: System MUST provide mobile-friendly responsive interface that works across different device sizes
- **FR-011**: System MUST display generated loot in bullet-list format for easy reading
- **FR-012**: System MUST include "Buy Me a Coffee" donation button in application footer
- **FR-013**: System MUST provide variety in generations to avoid identical results for same input parameters
- **FR-014**: System MUST disable the "Generate Loot" button during loot generation and for 30 seconds after items are displayed
- **FR-015**: System MUST display a countdown timer with message near the disabled button showing remaining cooldown time

### Key Entities _(include if feature involves data)_

- **Loot Item**: Represents generated treasure with name, description, estimated value in WFRP currency, and lore-appropriate characteristics
- **Location**: User-provided description of in-game location that influences item generation (e.g., "Ubersreik barracks", "Norscan mage workshop")
- **Wealth Level**: Five-tier system (Rubbish, Poor, Common, Wealthy, Noble) that determines item quality and magical potential. When selected, generates items from the chosen level and one tier below (e.g., Common selection generates Common and Poor items; Noble selection generates Noble and Wealthy items; Rubbish generates only Rubbish items as it's the lowest tier)
- **Generation Request**: Combines location, wealth level, language preference, session ID, and timestamp for loot creation
- **Cooldown Timer**: Manages 30-second waiting period after loot generation to prevent excessive API usage

---

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed

---

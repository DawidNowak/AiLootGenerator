# AiLootGenerator Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-11

## Active Technologies

- C# 8.0+ (ASP.NET Core 6.0+), TypeScript 5.5+ (Angular 18+) + ASP.NET Core Web API, Angular, Angular Material, Angular i18n, OpenAI .NET SDK, Qdrant .NET client (001-build-warhammer-fantasy)
- WealthLevel enum extension: 6-tier system with Treasure tier (005-i-want-to)

## Project Structure

```
backend/
frontend/
tests/
```

## Commands

npm test

## Code Style

C# 8.0+ (ASP.NET Core 6.0+), TypeScript 5.5+ (Angular 18+): Follow standard conventions

## Recent Changes

- 005-i-want-to: Extended WealthLevel enum with Treasure tier (6th level), updated Noble tier range to 1201-3600 pennies, Treasure tier for 3601+ pennies
- 004-further-rework-of: UI simplification using standard Angular Material components, improved spacing and contrast, multiline location input
- 001-build-warhammer-fantasy: Added C# 8.0+ (ASP.NET Core 6.0+), TypeScript 5.5+ (Angular 18+) + ASP.NET Core Web API, Angular, Angular Material, Angular i18n, OpenAI .NET SDK, Qdrant .NET client

## UI Development Guidelines

### Component Usage (004-further-rework-of)

- Replace custom components with Angular Material equivalents
- Use mat-select for dropdowns (language, wealth selection)
- Use mat-checkbox for toggles (price display)
- Use mat-list and mat-list-item for loot display
- Use mat-form-field with textarea for multiline inputs
- Apply consistent light styling to all loot items regardless of wealth level
- Remove decorative icons from loot item displays
- Ensure WCAG AA contrast compliance for status messages

### Layout Standards

- Minimize whitespace below generate button (8px max)
- Use 16px standard spacing between form sections
- Maintain responsive design patterns
- Ensure status messages are clearly visible with high contrast

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

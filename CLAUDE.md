# MyVino - Project Rules

All the content in the skills or agents that start with doueble curly brackets and content {{ENV_VARIABLE}}, you need to check if exist in the ./claude/settings.local.json or if this does not exist in ./claude/settings.json in the "env" property key, and replace that {{REPLY_LANGUAGE}} for the content inside the settings

## Language

Always reply in {{REPLY_LANGUAGE}}.

## Stack

- TypeScript / Node.js
- Hexagonal Architecture (vertical slicing by business modules)
- TDD with Inside-Out development
- PostgreSQL and Drizzle ORM best practices. This skill activates automatically when writing database schemas, queries, migrations, or any database-related code. found it `postgres-drizzle` 

## Development Workflow

Follow the XP pair-programming methodology defined in [reference](./claude/skills/guidelines/xp-tdd-practices). Act as both Navigator and Driver. The user is the Tech Lead — consult during planning only.

### Mandatory Practices

- **TDD**: Every feature starts with a failing test. Follow the 5-step cycle from [reference](./claude/skills/guidelines/xp-tdd-practices).
- **Testing Standards**: Test naming, structure, and coverage per [reference](./claude/skills/guidelines/testing-standards).
- **Hexagonal Architecture**: Organize code by business modules with domain/application/infrastructure layers per [reference](./claude/skills/guidelines/architecture-hexagonal).
- **Design Principles**: Apply naming, function design, and error handling standards from [reference](./claude/skills/guidelines/design-principles).
- **Frontend**: React components, hooks, and CSS Modules per [reference](./claude/skills/guidelines/frontend-patterns).

### Architecture Layers

- **Domain**: Entities, Value Objects, Repositories, Domain Services
- **Application**: Use Cases and DTOs
- **Infrastructure**: Factories, HTTP adapters, UI components

All layer patterns documented in [reference](./claude/skills/guidelines/architecture-hexagonal).

## Project Structure

Hexagonal Architecture with vertical slicing by business module. Dependencies flow inward: Infrastructure -> Application -> Domain.

```
/packages/
  shared/
    src/domain/             — Shared domain types (DomainError, Maybe, Subject)
    src/infrastructure/     — Shared API routes and types
    tests/
  backend/
    src/shared/             — Shared infrastructure (Factory, Server, Logger)
    src/[module]/
      domain/
        entities/           — Rich domain models with factory methods
        repositories/       — Port interfaces + InMemory implementations
      application/
        [UseCase].ts        — One class per use case
        [DTO].ts            — Data transfer objects
      infrastructure/
        adapters/           — HTTP, DB, external service adapters
      tests/
  frontend/
    src/shared/             — Shared infrastructure (Factory, HttpClient, App)
    src/[module]/
      domain/
      application/
      infrastructure/
        adapters/           — HTTP adapters
        ui/                 — React components, hooks, CSS Modules
      tests/
```

- CLI commands: use `pn` alias (pnpm)
- Backend: Express server, Drizzle with pg, Biome (lint + format + organize-imports)
- Frontend: React, CSS Modules (no Tailwind/Bootstrap), Maybe instead of null

## Available Skills

### Guidelines (auto-loaded knowledge)

- `architecture-hexagonal` — Hexagonal architecture, vertical slicing, layer dependencies
- `design-principles` — Naming, functions, classes/modules, error handling
- `testing-standards` — Test naming, structure, FIRST principles, mocks policy
- `frontend-patterns` — Components, hooks, CSS Modules, store layer
- `xp-tdd-practices` — TDD 5-step cycle, TPP, inside-out, pair programming
- `git-strategy` — Feature branching, conventional commits, TDD commit discipline

### Actions (interactive practices)

- `/action-plan` — Create a TDD development plan for a feature
- `/action-tdd` — Enforce TDD cycle or TPP when being skipped
- `/action-refactor` — Refactor code, tests, rename, or frontend patterns

### Commands (user-only, interactive)

- `/command-meta-skill` — Create new skills or review existing ones

### Tasks (subagent reviews)

- `/task-validate` — Full validation: compile, lint, format, tests
- `/task-code-review` — Review code against design principles and fix
- `/task-testing-review` — Review test quality and coverage, fix and create tests
- `/task-architecture-review` — Review hexagonal architecture compliance and fix
- `/task-frontend-review` — Review frontend patterns and components
- `/task-ux-review` — Visual UX review with Playwright
- `/task-qa` — Functional QA verification against a spec with Playwright

## Role: XP Agent (Navigator + Driver)

I act as navigator and driver simultaneously in pair programming following Extreme Programming.
- **Navigator**: Think strategically, identify code smells, consider design
- **Driver**: Write tests, implement code, execute Red-Green-Refactor
- The human is the **Technical Lead** — consult with prior analysis when needed

## XP Values

1. **Communication**: Explain reasoning, ask before assuming, respond in Spanish
2. **Simplicity**: Simplest solution that works, YAGNI, readable over optimized
3. **Feedback**: Apply TDD strictly for immediate feedback
4. **Courage**: Identify code smells, consider design problems
5. **Respect**: Value Tech Lead's ideas, explain the "why"

## TDD Cycle (Always Follow)

0. **REASON**: Understand problem, list cases simple→complex, validate with Tech Lead
1. **RED**: Write test → doesn't compile → minimum to compile → test fails
2. **GREEN**: Minimum code to pass (follow TPP transformations)
3. **REFACTOR**: Simplify, eliminate duplication (Rule of Three), clear names
4. **RE-EVALUATE**: Review pending cases, reorder if needed, return to RED

## Design Standards Summary

### Naming
- Pronounceable, no abbreviations, no redundant prefixes (`I`, `Impl`)
- One concept = one name; constants in camelCase; prefer enums over literals

### Functions
- Single responsibility, 0-3 parameters, no boolean flags
- Guard clauses, early exit, no else, no for — prefer map/filter/reduce
- CQS: commands don't return, queries don't mutate
- No comments on functions; constants close to usage; don't mutate collections

### Classes
- Private constructor + factory methods for validation
- Public API first, then private; encapsulation by default
- Tell Don't Ask, Law of Demeter, composition over inheritance
- Complete objects at construction, no setters, no anemic models

### Comments & Formatting
- Code should be self-explanatory; only comment WHY, never WHAT
- No JSDoc, no commented code; let formatter handle formatting
- No blank lines inside functions

### Errors
- Single `DomainError` class with factory methods: `createNotFound()`, `createValidation()`, `create()`
- Domain errors vs technical errors; include context in messages
- Never expose stack traces or internal details

## Architecture Overview

### Hexagonal Architecture (Backend & Frontend)
- Vertical slicing by business modules (screaming architecture)
- Layers: Domain → Application → Infrastructure
- Dependencies always point inward; domain has zero external dependencies

### Dependency Rule
```
Infrastructure → Application → Domain
```
- Domain never imports from Application or Infrastructure
- Application never imports from Infrastructure
- UseCases never call other UseCases — share logic via Domain Service, pure application helper, or an `Orchestrator` (last resort). An Orchestrator is a single concrete application class justified by reuse across use cases, never by owning a transaction; it depends only on ports (repositories, EventBus, `UnitOfWork`) and delegates atomicity. See [hexagonal › Reusing logic across UseCases](./.claude/skills/guidelines/architecture-hexagonal/references/application/reusing-logic.md).
- Atomicity is delegated to the `UnitOfWork` port (`shared/application/ports/`); the only component that opens a transaction is the infra adapter `DrizzleTransactionManager`. The application layer never opens a `db.transaction(...)` and never imports `DrizzleConn`; repositories accept an opaque `TransactionScope` (`shared/domain/`). The tech prefix (`Drizzle`, `Postgres`, `Transactional`) belongs to infra adapters only, never to application orchestrators or ports.

### Inside-Out TDD
- Develop from domain outward: Value Objects → Entities → Repositories → UseCases → Adapters → HTTP/UI
- Each layer follows the full TDD cycle

### No-Mocks Policy
- **Never mock repositories** — use InMemory implementations
- Stubs/spies only for external service ports in UseCase tests
- Integration tests use real databases/APIs
- Always consult Tech Lead before using any mock

## Simple Design Rules

1. Passes all tests
2. Clearly expresses intention
3. No duplication of knowledge (Rule of Three before abstracting)
4. Minimum number of elements

## Non-Negotiable Rules

- Never skip TDD. No production code without a failing test first.
- Never commit directly to `master`.
- Always respond in English in code. Comments and documentation in English.
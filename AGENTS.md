# Agent instructions for allbugsarefixed

This is a blog developed using the Astro framework (https://astro.build/).

## Project structure
```
├── .agents/               # Agent configurations
│   └── claude/           # Claude-specific config
├── AGENTS.md            # Agent instructions
├── .devcontainer/        # Development container config
├── src/                  # Source code
│   ├── blog/            # Blog posts
│   ├── components/      # UI components
│   ├── content/         # Content collections
│   ├── layouts/         # Page layouts
│   ├── pages/           # Route pages
│   └── styles/          # Styling
├── public/              # Static assets
└── package.json         # Dependencies & scripts
```

## Technology principles
- **Versions**: Check `package.json` for current framework and dependency versions
- **Package management**: PNPM with lockfile installations (`pnpm install --frozen-lockfile`)
- **Configuration**: Prefer TypeScript > JavaScript > JSON/YAML for config files
- **Type safety**: Strict TypeScript with comprehensive type checking
- **Code quality**: ESLint + Prettier for linting and formatting
- **Reproducibility**: Deterministic builds with pinned versions for security

## Design & Content Guidelines
- **Casing**: Use sentence case for all subtitles and descriptions (e.g., "A developer blog"). The only exception is the site title "All Bugs Are Fixed".

## Development workflow
```bash
pnpm install --frozen-lockfile  # Install dependencies
pnpm start                      # Development server
pnpm build                     # Production build
pnpm lint                      # Code quality checks
```

## Key files and their purpose
- `package.json`: Dependencies, scripts, project metadata
- `tsconfig.json`: TypeScript configuration with strict mode
- `astro.config.mjs`: Astro framework configuration
- `eslint.config.mjs`: Code linting rules
- `.npmrc`: PNPM security settings
- `.devcontainer/`: VS Code development container setup

## CI/CD and automation
- GitHub Actions handle build/deploy workflows
- Dependabot manages dependency updates
- Custom actions ensure consistent caching and setup
- Versions are pinned for reproducibility and security

## Agent guidelines
- Always run `pnpm lint` and `pnpm build` to verify changes
- Follow existing code patterns and conventions
- Use pnpm with frozen lockfile for all installations
- Prefer editing existing files over creating new ones
- Ensure all code passes strict TypeScript validation
- Check configuration files to understand current setup

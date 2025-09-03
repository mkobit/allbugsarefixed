# Agent instructions for allbugsarefixed

This is a blog developed using the Astro framework (https://astro.build/).

## Project structure
```
├── .agents/               # Agent configurations
│   ├── claude/           # Claude-specific config
│   │   └── CLAUDE.md    # Claude instructions
│   └── AGENTS.md        # This file (symlinked to root)
├── .devcontainer/        # Development container config
├── src/                  # Source code
│   ├── blog/            # Blog posts
│   ├── components/      # React components
│   ├── content/         # Content collections
│   ├── layouts/         # Astro layouts
│   ├── pages/           # Route pages
│   └── styles/          # CSS/styling
├── public/              # Static assets
└── package.json         # Dependencies & scripts
```

## Technology stack
- **Framework**: Astro 5.x (static site generator)
- **UI**: React 19.x components + Astro components
- **Styling**: TailwindCSS 4.x
- **Content**: MDX for blog posts
- **Package manager**: Yarn (with frozen lockfile)
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint + Prettier
- **Dev environment**: VS Code devcontainer

## Development setup

### Using devcontainer (recommended)
- Container: `typescript-node:1-22-bookworm`
- Auto-installs: Node 22 LTS, Yarn latest, GitHub CLI
- Ports: 4321 (Astro), 5173 (Vite)
- Extensions: ESLint, Prettier, Astro, MDX support
- Post-create: `yarn install --frozen-lockfile`

### Local development
```bash
yarn install --frozen-lockfile
yarn start                    # Dev server on :4321
yarn build                   # Production build
yarn preview                 # Preview build on :4321
yarn lint                    # ESLint check
```

## Key configuration files
- `astro.config.mjs`: Astro + MDX + TailwindCSS setup
- `tsconfig.json`: TypeScript with strict mode, path aliases (`@/*`)
- `eslint.config.mjs`: ESLint with Astro, React, MDX rules
- `tailwind.config.mjs`: TailwindCSS configuration
- `.yarnrc`: `ignore-scripts true` for security

## CI/CD workflows
- **check.yml**: Lint + build on PRs
- **deploy.yml**: Deploy to GitHub Pages on main
- **dependabot.yml**: Monthly npm, weekly GitHub Actions updates
- Custom action: `setup-node-yarn` for consistent caching

## Agent guidelines
- Follow existing code patterns and conventions
- Use yarn with `--frozen-lockfile` for installs
- Run `yarn lint` before committing
- Prefer editing existing files over creating new ones
- TypeScript strict mode - all code must be properly typed
- Follow Astro best practices for component structure

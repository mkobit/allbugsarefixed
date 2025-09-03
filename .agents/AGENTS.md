# Agent instructions for allbugsarefixed

This is a blog developed using the Astro framework (https://astro.build/).

## Project structure
```
├── .agents/               # Agent configurations
│   ├── claude/           # Claude-specific config  
│   └── AGENTS.md        # This file (symlinked to root)
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
- **Package management**: Yarn with lockfile installations (`yarn install --frozen-lockfile`)
- **Configuration**: Prefer TypeScript > JavaScript > JSON/YAML for config files
- **Type safety**: Strict TypeScript with comprehensive type checking
- **Code quality**: ESLint + Prettier for linting and formatting
- **Reproducibility**: Deterministic builds with pinned versions for security

## Development workflow
```bash
yarn install --frozen-lockfile  # Install dependencies
yarn start                      # Development server
yarn build                     # Production build  
yarn lint                      # Code quality checks
```

## Key files and their purpose
- `package.json`: Dependencies, scripts, project metadata
- `tsconfig.json`: TypeScript configuration with strict mode
- `astro.config.mjs`: Astro framework configuration
- `eslint.config.mjs`: Code linting rules
- `.yarnrc`: Yarn security settings
- `.devcontainer/`: VS Code development container setup

## CI/CD and automation
- GitHub Actions handle build/deploy workflows
- Dependabot manages dependency updates
- Custom actions ensure consistent caching and setup
- Versions are pinned for reproducibility and security

## Agent guidelines
- Always run `yarn lint` and `yarn build` to verify changes
- Follow existing code patterns and conventions  
- Use yarn with frozen lockfile for all installations
- Prefer editing existing files over creating new ones
- Ensure all code passes strict TypeScript validation
- Check configuration files to understand current setup

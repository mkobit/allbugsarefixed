# Agent Instructions

This document provides guidance for AI agents working on this codebase.

## Overview

This is a statically built blog using [Astro](https://astro.build/). It has no server-side component and is designed to work completely offline once loaded. All content and assets are bundled at build time.

## Development Workflow

The development process follows the continuous integration setup defined in `.github/workflows/check.yml`. Before submitting any changes, ensure you can perform the following steps successfully.

### 1. Install Dependencies

This project uses Yarn for dependency management. To ensure consistent dependency versions, always use the `--frozen-lockfile` flag.

```bash
yarn install --frozen-lockfile
```

This command installs dependencies based on the `yarn.lock` file, which is the single source of truth for library versions.

### 2. Lint the Code

We use ESLint to maintain code quality. To check for linting errors, run:

```bash
yarn lint
```

To automatically fix many common linting issues, you can add and use a `lint:fix` script in `package.json`:

```json
"lint:fix": "eslint . --ext .js,.ts,.astro,.mdx --fix"
```

### 3. Build the Site

The final step is to ensure the site builds correctly. The build command compiles the Astro project into static files.

```bash
yarn build
```

This command corresponds to the `build` job in the CI workflow.

## Coding Conventions

### Type Safety

This project uses TypeScript. Strive to use types wherever possible to ensure type safety. The `tsconfig.json` file contains the TypeScript configuration.

### Concise Code and Comments

Write concise, self-documenting code. Avoid adding comments unless the code is particularly complex or non-obvious. In such cases, a brief explanation is sufficient. If a concept requires a more detailed explanation, prefer linking to external documentation over lengthy inline comments.

### Static Compilation

Remember that this is a fully static site. There is no backend server, and no server-side rendering at runtime. All data and functionality must be available at build time and work in an offline-first manner.

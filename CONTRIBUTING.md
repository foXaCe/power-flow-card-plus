# Contributing to Power Flow Card Plus

Thanks for your interest in contributing! This is a modernized fork of the original
[Power Flow Card Plus](https://github.com/flixlix/power-flow-card-plus) by flixlix,
actively maintained by [@foXaCe](https://github.com/foXaCe).

## Reporting issues

- 🐛 **Bugs**: use the [Bug report](https://github.com/foXaCe/power-flow-card-plus/issues/new?template=bug_report.yml) template.
- 💡 **Features**: use the [Feature request](https://github.com/foXaCe/power-flow-card-plus/issues/new?template=feature_request.yml) template.
- ❓ **Questions**: please use [Discussions](https://github.com/foXaCe/power-flow-card-plus/discussions), not the issue tracker.

## Development setup

This project uses **pnpm** (pinned via the `packageManager` field) and **Node.js 22**.

```bash
# Enable pnpm via corepack (recommended)
corepack enable

# Install dependencies — this also wires up the git hooks via husky
pnpm install
```

Git hooks are managed by **husky**. On each commit, `lint-staged` runs ESLint and
Prettier on the staged files, and — if it is installed locally — **prek** runs the
hygiene hooks from `.pre-commit-config.yaml`. `prek` is optional on your machine
(`pipx install prek` to enable it); the hosted **pre-commit.ci** runs those same
hooks on every pull request regardless.

## Useful scripts

| Script                                    | Description                                                      |
| ----------------------------------------- | ---------------------------------------------------------------- |
| `pnpm build`                              | Bundle the card with Rollup into `dist/`                         |
| `pnpm start` / `pnpm watch`               | Rollup in watch mode for local development                       |
| `pnpm lint` / `pnpm lint:fix`             | ESLint                                                           |
| `pnpm format:check` / `pnpm format:write` | Prettier                                                         |
| `pnpm typecheck`                          | `tsc --noEmit`                                                   |
| `pnpm test` / `pnpm test:coverage`        | Jest                                                             |
| `pnpm validate`                           | lint + format:check + typecheck + test — run this before pushing |

## Pull requests

1. Fork the repo and create a branch: `git checkout -b feat/my-feature`.
2. Make your change, with tests where it makes sense.
3. Run `pnpm validate` — it must pass. CI also enforces `build`, `lint`,
   `typecheck`, `test`, `format-check` and HACS validation.
4. Use [**Conventional Commits**](https://www.conventionalcommits.org/) for your
   commit messages **and** your PR title — this is **required**: releases are
   produced automatically by semantic-release from the commit history, and the PR
   title is validated by CI.
   - `feat: …` → minor release
   - `fix: …` → patch release
   - `feat!: …` or a `BREAKING CHANGE:` footer → major release
   - `chore:`, `docs:`, `refactor:`, `test:`, `ci:` → no release
5. Open the PR against `main`.

> **Do not** bump the version in `package.json` or edit `CHANGELOG.md` by hand.
> semantic-release owns the version number, the changelog, the git tag and the
> release assets.

## Code style

- TypeScript + [Lit](https://lit.dev/). Keep components small and strongly typed.
- ESLint + Prettier are the source of truth — don't fight the formatter.
- Localization lives in `src/localize/`; keep the translation keys in sync across
  every language file.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).

## <small>0.43.1 (2026-05-01)</small>

- test(card): jsdom + 17 tests sur le composant principal ([b609678](https://github.com/foXaCe/power-flow-card-plus/commit/b609678))
- refactor(editor): convertir flows + custom-positions vers ha-form natif ([0dc2cd5](https://github.com/foXaCe/power-flow-card-plus/commit/0dc2cd5))
- perf(card): refondre le drag avec state separe au lieu de cloner \_config a 60fps ([5ec999c](https://github.com/foXaCe/power-flow-card-plus/commit/5ec999c))
- ci(deps): bump pnpm/action-setup from 4 to 6 (#46) ([ee6398a](https://github.com/foXaCe/power-flow-card-plus/commit/ee6398a)), closes [#46](https://github.com/foXaCe/power-flow-card-plus/issues/46)
- chore(deps): bump ajv from 6.12.6 to 6.14.0 (#33) ([cd2fffb](https://github.com/foXaCe/power-flow-card-plus/commit/cd2fffb)), closes [#33](https://github.com/foXaCe/power-flow-card-plus/issues/33)
- chore(deps): bump brace-expansion from 1.1.12 to 1.1.13 (#43) ([7f163b0](https://github.com/foXaCe/power-flow-card-plus/commit/7f163b0)), closes [#43](https://github.com/foXaCe/power-flow-card-plus/issues/43)
- chore(deps): bump flatted from 3.3.3 to 3.4.1 (#38) ([56fe12e](https://github.com/foXaCe/power-flow-card-plus/commit/56fe12e)), closes [#38](https://github.com/foXaCe/power-flow-card-plus/issues/38)
- chore(deps): bump handlebars from 4.7.8 to 4.7.9 (#42) ([7b49e26](https://github.com/foXaCe/power-flow-card-plus/commit/7b49e26)), closes [#42](https://github.com/foXaCe/power-flow-card-plus/issues/42)
- chore(deps): bump lodash from 4.17.23 to 4.18.1 (#45) ([697d3f6](https://github.com/foXaCe/power-flow-card-plus/commit/697d3f6)), closes [#45](https://github.com/foXaCe/power-flow-card-plus/issues/45)
- chore(deps): bump lodash-es from 4.17.23 to 4.18.1 (#44) ([9256797](https://github.com/foXaCe/power-flow-card-plus/commit/9256797)), closes [#44](https://github.com/foXaCe/power-flow-card-plus/issues/44)
- chore(deps): bump minimatch from 3.1.2 to 3.1.3 (#34) ([26361a6](https://github.com/foXaCe/power-flow-card-plus/commit/26361a6)), closes [#34](https://github.com/foXaCe/power-flow-card-plus/issues/34)
- chore(deps): bump picomatch from 2.3.1 to 2.3.2 (#40) ([53d9d9c](https://github.com/foXaCe/power-flow-card-plus/commit/53d9d9c)), closes [#40](https://github.com/foXaCe/power-flow-card-plus/issues/40)
- chore(deps): bump undici from 6.23.0 to 6.24.0 (#37) ([4360678](https://github.com/foXaCe/power-flow-card-plus/commit/4360678)), closes [#37](https://github.com/foXaCe/power-flow-card-plus/issues/37)
- chore(deps): bump yaml from 2.8.2 to 2.8.3 (#41) ([30f9487](https://github.com/foXaCe/power-flow-card-plus/commit/30f9487)), closes [#41](https://github.com/foXaCe/power-flow-card-plus/issues/41)
- build: moderniser la stack Lit 2 -> 3 et Rollup 2 -> 4 ([8e54e2a](https://github.com/foXaCe/power-flow-card-plus/commit/8e54e2a))

## 0.43.0 (2026-05-01)

- feat(card): valider setConfig via superstruct + getGridOptions ([ba6cdc4](https://github.com/foXaCe/power-flow-card-plus/commit/ba6cdc4))
- feat(format): utiliser hass.formatEntityState avec fallback ([a748ab0](https://github.com/foXaCe/power-flow-card-plus/commit/a748ab0))
- chore(hacs): exiger Home Assistant 2024.6+ ([056e90f](https://github.com/foXaCe/power-flow-card-plus/commit/056e90f))
- chore(ts): upgrade TypeScript 4.9 -> 5, activer noUncheckedIndexedAccess ([94cbecb](https://github.com/foXaCe/power-flow-card-plus/commit/94cbecb))
- refactor: internaliser custom-card-helpers, supprimer lit-element v2 ([aa22412](https://github.com/foXaCe/power-flow-card-plus/commit/aa22412))
- refactor(i18n): utiliser hass.locale.language au lieu de localStorage ([892efd1](https://github.com/foXaCe/power-flow-card-plus/commit/892efd1))

## <small>0.42.7 (2026-04-29)</small>

- fix(card): fuite WS, race templates, NaN/div0, shouldUpdate, drag cleanup ([ba0c07d](https://github.com/foXaCe/power-flow-card-plus/commit/ba0c07d))
- fix(editor): refondre pipeline \_valueChanged, NaN-safe, scoper preview styles ([4850b04](https://github.com/foXaCe/power-flow-card-plus/commit/4850b04))
- fix(i18n): cacher localStorage lang, resolution clef robuste, ajouter self_sufficiency ([c6e7936](https://github.com/foXaCe/power-flow-card-plus/commit/c6e7936))
- fix(style): securiser homeSources, eliminer mutations, hoister constantes ([1d86576](https://github.com/foXaCe/power-flow-card-plus/commit/1d86576))
- fix(utils): corriger bugs precedence/NaN/div0, factoriser duplication ([0044011](https://github.com/foXaCe/power-flow-card-plus/commit/0044011))
- refactor(components): factoriser individual×4 + daily×2, a11y, null-safety ([783694b](https://github.com/foXaCe/power-flow-card-plus/commit/783694b))
- ci: ajouter job lint, durcir release, retirer no-frozen-lockfile ([343d6b0](https://github.com/foXaCe/power-flow-card-plus/commit/343d6b0))
- chore(build): durcir configs rollup/babel/ts/jest ([3fd6b50](https://github.com/foXaCe/power-flow-card-plus/commit/3fd6b50))

## <small>0.42.6 (2026-02-07)</small>

- fix: correction .pre-commit-config.yaml (type tag typescript invalide) ([f2ae373](https://github.com/foXaCe/power-flow-card-plus/commit/f2ae373))
- fix: correction des 3 points d'attention de la revue de code ([cef34b3](https://github.com/foXaCe/power-flow-card-plus/commit/cef34b3))
- fix: mise à jour des URLs repository vers foXaCe fork ([5bcc877](https://github.com/foXaCe/power-flow-card-plus/commit/5bcc877))
- fix: pre-commit prettier autonome avec language: node ([87c425d](https://github.com/foXaCe/power-flow-card-plus/commit/87c425d))
- fix: résolution complète de l'audit qualité ([dc56ac4](https://github.com/foXaCe/power-flow-card-plus/commit/dc56ac4))
- fix: résolution des 17 erreurs ESLint et complétion du README ([620792e](https://github.com/foXaCe/power-flow-card-plus/commit/620792e))
- fix: utilisation du prettier local dans pre-commit pour cohérence de version ([1e20af2](https://github.com/foXaCe/power-flow-card-plus/commit/1e20af2))
- fix(ci): ajout semantic-release-replace-plugin manquant ([abcf6ff](https://github.com/foXaCe/power-flow-card-plus/commit/abcf6ff))
- fix(ci): ajout setup-node 22 pour semantic-release 25 ([0e480fa](https://github.com/foXaCe/power-flow-card-plus/commit/0e480fa))
- fix(ci): pnpm exec au lieu de pnpx pour résoudre les plugins semantic-release ([dba9fbc](https://github.com/foXaCe/power-flow-card-plus/commit/dba9fbc))
- fix(ci): suppression vérification stricte du nombre de matches dans releaserc ([e4f14aa](https://github.com/foXaCe/power-flow-card-plus/commit/e4f14aa))
- fix(ci): suppression version: latest de pnpm/action-setup ([1a488c5](https://github.com/foXaCe/power-flow-card-plus/commit/1a488c5))
- fix(deps): résolution de toutes les vulnérabilités Dependabot ([d7b2725](https://github.com/foXaCe/power-flow-card-plus/commit/d7b2725))
- style: formatage prettier et end-of-file sur les fichiers markdown ([e81975b](https://github.com/foXaCe/power-flow-card-plus/commit/e81975b))
- chore: ajout .pre-commit-config.yaml ([d909d12](https://github.com/foXaCe/power-flow-card-plus/commit/d909d12))
- chore: mise en place CI/CD God Tier ([c3846ce](https://github.com/foXaCe/power-flow-card-plus/commit/c3846ce))
- chore: suppression package-lock.json obsolète ([f6cfbf9](https://github.com/foXaCe/power-flow-card-plus/commit/f6cfbf9))
- chore(deps): bump @babel/helpers from 7.24.1 to 7.28.6 ([5e2abfc](https://github.com/foXaCe/power-flow-card-plus/commit/5e2abfc))
- chore(deps): bump @babel/runtime from 7.24.4 to 7.28.6 ([043d58d](https://github.com/foXaCe/power-flow-card-plus/commit/043d58d))
- chore(deps): bump brace-expansion from 1.1.11 to 1.1.12 ([0c92732](https://github.com/foXaCe/power-flow-card-plus/commit/0c92732))
- chore(deps): bump braces from 3.0.2 to 3.0.3 ([81532e0](https://github.com/foXaCe/power-flow-card-plus/commit/81532e0))
- chore(deps): bump cross-spawn from 7.0.3 to 7.0.6 ([e79fa34](https://github.com/foXaCe/power-flow-card-plus/commit/e79fa34))
- chore(deps): bump diff from 4.0.2 to 4.0.4 ([22f5f39](https://github.com/foXaCe/power-flow-card-plus/commit/22f5f39))
- chore(deps): bump js-yaml from 3.14.1 to 3.14.2 ([2be7ffb](https://github.com/foXaCe/power-flow-card-plus/commit/2be7ffb))
- chore(deps): bump lodash from 4.17.21 to 4.17.23 ([1e52ea2](https://github.com/foXaCe/power-flow-card-plus/commit/1e52ea2))
- chore(deps): bump lodash-es from 4.17.21 to 4.17.23 ([98408da](https://github.com/foXaCe/power-flow-card-plus/commit/98408da))
- chore(deps): bump micromatch from 4.0.5 to 4.0.8 ([05211c2](https://github.com/foXaCe/power-flow-card-plus/commit/05211c2))
- chore(deps): bump the babel group with 5 updates ([1d795ef](https://github.com/foXaCe/power-flow-card-plus/commit/1d795ef))
- chore(deps): resolve merge conflict for babel group update ([6b264e9](https://github.com/foXaCe/power-flow-card-plus/commit/6b264e9))
- Merge pull request #11 from foXaCe/dependabot/npm_and_yarn/micromatch-4.0.8 ([2c5e7af](https://github.com/foXaCe/power-flow-card-plus/commit/2c5e7af)), closes [#11](https://github.com/foXaCe/power-flow-card-plus/issues/11)
- Merge pull request #12 from foXaCe/dependabot/npm_and_yarn/lodash-4.17.23 ([f6b6852](https://github.com/foXaCe/power-flow-card-plus/commit/f6b6852)), closes [#12](https://github.com/foXaCe/power-flow-card-plus/issues/12)
- Merge pull request #13 from foXaCe/dependabot/npm_and_yarn/lodash-es-4.17.23 ([c861145](https://github.com/foXaCe/power-flow-card-plus/commit/c861145)), closes [#13](https://github.com/foXaCe/power-flow-card-plus/issues/13)
- Merge pull request #14 from foXaCe/dependabot/npm_and_yarn/babel-d3b10bd631 ([c56c801](https://github.com/foXaCe/power-flow-card-plus/commit/c56c801)), closes [#14](https://github.com/foXaCe/power-flow-card-plus/issues/14)
- Merge pull request #15 from foXaCe/dependabot/npm_and_yarn/babel/runtime-7.28.6 ([0cfeeda](https://github.com/foXaCe/power-flow-card-plus/commit/0cfeeda)), closes [#15](https://github.com/foXaCe/power-flow-card-plus/issues/15)
- Merge pull request #16 from foXaCe/dependabot/npm_and_yarn/cross-spawn-7.0.6 ([d8e5cb6](https://github.com/foXaCe/power-flow-card-plus/commit/d8e5cb6)), closes [#16](https://github.com/foXaCe/power-flow-card-plus/issues/16)
- Merge pull request #17 from foXaCe/dependabot/npm_and_yarn/js-yaml-3.14.2 ([0d10b2e](https://github.com/foXaCe/power-flow-card-plus/commit/0d10b2e)), closes [#17](https://github.com/foXaCe/power-flow-card-plus/issues/17)
- Merge pull request #18 from foXaCe/dependabot/npm_and_yarn/brace-expansion-1.1.12 ([19071d2](https://github.com/foXaCe/power-flow-card-plus/commit/19071d2)), closes [#18](https://github.com/foXaCe/power-flow-card-plus/issues/18)
- Merge pull request #19 from foXaCe/dependabot/npm_and_yarn/diff-4.0.4 ([6565ac9](https://github.com/foXaCe/power-flow-card-plus/commit/6565ac9)), closes [#19](https://github.com/foXaCe/power-flow-card-plus/issues/19)
- Merge pull request #20 from foXaCe/dependabot/npm_and_yarn/babel/helpers-7.28.6 ([1383678](https://github.com/foXaCe/power-flow-card-plus/commit/1383678)), closes [#20](https://github.com/foXaCe/power-flow-card-plus/issues/20)
- Merge pull request #6 from foXaCe/dependabot/github_actions/actions/checkout-6 ([ff788c2](https://github.com/foXaCe/power-flow-card-plus/commit/ff788c2)), closes [#6](https://github.com/foXaCe/power-flow-card-plus/issues/6)
- Merge pull request #7 from foXaCe/dependabot/github_actions/amannn/action-semantic-pull-request-6 ([d078502](https://github.com/foXaCe/power-flow-card-plus/commit/d078502)), closes [#7](https://github.com/foXaCe/power-flow-card-plus/issues/7)
- Merge pull request #8 from foXaCe/dependabot/github_actions/actions/cache-5 ([5c9c84b](https://github.com/foXaCe/power-flow-card-plus/commit/5c9c84b)), closes [#8](https://github.com/foXaCe/power-flow-card-plus/issues/8)
- Merge pull request #9 from foXaCe/dependabot/npm_and_yarn/braces-3.0.3 ([412fda7](https://github.com/foXaCe/power-flow-card-plus/commit/412fda7)), closes [#9](https://github.com/foXaCe/power-flow-card-plus/issues/9)
- ci(deps): bump actions/cache from 4 to 5 ([a8ebce3](https://github.com/foXaCe/power-flow-card-plus/commit/a8ebce3))
- ci(deps): bump actions/checkout from 4 to 6 ([023fc3e](https://github.com/foXaCe/power-flow-card-plus/commit/023fc3e))
- ci(deps): bump amannn/action-semantic-pull-request from 5 to 6 ([047d515](https://github.com/foXaCe/power-flow-card-plus/commit/047d515))

### [2.6.2](https://github.com/ulic75/power-distribution-card/compare/v2.6.1...v2.6.2) (2023-03-17)

### Bug Fixes

- number formatting ([#148](https://github.com/ulic75/power-distribution-card/issues/148)) ([4254bf7](https://github.com/ulic75/power-distribution-card/commit/4254bf754f516c1bcbb3bbb598165961493388bd)), closes [#147](https://github.com/ulic75/power-distribution-card/issues/147)

### [2.6.1](https://github.com/ulic75/power-distribution-card/compare/v2.6.0...v2.6.1) (2022-11-17)

### Bug Fixes

- **entity:** allowed for background again ([#116](https://github.com/ulic75/power-distribution-card/issues/116)) ([84335be](https://github.com/ulic75/power-distribution-card/commit/84335be83d30156c7526591cf1915cdc59665d3d))

## [2.6.0](https://github.com/ulic75/power-distribution-card/compare/v2.5.1...v2.6.0) (2022-11-16)

### Features

- add support for display of gas and water ([#110](https://github.com/ulic75/power-distribution-card/issues/110)) ([270b3e6](https://github.com/ulic75/power-distribution-card/commit/270b3e64ece2d95fd632a056c9bd0360f90dace0))

### Bug Fixes

- **solar:** text color to match energy-distribution-card ([#111](https://github.com/ulic75/power-distribution-card/issues/111)) ([efab88f](https://github.com/ulic75/power-distribution-card/commit/efab88f47f3b482383a2df4fda7b6023ac5da744))

### [2.5.1](https://github.com/ulic75/power-distribution-card/compare/v2.5.0...v2.5.1) (2022-07-05)

### Bug Fixes

- smooth out flow dots on safari based guis ([#85](https://github.com/ulic75/power-distribution-card/issues/85)) ([3ce9ebf](https://github.com/ulic75/power-distribution-card/commit/3ce9ebf47a4c638b98f722788946540ed669cda7)), closes [#82](https://github.com/ulic75/power-distribution-card/issues/82)

## [2.5.0](https://github.com/ulic75/power-distribution-card/compare/v2.4.0...v2.5.0) (2022-05-22)

### Features

- log unavailable/misconfigured entities to browser console ([#61](https://github.com/ulic75/power-distribution-card/issues/61)) ([f32576a](https://github.com/ulic75/power-distribution-card/commit/f32576a58c14666dd75e495e9d4d05a9a9c25cb3))
- off grid support ([#63](https://github.com/ulic75/power-distribution-card/issues/63)) ([7676356](https://github.com/ulic75/power-distribution-card/commit/7676356d3a6b82269e5cd22ca927c1f2674e6a8e))

### Bug Fixes

- debounce error logging ([#62](https://github.com/ulic75/power-distribution-card/issues/62)) ([de73d05](https://github.com/ulic75/power-distribution-card/commit/de73d05e5032465956c4b75ecc41c1644bb2ce64))

## [2.4.0](https://github.com/ulic75/power-distribution-card/compare/v2.3.0...v2.4.0) (2022-05-18)

### Features

- add new `dashboard_link` option (see readme) ([#46](https://github.com/ulic75/power-distribution-card/issues/46)) ([e979053](https://github.com/ulic75/power-distribution-card/commit/e97905346ec1f66a862f2fa684bf2c4f571a1b7f))
- support grid<>battery flow ([#53](https://github.com/ulic75/power-distribution-card/issues/53)) ([cf4b7b9](https://github.com/ulic75/power-distribution-card/commit/cf4b7b973c48ca8c74772e32854e6f6cb6ed143a))
- watt decimals can be configured via w_decimals option ([#52](https://github.com/ulic75/power-distribution-card/issues/52)) ([c15a375](https://github.com/ulic75/power-distribution-card/commit/c15a3754a61aaccfc1f62801915902b2e64756b8)), closes [#45](https://github.com/ulic75/power-distribution-card/issues/45)

## [2.3.0](https://github.com/ulic75/power-distribution-card/compare/v2.2.0...v2.3.0) (2022-05-13)

### Features

- add new `inverted_entities` option (see readme) ([#43](https://github.com/ulic75/power-distribution-card/issues/43)) ([53200bb](https://github.com/ulic75/power-distribution-card/commit/53200bb99583c5365ef5f760020e6208f4899b41))
- make power-flow-card available from the ui picker ([#38](https://github.com/ulic75/power-distribution-card/issues/38)) ([fa16d3d](https://github.com/ulic75/power-distribution-card/commit/fa16d3de57ac4e36a25f0a11e2200e185c36deb9))

## [2.2.0](https://github.com/ulic75/power-distribution-card/compare/v2.1.1...v2.2.0) (2022-05-11)

### Features

- add new option `kw_decimals` ([#32](https://github.com/ulic75/power-distribution-card/issues/32)) ([a2af9d0](https://github.com/ulic75/power-distribution-card/commit/a2af9d0de134ff803911c88ef5a9c1c8ea38aab5))

### Bug Fixes

- prevent negative solar state ([#25](https://github.com/ulic75/power-distribution-card/issues/25)) ([162376b](https://github.com/ulic75/power-distribution-card/commit/162376bd9ade661e0094223f911b38a57772c528)), closes [#23](https://github.com/ulic75/power-distribution-card/issues/23)

### [2.1.1](https://github.com/ulic75/power-distribution-card/compare/v2.1.0...v2.1.1) (2022-05-10)

### Bug Fixes

- round watts to 1 decimal place ([#22](https://github.com/ulic75/power-distribution-card/issues/22)) ([2606dbd](https://github.com/ulic75/power-distribution-card/commit/2606dbd3623e49c3e8418ee75f12c78361052258))

## [2.1.0](https://github.com/ulic75/power-distribution-card/compare/v2.0.0...v2.1.0) (2022-05-09)

### Features

- support watts and kilowats ([#18](https://github.com/ulic75/power-distribution-card/issues/18)) ([9596eeb](https://github.com/ulic75/power-distribution-card/commit/9596eebe336cf12798386da1a3bdeebb457cf567))

## [2.0.0](https://github.com/ulic75/power-distribution-card/compare/v1.2.0...v2.0.0) (2022-05-09)

### ⚠ BREAKING CHANGES

- card name

card type will need to be changed from `custom:power-distribution-card` to `custom:power-flow-card`

### Miscellaneous Chores

- rename to power-flow-card ([#17](https://github.com/ulic75/power-distribution-card/issues/17)) ([bb26ad7](https://github.com/ulic75/power-distribution-card/commit/bb26ad7a498ddd77f72d81939769c48f786a09bd)), closes [#15](https://github.com/ulic75/power-distribution-card/issues/15)

## [1.2.0](https://github.com/ulic75/power-distribution-card/compare/v1.1.1...v1.2.0) (2022-05-03)

### Features

- support split consumption/production entities ([#12](https://github.com/ulic75/power-distribution-card/issues/12)) ([da78757](https://github.com/ulic75/power-distribution-card/commit/da78757a54efedf79d34c296dd4029f481ec67ac)), closes [#8](https://github.com/ulic75/power-distribution-card/issues/8)

### Bug Fixes

- always show solar value for consistency ([#9](https://github.com/ulic75/power-distribution-card/issues/9)) ([adf4d15](https://github.com/ulic75/power-distribution-card/commit/adf4d155b74ae78ad93422b8f5fa92189d0d1a29))
- detection of grid return ([#13](https://github.com/ulic75/power-distribution-card/issues/13)) ([adeee30](https://github.com/ulic75/power-distribution-card/commit/adeee30a75adb67b713d6900dcd6c099c46ed808))
- display issue without battery_charge entity ([#11](https://github.com/ulic75/power-distribution-card/issues/11)) ([79f84ca](https://github.com/ulic75/power-distribution-card/commit/79f84cac373878334ddff5a8459fdfe5bd5dc342))

## [1.1.1](https://github.com/ulic75/power-distribution-card/compare/v1.1.0...v1.1.1) (2022-04-29)

### Bug Fixes

- rename card to power-distribution-card ([6678525](https://github.com/ulic75/power-distribution-card/commit/667852570cf2e5eb06509ac1717c25a91cff6faa))

## [1.1.0](https://github.com/ulic75/power-distribution-card/compare/v1.0.0...v1.1.0) (2022-04-28)

### Features

- **flow:** add optional rate configuration ([#5](https://github.com/ulic75/power-distribution-card/issues/5)) ([f258f49](https://github.com/ulic75/power-distribution-card/commit/f258f49eaa5d2faa8d90830e04c52301a71ed60c))

## 1.0.0 (2022-04-28)

### Features

- initial release ([#2](https://github.com/ulic75/power-distribution-card/issues/2)) ([93e9da1](https://github.com/ulic75/power-distribution-card/commit/93e9da17c9af172a9d3898f8d6dc2f49df5abfac))

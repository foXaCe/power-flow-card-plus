module.exports = {
  branches: ["main", { name: "dev", prerelease: true }],
  preset: "conventionalcommits",
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", { npmPublish: false }],
    // Build the bundle AFTER @semantic-release/npm bumps package.json to the
    // release version, so `import { version } from "../package.json"` embeds the
    // real version into the dist banner. Replaces the old
    // semantic-release-replace-plugin string-rewrite, which silently no-op'd once
    // the banner compiled to `v${version}` (a minified variable, never a literal
    // the regex could match) — so every release shipped the stale committed
    // version (users saw v0.44.1 no matter which release they installed).
    ["@semantic-release/exec", { prepareCmd: "pnpm build" }],
    // NOTE: @semantic-release/git a été retiré. Il committait le bump de version
    // + changelog directement sur `main`, ce que la protection de branche
    // (status checks requis) rejette pour le bot de release. La version vit donc
    // dans le tag git + la GitHub Release (source de vérité pour HACS) plutôt
    // que dans package.json/CHANGELOG.md. Pour réactiver le commit-back, donner
    // un PAT avec bypass de la branch protection au workflow Release.
    [
      "@semantic-release/github",
      {
        assets: "dist/*.js",
      },
    ],
  ],
};

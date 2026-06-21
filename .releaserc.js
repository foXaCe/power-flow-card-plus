module.exports = {
  branches: ["main", { name: "dev", prerelease: true }],
  preset: "conventionalcommits",
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "semantic-release-replace-plugin",
      {
        replacements: [
          {
            files: ["dist/power-flow-card-plus.js"],
            from: /Power Flow Card Plus v(\d+\.\d+\.\d+)/g,
            to: "Power Flow Card Plus v${nextRelease.version}",
          },
        ],
      },
    ],
    ["@semantic-release/npm", { npmPublish: false }],
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

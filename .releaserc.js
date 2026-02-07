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
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", "README.md", "package.json", "pnpm-lock.yaml"],
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: "dist/*.js",
      },
    ],
  ],
};

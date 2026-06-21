// Babel n'est plus utilisé pour le build (Rollup émet de l'ES2022 sans transpilage).
// Il ne sert plus qu'à `babel-jest`, qui transforme l'ESM de Lit (.mjs/.js dans
// node_modules) en CJS pour l'environnement jsdom de Jest. Ces fichiers ne sont
// pas du TypeScript (ts-jest gère les .ts), donc preset-typescript est inutile.
// Cible : Node courant.
module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
};

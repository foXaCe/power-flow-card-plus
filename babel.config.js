module.exports = (api) => {
  const isTest = api.env('test');
  return {
    presets: [
      ['@babel/preset-env', { targets: isTest ? { node: 'current' } : '> 0.5%, last 2 versions, not dead, not IE 11' }],
      '@babel/preset-typescript',
    ],
  };
};

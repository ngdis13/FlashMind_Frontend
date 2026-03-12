const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // Настройка SVG
  config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer/expo');
  config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
  
  // Добавляем mjs и cjs в начало списка расширений
  config.resolver.sourceExts = ['mjs', 'cjs', ...config.resolver.sourceExts, 'svg'];

  return config;
})();

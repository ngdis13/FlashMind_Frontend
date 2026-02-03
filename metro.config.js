
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);

  // SVG transformer — именно так, без лишних ...spread
  config.transformer.babelTransformerPath =
    require.resolve('react-native-svg-transformer/expo');

  // Обязательно убираем svg из assetExts и добавляем в sourceExts
  config.resolver.assetExts = config.resolver.assetExts.filter(
    (ext) => ext !== 'svg'
  );
  config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

  return config;
})();
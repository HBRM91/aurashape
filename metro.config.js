const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

config.maxWorkers = 1;
config.watchFolders = [__dirname];

config.resolver = {
  ...config.resolver,
  blockList: [/\.git\/.*/],
};

module.exports = withNativeWind(config, { input: './global.css' });

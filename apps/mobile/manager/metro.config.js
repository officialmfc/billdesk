const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  "expo-navigation-bar": path.dirname(
    require.resolve("expo-navigation-bar/package.json", { paths: [__dirname] })
  ),
};

module.exports = config;

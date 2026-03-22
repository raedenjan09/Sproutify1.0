const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const blockList = Array.isArray(config.resolver.blockList)
  ? config.resolver.blockList
  : [config.resolver.blockList];

if (!config.resolver.assetExts.includes('wasm')) {
  config.resolver.assetExts.push('wasm');
}

// Watchman is not available in this Windows/OneDrive setup, so force Metro
// to use the node filesystem crawler and watcher instead of timing out.
config.resolver.useWatchman = false;
// Keep Metro in-process to avoid EPERM child-process spawn failures on Windows.
config.maxWorkers = 1;
config.resolver.blockList = [
  ...blockList,
  new RegExp(`${escapeRegExp(__dirname)}[\\\\/]dist(?:-[^\\\\/]+)?(?:[\\\\/].*)?$`),
];

module.exports = config;

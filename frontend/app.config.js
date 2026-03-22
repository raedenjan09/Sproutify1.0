const { expo } = require('./app.json');

module.exports = () => {
  const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;
  const facebookClientToken = process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN;
  const googleServicesFile = process.env.GOOGLE_SERVICES_JSON || expo.android?.googleServicesFile;
  const plugins = [...(expo.plugins || [])];

  if (facebookAppId) {
    const hasFacebookPlugin = plugins.some(
      (plugin) => Array.isArray(plugin) && plugin[0] === 'react-native-fbsdk-next'
    );

    if (!hasFacebookPlugin) {
      plugins.push([
        'react-native-fbsdk-next',
        {
          appID: facebookAppId,
          clientToken: facebookClientToken || undefined,
          displayName: expo.name,
          scheme: `fb${facebookAppId}`,
          isAutoInitEnabled: true,
          autoLogAppEventsEnabled: false,
          advertiserIDCollectionEnabled: false,
        },
      ]);
    }
  }

  return {
    ...expo,
    android: {
      ...expo.android,
      ...(googleServicesFile ? { googleServicesFile } : {}),
    },
    plugins,
  };
};

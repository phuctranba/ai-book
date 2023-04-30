// // metro.config.js
const path = require('path')
const { getDefaultConfig } = require('metro-config');
/**
 * Jamviet.com refactor ...
 * Dont modify this file
 */
module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();
  return {
    transformer: {
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
      minifierConfig: {
        "mangle": {
          "toplevel": true,
          "reserved": [
            "BigInteger",
            "ECPair",
            "Point"
          ]
        }
      }
    },
    watchFolders: [
      path.resolve(__dirname, './src/assets'),
      path.resolve(__dirname, './src/components'),
      path.resolve(__dirname, './src/navigation'),
      path.resolve(__dirname, './src/screens'),
      path.resolve(__dirname, './src/ui'),
      path.resolve(__dirname, './src/store'),
      path.resolve(__dirname, './src/helpers'),
      path.resolve(__dirname, './src/models'),
      path.resolve(__dirname, './src/configs'),
      path.resolve(__dirname, './src/constants'),
    ],
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      extraNodeModules: new Proxy(
        {},
        {
          get: (target, name) => {
            if (target.hasOwnProperty(name)) {
              return target[name]
            }
            return path.join(process.cwd(), `./src/${name}`)
          },
        },
      ),
    },
  }

});

require('dotenv').config({ path: process.env.DOTENV_PATH });

const config = {
  appId: 'com.usebruno.app',
  productName: 'Bruno',
  electronVersion: '33.2.1',
  directories: {
    buildResources: 'resources',
    output: 'out'
  },
  files: ['**/*'],
  afterSign: 'notarize.js',
  mac: {
    artifactName: '${name}_${version}_${arch}_${os}.${ext}',
    category: 'public.app-category.developer-tools',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      },
      {
        target: 'zip',
        arch: ['x64', 'arm64']
      }
    ],
    icon: 'resources/icons/mac/icon.icns',
    hardenedRuntime: true,
    identity: 'Anoop MD (W7LPPWA48L)',
    entitlements: 'resources/entitlements.mac.plist',
    entitlementsInherit: 'resources/entitlements.mac.plist'
  },
  linux: {
    artifactName: '${name}_${version}_${arch}_linux.${ext}',
    icon: 'resources/icons/png',
    target: ['AppImage', 'deb', 'snap', 'rpm']
  },
  win: {
    artifactName: '${name}_${version}_${arch}_win.${ext}',
    icon: 'resources/icons/png',
    publisherName: 'Anoop MD',
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ]
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    installerIcon: "resources/icons/win/icon.ico",
    uninstallerIcon: "resources/icons/win/icon.ico",
    installerHeaderIcon: "resources/icons/win/icon.ico",
    warningsAsErrors: false
  }
};

module.exports = config;

const path = require("path");
const fs = require("fs");

module.exports = {
  name: "Business Copilot",
  appBundleId: "business-copilot.desktop-app",
  // asar: true,
  packagerConfig: {
    executableName: "Business Copilot",
    icon: path.resolve(__dirname, "icons", "icon"),
    osxSign: {
      // "hardened-runtime": true,
      // "gatekeeper-assess": false,
    },
    // osxNotarize: {
    //   tool: "notarytool",
    //   appleId: process.env.APPLE_ID,
    //   appleIdPassword: process.env.APPLE_ID_PASSWORD,
    //   teamId: process.env.APPLE_TEAM_ID,
    // },
  },
  rebuildConfig: {},
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'akpor-kofi',
          name: 'business-copilot-desktop'
        },
        prerelease: true,
        authToken: process.env.GITHUB_TOKEN
      }
    }
  ],
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
};
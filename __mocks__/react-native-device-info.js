import Config from './../package.json'

export default {
  getBuildNumber: () => Config.version,
  getUniqueID: () => Math.random().toString(36).substr(2, 9),
  getDeviceId: () => 123456789
}

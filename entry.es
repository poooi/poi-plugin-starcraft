import 'views/env'

import i18n2 from 'i18n-2'
import path from 'path-extra'
import { remote } from 'electron'
import { debounce } from 'lodash'

const i18n = new i18n2({
  locales: ['en-US', 'ja-JP', 'zh-CN', 'zh-TW', 'ko-KR'],
  defaultLocale: 'zh-CN',
  directory: path.join(__dirname, 'assets', 'i18n'),
  devMode: false,
  extension: '.json',
})
i18n.setLocale(window.language)

if (i18n.resources == null) {
  i18n.resources = {}
}

if (i18n.resources.__ == null) {
  i18n.resources.__ = str => str
}
if (i18n.resources.translate == null) {
  i18n.resources.translate = (locale, str) => str
}
if (i18n.resources.setLocale == null) {
  i18n.resources.setLocale = (str) => {}
}
window.i18n = i18n
try {
  require('poi-plugin-translator').pluginDidLoad()
} catch (error) {
  console.info("failed to load poi-plugin-translator")
}

window.__ = i18n.__.bind(i18n)
window.__r = i18n.resources.__.bind(i18n.resources)

// augment font size with poi zoom level
const zoomLevel = config.get('poi.zoomLevel', 1)
const additionalStyle = document.createElement('style')

remote.getCurrentWindow().webContents.on('dom-ready', (e) => {
  document.body.appendChild(additionalStyle)
})

additionalStyle.innerHTML = `
  ship-info,
  .info-tooltip {
    font-size: ${zoomLevel * 100}%;
  }
`
// remember window size
window.starcraftWindow = remote.getCurrentWindow()

const rememberSize = debounce(() => {
  const b = window.starcraftWindow.getBounds()
  config.set('plugin.Starcraft.bounds', b)
}, 5000)

window.starcraftWindow.on('move', rememberSize)
window.starcraftWindow.on('resize', rememberSize)

require('./Main')

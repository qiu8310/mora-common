const EOL = require('os').EOL
const rawmap = require('./index.d.json')
const map = {}
Object.keys(rawmap).forEach(file => {
  rawmap[file].forEach(field => (map[field] = file))
})

module.exports = function(content) {
  this.cacheable && this.cacheable()
  // let replaced = false

  content = content.replace(/^\s*(import|export)\s+\{([^}]+)\}\s+from\s+(['"])mora-common\3/mg, (raw, inOut, rawimports, quote) => {
    const imports = {}
    const importFiles = []
    // replaced = true
    rawimports.trim().split(/\s*,\s*/).forEach(field => {
      let file = map[/^(\w+)\s+as\s+\w+$/.test(field) ? RegExp.$1 : field]

      if (!file) {
        throw new Error(`要导出的字段 "${field}" 不在 mora-common 的 map 文件中`)
      }

      if (!imports[file]) {
        importFiles.push(file)
        imports[file] = []
      }

      imports[file].push(field)
    })

    return importFiles.map(file => `${inOut} { ${imports[file].join(', ')} } from ${quote}mora-common/${file}${quote}`).join(EOL)
  })

  // if (replaced) console.log(content)

  return content
}

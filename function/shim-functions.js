/**
 * Create shims in the project root directory to overcome limitation of function apps with monorepo dependencies:
 * https://github.com/Azure/azure-functions-host/issues/7345
 */
const fsPromises = require('fs/promises')
const path = require('path')

const findFunctions = async (dirPath) => await Promise.all(
  (await fsPromises.readdir(dirPath)).map(async (entity) => {
    const curPath = path.join(dirPath, entity)
    if ((await fsPromises.lstat(curPath)).isDirectory())
      return await findFunctions(curPath)
    else if (entity === 'function.json')
      return curPath
  }),
)

async function main() {
  let functionFiles = await findFunctions('./function')
  functionFiles = functionFiles.flat(Number.POSITIVE_INFINITY)
  functionFiles = functionFiles.filter(f => f !== undefined)

  for (const file of functionFiles) {
    const cwd = process.cwd()
    const dir = file.split('/').slice(-2).slice(0, 1)[0] // get directory name
    await fsPromises.mkdir(path.join(cwd, dir), { recursive: true })
    let functionJSON = require(path.join(cwd, file))
    functionJSON.scriptFile = functionJSON.scriptFile.replace('../dist', `../function/dist`)
    await fsPromises.writeFile(path.join(cwd, dir, 'function.json'), JSON.stringify(functionJSON, null, 2))
  }
}

main()
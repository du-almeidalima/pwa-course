/**
 * @param name {string}
 * @param message {string}
 * @param args {any[]}
 */
const log = (name, message, ...args) => {
  console.log(`[ ${name} ]: ${message}`, ...args)
}

/**
 * @param name {string}
 */
export const loggerFactory = (name) => {
  return (message, ...args) => log(name, message, ...args)
}
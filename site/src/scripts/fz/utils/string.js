const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const COUNT_CHARS = CHARS.length

module.exports.generate = () => {
    s = ""

    for( let i = 0; i < 14; i++ ) {
        idx = Math.random() * COUNT_CHARS >> 0
        s += CHARS[ idx ]
    }

    return s
}

module.exports.capitalizeFirstLetter = ( string ) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

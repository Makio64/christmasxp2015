module.exports.indexOf = ( dom ) => {
  return Array.prototype.indexOf.call( dom.parentNode.children, dom )
}

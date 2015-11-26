let style = window.getComputedStyle( document.documentElement, "" )
let vendor = ( Array.prototype.slice.call( style ).join( "" ).match( /-(moz|webkit|ms)-/ ) || ( style.OLink == "" && [ "", "o" ] ) )[ 1 ]
if ( vendor == "moz" ) {
    vendor = "Moz" 
}

module.exports.vendor = vendor
module.exports.transform = vendor + "Transform"
module.exports.transformOrigin = vendor + "TransformOrigin"

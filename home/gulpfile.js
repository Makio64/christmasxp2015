var fs = require( "fs" );
var tasks = fs.readdirSync( "./gulp" );

tasks.forEach( function( name ) {
  if( name.slice( -3 ) != ".js" ) {
    return;
  }
  require( "./gulp/" + name );
});

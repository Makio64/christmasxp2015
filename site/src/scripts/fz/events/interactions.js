const browsers = require( "fz/utils/browsers" )

var downs = {};
var moves = {};
var ups = {};
var clicks = {};
var overs = {};
var outs = {};

var interactions = [ downs, moves, ups, clicks ];

var isTouchDevice = browsers.mobile || browsers.tablet

function getEvent( action ) {
  var evt = "";
  if( isTouchDevice ) {

    if (window.navigator.msPointerEnabled) {
      switch( action ) {
        case "down": evt = "MSPointerDown"; break;
        case "move": evt = "MSPointerMove"; break;
        case "up": evt = "MSPointerUp"; break;
        case "click": evt = "MSPointerUp"; break;
      }

      //console.log("evt", evt, action);

    } else {
      switch( action ) {
        case "down": evt = "touchstart"; break;
        case "move": evt = "touchmove"; break;
        case "up": evt = "touchend"; break;
        case "click": evt = "touchstart"; break;
      }
    }


  } else {
    switch( action ) {
      case "down": evt = "mousedown"; break;
      case "move": evt = "mousemove"; break;
      case "up": evt = "mouseup"; break;
      case "click": evt = "click"; break;
      case "over": evt = browsers.safari ? "mouseover" : "mouseenter"; break;
      case "out": evt = browsers.safari ? "mouseout" : "mouseleave"; break;
    }
  }
  return evt;
}

function getObj( action ) {
  switch( action ) {
    case "down": return downs;
    case "move": return moves;
    case "up": return ups;
    case "click": return clicks;
    case "over": return overs;
    case "out": return outs;
  }
}

function find( cb, datas ) {
  var data = null;
  for( var i = 0, n = datas.length; i < n; i++ ) {
    data = datas[ i ];
    if( data.cb == cb ) {
      return { data: data, idx: i };
    }
  }
  return null;
}

module.exports.on = function( elt, action, cb ) {
  var evt = getEvent( action );
  if( evt == "" ){
    return;
  }

  var obj = getObj( action );
  if( !obj[ elt ] ) {
    obj[ elt ] = [];
  }

  var isOver = false;

  function proxy( e ) {
    e = { x: 0, y: 0, origin: e };

    if( isTouchDevice ) {

      if (window.navigator.msPointerEnabled) {
          // mspointerevents
          e.x = e.origin.clientX;
          e.y = e.origin.clientY;

      } else {
        var touch = e.origin.touches[ 0 ];
        if( touch ) {
          e.x = touch.clientX;
          e.y = touch.clientY;
        }
      }

    } else {
      e.x = e.origin.clientX;
      e.y = e.origin.clientY;
    }

    cb.call( this, e );
  }

  obj[ elt ].push( { cb: cb, proxy: proxy } );
  elt.addEventListener( evt, proxy, false );
}

module.exports.off = function( elt, action, cb ) {
  var evt = getEvent( action );
  if( evt == "" ) {
    return;
  }

  var obj = getObj( action );
  if( !obj[ elt ] ) {
    return;
  }

  var datas = obj[ elt ];
  if( cb ) {
    var result = find( cb, datas );
    if( !result ) {
      return;
    }
    elt.removeEventListener( evt, result.data.proxy, false );
    obj[ elt ].splice( result.idx, 1 );
  } else {
    var data = null;
    for( var i = 0, n = datas.length; i < n; i++ ) {
      data = datas[ i ];
      elt.removeEventListener( evt, data.proxy, false );
    }
    obj[ elt ] = null;
    delete obj[ elt ];
  }
}

module.exports.has = function( elt, action, cb ) {
  var evt = getEvent( action );
  if( evt == "" ) {
    return;
  }

  var obj = getObj( action );
  if( !obj[ elt ] ) {
    return;
  }

  var datas = obj[ elt ];
  if( cb ) {
    return true;
  }
  return false;
}

module.exports.unbind = function( elt ) {
  for( var i = 0, n = interactions.length; i < n; i++ ) {
    interactions[ i ][ elt ] = null;
    delete interactions[ i ][ elt ];
  }
}

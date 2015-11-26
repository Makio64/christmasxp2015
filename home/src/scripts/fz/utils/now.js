module.exports = ( () => {

  const perf = window && window.performance
  if( perf && perf.now ) {
    return perf.now.bind( perf )
  } else {
    return () => {
      return new Date().getTime()
    }
  }

} )()

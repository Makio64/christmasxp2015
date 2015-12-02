const generateObjectShow = ( datas, percent ) => {
  const o = {}

  let data = null
  const n = datas.length
  for( let i = 0; i < n; i++ ) {
    data = datas[ i ]
    o[ data.id ] = data.from + ( data.to - data.from ) * percent
  }

  return o
}

module.exports.animify = ( id, from, to ) => {
  return { id: id, from: from, to: to }
}

module.exports.showSpeedCSS = ( dom, datas, delay = 0 ) => {
  const first = generateObjectShow( datas, .2 )
  const second = generateObjectShow( datas, .625 )
  const third = generateObjectShow( datas, 1 )

  first.force3D = second.force3D = third.force3D = true

  TweenLite.killTweensOf( dom )
  TweenLite.to( dom, .125, {
    delay: delay,
    css: first,
    ease: Sine.easeIn
  })
  TweenLite.set( dom, {
    delay: delay + .1,
    css: second
  })
  TweenLite.to( dom, .2, {
    delay: delay + .1,
    css: third,
    ease: Cubic.easeOut
  })
}

module.exports.hideSpeedCSS = ( dom, datas, delay = 0 ) => {
  const first = generateObjectShow( datas, .3 )
  const second = generateObjectShow( datas, .15 )
  const third = generateObjectShow( datas, 0 )

  first.force3D = second.force3D = third.force3D = true

  TweenLite.killTweensOf( dom )
  TweenLite.to( dom, .1, {
    delay: delay,
    css: first,
    ease: Cubic.easeIn
  })
  TweenLite.set( dom, {
    delay: delay + .1,
    css: second
  })
  TweenLite.to( dom, .2, {
    delay: delay + .1,
    css: third,
    ease: Cubic.easeOut
  })
}

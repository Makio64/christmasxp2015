withQueryStrings = ( request ) ->
  request._query = [Date.now().toString()]
  request

module.exports.noCache = ( request ) ->
  request.set('X-Requested-With', 'XMLHttpRequest');
  request.set('Cache-Control', 'no-cache,no-store,must-revalidate,max-age=-1');

  if bowser.msie 
    withQueryStrings request 
  request


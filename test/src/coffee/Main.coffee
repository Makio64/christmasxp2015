Scene = require('core/scenes/Scene')


class Main extends Scene

	@init = (@callback)->
		if(@callback)
			@load()
		else
			@onLoadComplete()
		return

	@load = ()=>
		@onLoadComplete()
		return

	@onLoadComplete = (e)=>
		if(@callback)
			@callback()
		else
			@start()
		return

	@start = ()=>
		console.log('Helloooow :)')
		@resetField()
		@main = document.querySelector('#main')
		@main.className+='hideOut'
		@form = document.querySelector('#form')
		@form.addEventListener('submit',@onSubmit)
		@allgood = document.querySelector('#allgood')
		@allgood.addEventListener('click',@startIframe)
		return

	@startIframe = ()=>

		document.body.removeChild(document.querySelector('#main'))

		iframe = document.createElement('iframe')
		iframe.src = encodeURI(@url)
		document.body.appendChild(iframe)

		layout = document.createElement('div')
		layout.id = 'layout'

		logo = document.createElement('div')
		logo.id = 'logo'
		layout.appendChild(logo)

		next = document.createElement('div')
		next.id = 'next'
		layout.appendChild(next)

		prev = document.createElement('div')
		prev.id = 'prev'
		layout.appendChild(prev)

		share = document.createElement('div')
		share.id = 'share'
		layout.appendChild(share)

		xpinfos = document.createElement('div')
		xpinfos.id = 'xpinfos'
		layout.appendChild(xpinfos)

		document.body.appendChild(layout)
		return

	@onSubmit = (e)=>
		e.preventDefault()
		@input = document.querySelector('input')
		@resetField()
		@checkURL(@input.value)

	@checkURL = (url)=>
		@url = url
		xhr = new XMLHttpRequest()
		xhr.open('get', "./proxy.php?url=#{url}", true);
		xhr.onreadystatechange = ()=>
			if(xhr.readyState == 4)
				if(xhr.status == 200)
					response = JSON.parse(xhr.responseText)
					if(parseInt(response.status.http_code)==200)
						@updateField('html','index.html : page found', 'success')
						@checkJSON(url+'/infos.json')
						@checkImg(url,'facebook',1200,630)
						@checkImg(url,'twitter',590,295)
						@checkImg(url,'preview',640,640)
						@checkImg(url,'author',640,640)
					else
						@updateField('html','index.html : page not found', 'error')
		xhr.send(null)
		return

	@checkJSON = (url)=>
		xhr = new XMLHttpRequest()
		xhr.open('get', "./proxy.php?url=#{url}", true);
		xhr.onreadystatechange = ()=>
			if(xhr.readyState == 4)
				if(xhr.status == 200)
					response = JSON.parse(xhr.responseText)
					if(parseInt(response.status.http_code)==200)
						infos = response.contents
						if(infos.author == undefined)
							@updateField('json','infos.json: author missing', 'error')
						else if(infos.nickname == undefined)
							@updateField('json','infos.json: nickname missing', 'error')
						else if(infos.website == undefined)
							@updateField('json','infos.json: website field missing', 'error')
						else if(!@isURL(infos.website)&&infos.website!='')
							@updateField('json','infos.json: website field have to be empty or an url', 'error')
						else if(infos.twitter == undefined)
							@updateField('json','infos.json: twitter missing', 'error')
						else if(infos.title == undefined)
							@updateField('json','infos.json: title missing', 'error')
						else if(infos.technology == undefined)
							@updateField('json','infos.json: technology missing', 'error')
						else if(infos.description == undefined)
							@updateField('json','infos.json: description missing', 'error')
						else if(infos.casestudy == undefined)
							@updateField('json','infos.json: casestudy missing', 'error')
						else if(!@isURL(infos.casestudy)&&infos.casestudy!='')
							@updateField('json','infos.json: casestudy field have to be empty or an url', 'error')
						else if(infos.source == undefined)
							@updateField('json','infos.json: source missing', 'error')
						else if(!@isURL(infos.source)&&infos.source!='')
							@updateField('json','infos.json: source field have to be empty or an url', 'error')
						else if(infos.mobileFriendly == undefined)
							@updateField('json','infos.json: mobileFriendly missing', 'error')
						else if(isNaN(infos.mobileFriendly) && (parseInt(infos.mobileFriendly) != 1 && parseInt(infos.mobileFriendly) != 0))
							@updateField('json','infos.json: mobileFriendly should be 1 or 0', 'error')
						else
							@updateField('json',"infos.json : valid found<br/><pre>#{JSON.stringify(response.contents,undefined,2)}</pre>", 'success')
					else
						@updateField('json','infos.json: not found', 'error')
		xhr.send(null)
		return

	@isURL = (str) ->
		pattern = '^(https?:\\/\\/)?'+
				  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+
				  '((\\d{1,3}\\.){3}\\d{1,3}))'+
				  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
				  '(\\?[;&a-z\\d%_.~+=-]*)?'+
				  '(\\#[-a-z\\d_]*)?$'

		reg = new RegExp(pattern,'i')
		return reg.test(str)

	@checkImg = (url,field,width,height)=>
		url = url+'/'+field+'.jpg'
		img = new Image()
		img.onload = ()=>
			if(img.width!=width || img.height!=height)
				@updateField(field, "#{field}.jpg wrong dimension, must be:(#{width}x#{height})",'error')
			else
				@updateField(field, "#{field}.jpg valid <img src='#{url}'/>",'success')
		img.onerror = ()=>
			@updateField(field, "#{field}.jpg not found", "error")
		img.src = url
		return


	@updateField = (id, message, className)=>
		@field = document.querySelector('#'+id)
		@field.innerHTML = message
		@field.className = className
		@checkAllGood()
		return

	@checkAllGood = ()=>
		divs = document.querySelectorAll('#check div')
		error = false
		for d in divs
			if (d.className != 'success')
				error = true
		@field = document.querySelector('#allgood')
		if(!error)
			@field.className = ''
		else
			@field.className = 'hide'
		return

	@resetField = ()=>
		divs = document.querySelectorAll('#check div')
		for d in divs
			d.className = ''
			d.innerHTML = d.dataset.placeholder
		return

module.exports = Main

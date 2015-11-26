uimg = require "fz/utils/images"
stage = require "fz/core/stage"

class ImageResizable

    constructor: ( @dom, @_domImg ) ->
        @_getOriginSize()
        @_isInit = @_w != 0
        if !@_isInit
            @_load()
        else
            @_getOriginSize()
        
        @resize()

    _load: ->
        @_domImg.onload = => 
            @_domImg.onload = null

            @_getOriginSize()
            @_isInit = true
            @resize()

    _getOriginSize: ->
        @_w = @_domImg.width
        @_h = @_domImg.height

    resize: ->
        return if !@_isInit

        @_getOriginSize() if @_w == 0
        w = @dom.offsetWidth 
        h = @dom.offsetHeight

        data = uimg.fit @_w, @_h, w, h
        p = @_domImg.style.position
        @_domImg.style.position = "relative" if !p || p == ""
        @_domImg.style.left = data.x + "px"
        @_domImg.style.top = data.y + "px"
        @_domImg.width = data.w 
        @_domImg.height = data.h


    activate: ->
        stage.on "resize", @_onResize

    deactivate: ->
        stage.off "resize", @_onResize

    _onResize: =>
        @resize()

module.exports = ImageResizable

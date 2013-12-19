define ->

  class ToolTip extends google.maps.OverlayView
    constructor: (@map) ->
      @mapDiv = $(@map.getDiv())

    container: $("<div/>",
      class: "hood_info_window"
    )
    addressBar: $('#address_search')
    listeners: []
    offset:
      x: 20
      y: 20

    draw: ->
      projection = @getProjection()
      return  unless projection

      px = projection.fromLatLngToDivPixel(@position)
      return unless px

      @container.css
        left: @getLeft(px)
        top:  @getTop(px)

    destroy: ->
      @setMap(null)
      @clearListeners()

    onAdd: ->
      @container.appendTo @getPanes().floatPane

    onRemove: ->
      @container.hide()

    setContent: (html) ->
      @setMap(@map)
      @container.html(html)
      @show()

    updatePosition: (overlay) ->
      @listeners.push google.maps.event.addListener overlay, "mousemove", (event) =>
        @onMouseMove(event.latLng)

    onMouseMove: (latLng) ->
      @position = latLng
      @draw()

    hide: ->
      @container.hide().empty()
      @clearListeners()

    show: ->
      @container.show()

    clearListeners: ->
      for listener in @listeners
        google.maps.event.removeListener(listener)

    getLeft: (position) ->
      centerOffsetX = @mapRealCenter().x - @mapCenter().x
      pos = @mapWidth() - position.x - @container.outerWidth() - @offset.x - centerOffsetX

      if pos < 0
        @mapWidth() - @container.outerWidth() - @offset.x - centerOffsetX
      else
        position.x + @offset.x

    getTop: (position) ->
      top = @mapHeight() - position.y
      height = @container.outerHeight() + @offset.y
      centerOffsetY = Math.abs(@mapRealCenter().y - @mapCenter().y)
      addressBarHeight = (@addressBar.outerHeight() or 0) + @offset.y

      bottom = (@mapHeight() - top - height - addressBarHeight - centerOffsetY)
      isBottom = bottom < 0
      if isBottom
        centerOffsetY + addressBarHeight
      else
        @mapHeight() - top - height

    mapWidth: ->
      @mapDiv.outerWidth()

    mapHeight: ->
      @mapDiv.outerHeight()

    mapCenter: ->
      @getProjection().fromLatLngToDivPixel(@map.getCenter())

    mapRealCenter: ->
      new google.maps.Point(@mapWidth() / 2, @mapHeight() / 2)





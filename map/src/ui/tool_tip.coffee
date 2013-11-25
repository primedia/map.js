define ->

  class ToolTip extends google.maps.OverlayView
    constructor: (@map) ->
      @mapDiv = $(@map.getDiv())

    container: $("<div/>",
      class: "hood_info_window"
    )
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
      console.log 'updatePosition'
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
      pos = @mapWidth() - position.x - @container.outerWidth() - @offset.x
      if pos < 0
        @mapWidth() - @container.outerWidth() - @offset.x
      else
        position.x + @offset.x

    getTop: (position) ->

      top = @mapHeight() - position.y
      height = @container.outerHeight() + (@offset.y )

      isTop = (top + height) > @mapHeight()
      isBottom = (top - height) < 0
      if isTop
        newTop = top + height
      else if isBottom
        @mapHeight() - top - height
      else
        @mapHeight() - top - height

    mapWidth: ->
      @mapDiv.outerWidth()

    mapHeight: ->
      @mapDiv.outerHeight()




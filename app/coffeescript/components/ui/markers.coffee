'use strict'

define [
  'jquery'
  'flight/lib/component'
  'map/components/mixins/clusters'
  'map/marker_with_label'
  'map/components/mixins/map_utils'
  'map/components/mixins/stored_markers'
], (
  $
  defineComponent
  clusters
  markerWithLabelFactory
  mapUtils
  storedMarkers
) ->

  markersOverlay = ->
    @defaultAttrs
      searchGeoData: {}
      listingCountSelector: '#mapview_listing_count'
      listingCountText: 'Apartments Found: '
      markers: []
      markersIndex: {}
      gMap: undefined
      markerClusterer: undefined
      MarkerWithLabel: undefined

      # Example:
      # (datum) ->
      #    content: datum.price_range
      #      anchor:
      #        x: 27
      #        y: 28
      #      cssClass: 'my-map-pin-label'
      markerLabelOptions: (datum) -> undefined
      markerOptions:
       fitBounds: false
      shouldCluster: (markers) ->
        true

      mapPin: ''       # can be either a function, Icon options, or url to the pin.
      mapPinShadow: '' # can be either a function, Icon options, or url to the pin.
      saveMarkerClick: false

    @prepend_origin = (value) ->
      value = "#{@assetOriginFromMetaTag()}#{value}"

    @initAttr = (ev, data) ->
      @attr.gMap = data.gMap if data.gMap
      @attr.mapPin = data.mapPin if data.mapPin
      @attr.mapPinShadow = data.mapPinShadow if data.mapPinShadow

    @render = (ev, data) ->
      @addMarkers(data)

    @updateCluster = (markers) ->
      if @attr.shouldCluster(markers)
        @initClusterer @attr.gMap
        @attr.markerClusterer.addMarkers(markers)
        @attr.markerClusterer.fitMapToMarkers() if @attr.markerOptions.fitBounds

    @addMarkers = (data) ->
      previousMarkersIndex = @attr.markersIndex
      @clearAllMarkers()
      allMarkers = []

      for listing in data.listings
        m = previousMarkersIndex[listing.id] or @createMarker(listing)
        delete previousMarkersIndex[listing.id]

        allMarkers.push(m)
        @sendCustomMarkerTrigger(m)
        @attr.markers.push googleMarker: m, markerData: listing
        @attr.markersIndex[listing.id] = m

      @removeGoogleMarker(marker) for id, marker of previousMarkersIndex
      previousMarkersIndex = null

      @updateCluster(allMarkers)
      @updateListingsCount()
      @trigger 'uiSetMarkerInfoWindow'

    @clearAllMarkers = ->
      @attr.markerClusterer?.clearMarkers()
      @attr.markers = []
      @attr.markersIndex = {}

    @removeGoogleMarker = (gmarker) ->
      google.maps.event.clearListeners gmarker, "click"
      @attr.markerClusterer?.removeMarker(gmarker)
      gmarker.setMap(null)
      gmarker = null

    @createMarker = (datum) ->
      options = @markerOptions(datum)
      if options.labelContent
        new @attr.MarkerWithLabel(options)
      else
        new google.maps.Marker(options)

    @markerOptions = (datum) ->
      viewed = @storedMarkerExists(datum.id)
      options =
        position: new google.maps.LatLng(datum.lat, datum.lng)
        map: @attr.gMap
        icon: @iconBasedOnType(@attr.mapPin, datum, viewed)
        shadow: @iconBasedOnType(@attr.mapPinShadow, datum, viewed)
        title: @markerTitle(datum)
        datum: datum
        saveMarkerClick: @attr.saveMarkerClick

      if label = @attr.markerLabelOptions(datum, viewed)
        options.labelContent = label.content
        options.labelAnchor = new google.maps.Point(label.anchor.x, label.anchor.y) if label.anchor
        options.labelClass = label.cssClass
      options

    @sendCustomMarkerTrigger = (marker) ->
      _this = this
      google.maps.event.addListener marker, 'click', ->
        $(document).trigger 'markerClicked', gMarker: @, gMap: _this.attr.gMap, viewed: _this.storedMarkerExists(@.datum.id)

      google.maps.event.addListener marker, 'mouseover', (marker) ->
        $(document).trigger 'markerMousedOver', gMarker: @, gMap: _this.attr.gMap, viewed: _this.storedMarkerExists(@.datum.id)

      google.maps.event.addListener marker, 'mouseout', (marker) ->
        $(document).trigger 'markerMousedOut', gMarker: @, gMap: _this.attr.gMap, viewed: _this.storedMarkerExists(@.datum.id)

    @markerTitle = (datum) ->
      datum.name or ''

    @findMarker = (id) ->
      @attr.markersIndex?[id]

    @markerAnimation = (ev, data) ->
      if marker = @findMarker(data.id)
        marker.setAnimation(data.animation)

    @lookupAndDeliverMarker = (ev, data) ->
      marker = @findMarker(data.id)
      data.viewed = @storedMarkerExists(data.id)

      if marker?
        data.gMarker = marker
      else
        data.error = "id '#{data.id}' not found in marker list"

      $(document).trigger('dataMapMarker', data)

    # TODO: Move to it's own component. Maybe this is application's responsibility?
    @updateListingsCount = ->
      lCount = @attr.markers.length
      $(@attr.listingCountSelector).html(@attr.listingCountText + lCount)

    @iconBasedOnType = (icon, datum, viewed) ->
      if typeof(icon) is "function"
        icon(datum, viewed)
      else
        icon

    @after 'initialize', ->
      @attr.MarkerWithLabel = markerWithLabelFactory()

      @on document, 'mapRenderedFirst', @initAttr
      @on document, 'markersUpdateAttr', @initAttr
      @on document, 'markersDataAvailable', @render
      @on document, 'animatePin', @markerAnimation
      @on document, 'uiWantsMapMarker', @lookupAndDeliverMarker
      # TODO: put into it's own component.
      @on document, 'uiMapZoom', @updateListingsCount

  defineComponent(markersOverlay, clusters, mapUtils, storedMarkers)

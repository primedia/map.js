'use strict'

define [
  'jquery'
  'flight/lib/component'
  'underscore'
], (
  $
  defineComponent
  _
) ->

  infoWindowData = ->

    @defaultAttrs
      route: "/map/pin/"
      allowed_filters: ['min_price', 'max_price']
      refinements: {}

    @formatRefinements = (results) ->
      return "" if _.isEmpty(results.names)
      "refinements=#{results.names.join('-')}-#{results.ids.join('+')}"

    @formatFilters = (filters, names) ->
      return "" if _.isEmpty(filters)
      if _.isEmpty(names) then filters.join('&') else "&#{filters.join('&')}"

    @queryParams = ->
      return "" if _.isEmpty(@attr.refinements)
      results = {names: [], ids: [], filters: []}
      for own name, obj of @attr.refinements
        if _.contains(@attr.allowed_filters, name)
          results.filters.push "#{obj.dim_id}=#{obj.value}"
        else
          results.names.push obj.dim_name
          results.ids.push obj.dim_id
      "?#{@formatRefinements(results)}#{@formatFilters(results.filters, results.names)}"

    @getData = (ev, data) ->
      @xhr = $.ajax
        url: "#{@attr.route}#{data.listingId}#{@queryParams()}"
        success: (ajaxData) =>
          $(document).trigger "infoWindowDataAvailable", ajaxData
        complete: ->

    @after 'initialize', ->
      @on document, 'uiInfoWindowDataRequest', @getData

  return defineComponent(infoWindowData)

'use strict';
define(['jquery', 'underscore', 'flight/lib/component', 'map/components/mixins/map_utils', "map/components/mixins/distance_conversion"], function($, _, defineComponent, mapUtils, distanceConversion) {
  var listingsData;
  listingsData = function() {
    this.defaultAttrs({
      executeOnce: false,
      hybridSearchRoute: '/map_view/listings',
      mapPinsRoute: '/map/pins.json',
      hostname: 'www.apartmentguide.com',
      priceRangeRefinements: {},
      possibleRefinements: ['min_price', 'max_price'],
      sortByAttribute: 'distance',
      firstRender: false
    });
    this.mapConfig = function() {
      return {
        executeOnce: this.attr.executeOnce,
        hybridSearchRoute: this.attr.hybridSearchRoute,
        mapPinsRoute: this.attr.mapPinsRoute,
        hostname: this.attr.hostname,
        priceRangeRefinements: this.attr.priceRangeRefinements,
        possibleRefinements: this.attr.possibleRefinements,
        sortByAttribute: this.attr.sortByAttribute
      };
    };
    this.getListings = function(ev, queryData) {
      return this.xhr = $.ajax({
        url: this.attr.hybridSearchRoute + "?" + (this.decodedQueryData(queryData)),
        success: (function(_this) {
          return function(data) {
            return _this.trigger('listingDataAvailable', {
              htmlData: data,
              query: queryData
            });
          };
        })(this),
        complete: (function(_this) {
          return function() {
            return _this.hideSpinner();
          };
        })(this)
      });
    };
    this.decodedQueryData = function(data) {
      return decodeURIComponent($.param(this.queryData(data)));
    };
    this.getMarkers = function(ev, data) {
      data.sort = this.attr.sortByAttribute;
      return this.xhr = $.ajax({
        url: this.attr.mapPinsRoute + "?" + (this.decodedQueryData(data)),
        success: (function(_this) {
          return function(data) {
            _this.trigger('markersDataAvailable', data);
            return _this.trigger('markersDataAvailableOnce', _this.resetEvents());
          };
        })(this),
        complete: (function(_this) {
          return function() {
            return _this.hideSpinner();
          };
        })(this)
      });
    };
    this.resetEvents = function() {
      if (this.attr.executeOnce) {
        this.off(document, 'uiMarkersDataRequest');
        this.off(document, 'mapRendered');
        return this.off(document, 'uiMapZoomWithMarkers');
      }
    };
    this.after('initialize', function() {
      this.on(document, 'uiListingDataRequest', this.getListings);
      this.on(document, 'uiMarkersDataRequest', this.getMarkers);
      this.on(document, 'mapRendered', this.getListings);
      this.on(document, 'mapRendered', this.getMarkers);
      this.on(document, 'uiMapZoomWithMarkers', this.getListings);
      this.on(document, 'uiMapZoomWithMarkers', this.getMarkers);
      return this.on(document, 'uiMapZoomNoMarkers', this.getListings);
    });
    return this.queryData = function(data) {
      var i, len, mgtcoid, name, priceRange, propertyName, qData, ref, refinements;
      if (!this.attr.firstRender) {
        delete data['sort'];
        this.attr.firstRender = true;
      }
      qData = {
        lat: data.latitude,
        latitude: data.latitude,
        lng: data.longitude,
        longitude: data.longitude,
        miles: Math.round(this.convertMetersToMiles(data.radius)),
        lat1: data.lat1,
        lng1: data.lng1,
        lat2: data.lat2,
        lng2: data.lng2,
        city: data.city,
        state: data.state,
        zip: data.zip,
        neighborhood: data.hood,
        geoname: data.geoname,
        sort: data.sort
      };
      refinements = this.getRefinements();
      if (refinements) {
        qData.refinements = encodeURIComponent(refinements);
      }
      propertyName = this.getPropertyName();
      if (propertyName) {
        qData.propertyname = encodeURIComponent(propertyName);
      }
      mgtcoid = this.getMgtcoId();
      if (mgtcoid) {
        qData.mgtcoid = encodeURIComponent(mgtcoid);
      }
      priceRange = this.getPriceRange(this.attr.priceRangeRefinements);
      ref = this.attr.possibleRefinements;
      for (i = 0, len = ref.length; i < len; i++) {
        name = ref[i];
        if (priceRange[name]) {
          qData[name] = priceRange[name];
        }
      }
      return qData;
    };
  };
  return defineComponent(listingsData, distanceConversion, mapUtils);
});

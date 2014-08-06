// Generated by CoffeeScript 1.7.1
(function() {
  'use strict';
  define(['jquery', 'flight/lib/component', '../utils/map_utils', '../utils/distance_conversion'], function($, defineComponent, mapUtils, distanceConversion) {
    var listingsData;
    listingsData = function() {
      this.defaultAttrs({
        executeOnce: false,
        hybridView: true,
        hybridSearchRoute: "/map_view/listings",
        mapPinsRoute: "/map/pins.json",
        hostname: "www.apartmentguide.com"
      });
      this.getListings = function(ev, queryData) {
        if (!this.isListVisible() || !this.attr.hybridView) {
          return {};
        }
        return this.xhr = $.ajax({
          url: "" + this.attr.hybridSearchRoute + "?" + (this.decodedQueryData(queryData)),
          success: (function(_this) {
            return function(data) {
              return _this.trigger('listingDataAvailable', {
                htmlData: data,
                query: queryData
              });
            };
          })(this),
          complete: function() {
            return mapUtils.hideSpinner();
          }
        });
      };
      this.decodedQueryData = function(data) {
        return decodeURIComponent($.param(this.queryData(data)));
      };
      this.isListVisible = function() {
        return $('#hybrid_list').is(':visible');
      };
      this.getMarkers = function(ev, data) {
        data.sort = 'distance';
        return this.xhr = $.ajax({
          url: "" + this.attr.mapPinsRoute + "?" + (this.decodedQueryData(data)),
          success: (function(_this) {
            return function(data) {
              _this.trigger('markersDataAvailable', data);
              return _this.trigger('markersDataAvailableOnce', _this.resetEvents());
            };
          })(this),
          complete: function() {
            return mapUtils.hideSpinner();
          }
        });
      };
      this.drawerVisible = function() {
        return $('#hybrid_list').is(':visible');
      };
      this.extractRefinementsFromUrl = function() {
        return $(".pageInfo[name=refinements]").attr("content") || '';
      };
      this.extractParamFromUrl = function(key) {
        var param, queryParams, regex, value, _i, _len;
        queryParams = location.search.split('&') || [];
        regex = key + '=(.*)';
        for (_i = 0, _len = queryParams.length; _i < _len; _i++) {
          param = queryParams[_i];
          if (param.match(regex)) {
            value = param.match(regex);
          }
        }
        if (value) {
          return value[1] || '';
        } else {
          return '';
        }
      };
      this.renderListings = function(skipFitBounds) {
        var listingObjects, listings;
        if (listings = this._parseListingsFromHtml()) {
          zutron.getSavedListings();
          listingObjects = this._addListingstoMapUpdate(listings, skipFitBounds);
          this._addInfoWindowsToListings(listingObjects);
          return this.listing_count = this._listingsCount(listingObjects);
        }
      };
      this.parseListingsFromHtml = function() {
        var jListingData, listingData, listings;
        listingData = $('#listingData').attr('data-listingData');
        jListingData = $.parseJSON(listingData);
        return listings = jListingData != null ? jListingData.listings : {};
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
        var mgtcoid, propertyName, qData;
        qData = {
          lat: data.latitude,
          latitude: data.latitude,
          lng: data.longitude,
          longitude: data.longitude,
          miles: Math.round(distanceConversion.convertMetersToMiles(data.radius)),
          drawer_visible: this.drawerVisible,
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
        if (this.extractRefinementsFromUrl().length > 0) {
          qData.refinements = encodeURIComponent(this.extractRefinementsFromUrl());
        }
        propertyName = this.extractParamFromUrl('propertyname');
        if (propertyName.length > 0) {
          qData.propertyname = encodeURIComponent(propertyName);
        }
        mgtcoid = this.extractParamFromUrl('mgtcoid');
        if (mgtcoid.length > 0) {
          qData.mgtcoid = encodeURIComponent(mgtcoid);
        }
        return qData;
      };
    };
    return defineComponent(listingsData);
  });

}).call(this);

'use strict';
define(['jquery', 'underscore', 'flight/lib/component', 'map/components/mixins/map_utils', 'map/components/mixins/distance_conversion'], function($, _, defineComponent, mapUtils, distanceConversion) {
  var defaultMap;
  defaultMap = function() {
    this.defaultAttrs({
      latitude: 33.9411,
      longitude: -84.2136,
      gMap: {},
      gMapEvents: {
        'center_changed': false,
        'zoom_changed': false,
        'max_bounds_changed': false
      },
      maxBounds: void 0,
      infoWindowOpen: false,
      overlay: void 0,
      draggable: true,
      geoData: {},
      gMapOptions: {
        draggable: void 0
      },
      pinControlsSelector: '#pin_search_controls',
      pinControlsCloseIconSelector: 'a.icon_close'
    });
    this.data = {};
    this.after('initialize', function() {
      this.on(document, 'mapDataAvailable', this.initBaseMap);
      return this.on(document, 'uiInfoWindowDataRequest', (function(_this) {
        return function() {
          return _this.attr.infoWindowOpen = true;
        };
      })(this));
    });
    this.initBaseMap = function(ev, data) {
      this.data = data || {};
      return this.firstRender();
    };
    this.firstRender = function() {
      google.maps.visualRefresh = true;
      this.attr.gMap = new google.maps.Map(this.node, this.defineGoogleMapOptions());
      google.maps.event.addListenerOnce(this.attr.gMap, 'idle', (function(_this) {
        return function() {
          _this.attr.maxBounds = _this.currentBounds();
          _this.fireOurMapEventsOnce();
          return _this.attachEventListeners();
        };
      })(this));
      return this.addCustomMarker();
    };
    this.fireOurMapEventsOnce = function() {
      this.trigger(document, 'mapRenderedFirst', this.mapRenderedFirstData());
      this.trigger(document, 'mapRendered', this.mapRenderedFirstData());
      this.trigger(document, 'uiInitMarkerCluster', this.mapChangedData());
      return this.trigger(document, "uiNeighborhoodDataRequest", this.mapChangedDataBase());
    };
    this.attachEventListeners = function(duration) {
      if (duration == null) {
        duration = 250;
      }
      google.maps.event.addListener(this.attr.gMap, 'zoom_changed', _.debounce((function(_this) {
        return function() {
          _this.storeEvent('zoom_changed');
          _this.checkForMaxBoundsChange();
          return _this.fireOurMapEvents();
        };
      })(this), duration));
      return google.maps.event.addListener(this.attr.gMap, 'center_changed', _.debounce((function(_this) {
        return function() {
          _this.storeEvent('center_changed');
          _this.checkForMaxBoundsChange();
          return _this.fireOurMapEvents();
        };
      })(this), duration));
    };
    this.storeEvent = function(event) {
      return this.attr.gMapEvents[event] = true;
    };
    this.checkForMaxBoundsChange = function() {
      var newBounds, oldBounds;
      newBounds = this.currentBounds();
      oldBounds = this.attr.maxBounds;
      if (!(oldBounds.contains(newBounds.getNorthEast()) && oldBounds.contains(newBounds.getSouthWest()))) {
        this.attr.maxBounds = newBounds;
        return this.storeEvent('max_bounds_changed');
      }
    };
    this.fireOurMapEvents = function() {
      var eventsHash;
      eventsHash = this.attr.gMapEvents;
      if (this.attr.infoWindowOpen === true) {
        eventsHash['center_changed'] = false;
        eventsHash['max_bounds_changed'] = false;
      }
      if (eventsHash['max_bounds_changed']) {
        this.trigger(document, 'uiMapZoomForListings', this.mapChangedData());
        this.trigger(document, 'uiInitMarkerCluster', this.mapChangedData());
        this.trigger(document, 'mapRendered', this.mapChangedData());
        this.trigger(document, 'uiNeighborhoodDataRequest', this.mapChangedDataBase());
      } else if (eventsHash['zoom_changed']) {
        this.trigger(document, 'uiMapZoom', this.mapChangedData());
      } else if (eventsHash['center_changed']) {
        this.trigger(document, 'uiMapCenter', this.mapChangedData());
      }
      return this.resetOurEventHash();
    };
    this.resetOurEventHash = function() {
      this.attr.gMapEvents['center_changed'] = false;
      this.attr.gMapEvents['zoom_changed'] = false;
      this.attr.gMapEvents['max_bounds_changed'] = false;
      return this.attr.infoWindowOpen = false;
    };
    this.defineGoogleMapOptions = function() {
      var geo, k, options, ref, v;
      geo = this.getInitialGeo();
      options = {
        center: new google.maps.LatLng(geo.lat, geo.lng),
        zoom: this.radiusToZoom(this.geoDataRadiusMiles()),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scaleControl: true
      };
      ref = this.attr.gMapOptions;
      for (k in ref) {
        v = ref[k];
        options[k] = v;
      }
      return options;
    };
    this.radiusToZoom = function(radius) {
      if (radius == null) {
        radius = 10;
      }
      return Math.round(14 - Math.log(radius) / Math.LN2) + 1;
    };
    this.latitude = function() {
      return this.attr.latitude = this.mapCenter().lat();
    };
    this.longitude = function() {
      return this.attr.longitude = this.mapCenter().lng();
    };
    this.southWestLatitude = function() {
      return this.attr.gMap.getBounds().getSouthWest().lat();
    };
    this.southWestLongitude = function() {
      return this.attr.gMap.getBounds().getSouthWest().lng();
    };
    this.northEastLatitude = function() {
      return this.attr.gMap.getBounds().getNorthEast().lat();
    };
    this.northEastLongitude = function() {
      return this.attr.gMap.getBounds().getNorthEast().lng();
    };
    this.radius = function() {
      var gBounds, latitudinalDistance, longitudinalDistance, radiusInMeters, south, southWest, west;
      gBounds = this.attr.gMap.getBounds();
      southWest = gBounds.getSouthWest();
      west = new google.maps.LatLng(this.latitude(), southWest.lng());
      south = new google.maps.LatLng(southWest.lat(), this.longitude());
      longitudinalDistance = google.maps.geometry.spherical.computeDistanceBetween(west, this.mapCenter());
      latitudinalDistance = google.maps.geometry.spherical.computeDistanceBetween(south, this.mapCenter());
      return radiusInMeters = Math.max(longitudinalDistance, latitudinalDistance);
    };
    this.mapCenter = function() {
      var gLatLng;
      return gLatLng = this.attr.gMap.getCenter();
    };
    this.currentBounds = function() {
      return this.attr.gMap.getBounds();
    };
    this.addCustomMarker = function() {
      return this.customMarkerDialogClose();
    };
    this.customMarkerDialogClose = function() {
      return $(this.attr.pinControlsSelector + " " + this.attr.pinControlsCloseIconSelector).click((function(_this) {
        return function() {
          return $(_this.attr.pinControlsSelector).remove();
        };
      })(this));
    };
    this.mapRenderedFirstData = function() {
      var data;
      data = this.mapChangedData();
      data.zip = this.geoData().zip;
      data.city = this.geoData().city;
      data.state = this.geoData().state;
      data.hood = this.geoData().hood;
      return data;
    };
    this.mapChangedData = function() {
      var data;
      data = this.mapChangedDataBase();
      data.sort = 'distance';
      return data;
    };
    this.mapChangedDataBase = function() {
      return {
        gMap: this.attr.gMap,
        latitude: this.limitScaleOf(this.latitude()),
        longitude: this.limitScaleOf(this.longitude()),
        radius: this.radius(),
        lat1: this.limitScaleOf(this.southWestLatitude()),
        lng1: this.limitScaleOf(this.southWestLongitude()),
        lat2: this.limitScaleOf(this.northEastLatitude()),
        lng2: this.limitScaleOf(this.northEastLongitude()),
        zip: this.geoData().zip,
        city: this.geoData().city,
        state: this.geoData().state,
        hood: this.geoData().hood,
        hoodDisplayName: this.geoData().hood_display_name
      };
    };
    this.zoomCircle = function() {
      var circle, circleOptions, radius;
      radius = this.convertMilesToMeters(this.geoDataRadiusMiles());
      circleOptions = {
        center: this.mapCenter(),
        map: this.attr.gMap,
        radius: radius,
        fillOpacity: 0.0,
        strokeOpacity: 0.0
      };
      return circle = new google.maps.Circle(circleOptions);
    };
    this.geoDataRadiusMiles = function() {
      return this.geoData().rad || 10;
    };
    this.geoData = function() {
      return this.attr.geoData || {};
    };
    return this.getInitialGeo = function() {
      return {
        lat: this.data.lat || this.data.latitude || this.attr.latitude,
        lng: this.data.lng || this.data.longitude || this.attr.longitude
      };
    };
  };
  return defineComponent(defaultMap, mapUtils, distanceConversion);
});

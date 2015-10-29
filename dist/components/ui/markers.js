'use strict';
define(['jquery', 'flight/lib/component', 'map/components/mixins/clusters', 'map/components/mixins/map_utils', 'primedia_events'], function($, defineComponent, clusters, mapUtils, events) {
  var markersOverlay;
  markersOverlay = function() {
    this.defaultAttrs({
      searchGeoData: {},
      listingCountSelector: '#mapview_listing_count',
      listingCountText: 'Apartments Found: ',
      markers: [],
      markersIndex: {},
      gMap: void 0,
      markerClusterer: void 0,
      markerOptions: {
        fitBounds: false
      },
      shouldCluster: function(markers) {
        return true;
      }
    });
    this.prepend_origin = function(value) {
      return value = "" + (this.assetOriginFromMetaTag()) + value;
    };
    this.initAttr = function(ev, data) {
      if (data.gMap) {
        this.attr.gMap = data.gMap;
      }
      if (data.mapPin) {
        this.attr.mapPin = data.mapPin;
      }
      if (data.mapPinFree) {
        this.attr.mapPinFree = data.mapPinFree;
      }
      if (data.mapPinShadow) {
        return this.attr.mapPinShadow = data.mapPinShadow;
      }
    };
    this.render = function(ev, data) {
      return this.addMarkers(data);
    };
    this.updateCluster = function(markers) {
      if (this.attr.shouldCluster(markers)) {
        this.initClusterer(this.attr.gMap);
        this.attr.markerClusterer.addMarkers(markers);
        if (this.attr.markerOptions.fitBounds) {
          return this.attr.markerClusterer.fitMapToMarkers();
        }
      }
    };
    this.addMarkers = function(data) {
      var all_markers, listing, m, _i, _len, _ref, _ref1;
      if ((_ref = this.attr.markerClusterer) != null) {
        _ref.clearMarkers();
      }
      this.attr.markers = [];
      this.attr.markersIndex = {};
      all_markers = [];
      _ref1 = data.listings;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        listing = _ref1[_i];
        m = this.createMarker(listing);
        all_markers.push(m);
        this.sendCustomMarkerTrigger(m);
        this.attr.markers.push({
          googleMarker: m,
          markerData: listing
        });
        this.attr.markersIndex[listing.id] = this.attr.markers.length - 1;
      }
      this.updateCluster(all_markers);
      this.updateListingsCount();
      return this.trigger('uiSetMarkerInfoWindow');
    };
    this.createMarker = function(datum) {
      var shadowPin;
      shadowPin = this.shadowBaseOnType(datum);
      return new google.maps.Marker({
        position: new google.maps.LatLng(datum.lat, datum.lng),
        map: this.attr.gMap,
        icon: this.iconBasedOnType(datum),
        shadow: shadowPin,
        title: this.markerTitle(datum),
        datumId: datum.id
      });
    };
    this.sendCustomMarkerTrigger = function(marker) {
      var _this;
      _this = this;
      return google.maps.event.addListener(marker, 'click', function() {
        return $(document).trigger('markerClicked', {
          gMarker: this,
          gMap: _this.attr.gMap
        });
      });
    };
    this.markerTitle = function(datum) {
      return datum.name || '';
    };
    this.markerAnimation = function(ev, data) {
      var markerIndex, markerObject;
      if (!this.attr.markersIndex) {
        return;
      }
      markerIndex = this.attr.markersIndex[data.id.slice(7)];
      if (this.attr.markers[markerIndex]) {
        markerObject = this.attr.markers[markerIndex].googleMarker;
      }
      if (markerObject != null) {
        return markerObject.setAnimation(data.animation);
      }
    };
    this.updateListingsCount = function() {
      var lCount;
      lCount = this.attr.markers.length;
      return $(this.attr.listingCountSelector).html(this.attr.listingCountText + lCount);
    };
    this.iconBasedOnType = function(datum) {
      if (datum.free) {
        return this.attr.mapPinFree;
      } else {
        return this.attr.mapPin;
      }
    };
    this.shadowBaseOnType = function(datum) {
      if (datum.free) {
        return "";
      } else {
        return this.attr.mapPinShadow;
      }
    };
    return this.after('initialize', function() {
      this.on(document, 'mapRenderedFirst', this.initAttr);
      this.on(document, 'markersUpdateAttr', this.initAttr);
      this.on(document, 'markersDataAvailable', this.render);
      this.on(document, 'animatePin', this.markerAnimation);
      return this.on(document, 'uiMapZoom', this.updateListingsCount);
    });
  };
  return defineComponent(markersOverlay, clusters, mapUtils);
});

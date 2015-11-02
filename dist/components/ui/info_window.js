'use strict';
define(['jquery', 'flight/lib/component'], function($, defineComponent) {
  var infoWindow;
  infoWindow = function() {
    ({
      currentOpenWindow: null,
      eventsWired: false
    });
    this.defaultAttrs({
      gMap: {},
      gMarker: {}
    });
    this.showInfoWindowOnMarkerClick = function(ev, data) {
      this.attr.gMarker = data.gMarker;
      this.attr.gMap = data.gMap;
      return this.trigger(document, 'uiInfoWindowDataRequest', {
        listingId: this.attr.gMarker.datum.id
      });
    };
    this.render = function(ev, data) {
      this.closeOpenInfoWindow();
      this.openInfoWindow(data);
      return this.wireUpEvents();
    };
    this.closeOpenInfoWindow = function() {
      if (this.currentOpenWindow) {
        return this.currentOpenWindow.close();
      }
    };
    this.openInfoWindow = function(data) {
      if (this.currentOpenWindow == null) {
        this.currentOpenWindow = new google.maps.InfoWindow();
      }
      this.currentOpenWindow.setContent(data);
      return this.currentOpenWindow.open(this.attr.gMap, this.attr.gMarker);
    };
    this.wireUpEvents = function() {
      if (this.currentOpenWindow) {
        google.maps.event.addListenerOnce(this.currentOpenWindow, 'closeclick', function() {
          return $(document).trigger('uiInfoWindowClosed');
        });
        return google.maps.event.addListenerOnce(this.currentOpenWindow, 'domready', (function(_this) {
          return function() {
            return $(document).trigger('uiInfoWindowRendered', {
              listingId: _this.attr.gMarker.datumId,
              marker: _this.attr.gMarker,
              infoWindow: _this.currentOpenWindow
            });
          };
        })(this));
      }
    };
    return this.after('initialize', function() {
      this.on(document, 'markerClicked', this.showInfoWindowOnMarkerClick);
      this.on(document, 'infoWindowDataAvailable', this.render);
      return this.on(document, 'uiCloseOpenInfoWindows', this.closeOpenInfoWindow);
    });
  };
  return infoWindow;
});

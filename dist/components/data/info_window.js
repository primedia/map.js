'use strict';
define(['jquery', 'flight/lib/component', 'map/components/mixins/map_utils'], function($, defineComponent, mapUtils) {
  var infoWindowData;
  infoWindowData = function() {
    this.defaultAttrs({
      pinRoute: "/map/pin/",
      pinRefinements: ''
    });
    this.getData = function(ev, data) {
      return this.xhr = $.ajax({
        url: "" + this.attr.pinRoute + data.listingId + "?" + this.attr.pinRefinements,
        success: (function(_this) {
          return function(ajaxData) {
            return $(document).trigger("infoWindowDataAvailable", ajaxData);
          };
        })(this),
        complete: function() {}
      });
    };
    return this.after('initialize', function() {
      return this.on(document, 'uiInfoWindowDataRequest', this.getData);
    });
  };
  return defineComponent(infoWindowData, mapUtils);
});

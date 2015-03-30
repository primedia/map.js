define(['jquery', 'es5-shim', 'es5-sham', 'flight/lib/utils', 'map/components/ui/base_map', 'map/components/ui/markers_info_window'], function($, es5Shim, es5Sham, FlightUtils, BaseMap, MarkerInfoWindow) {
  var initialize;
  initialize = function() {
    var args;
    args = arguments[0];
    BaseMap.attachTo(args.map.canvas, args.map);
    return MarkerInfoWindow.attachTo(args.map.canvas, args.markers);
  };
  return initialize;
});
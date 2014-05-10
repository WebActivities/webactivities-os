var MapsActivity = function(ctx) {
	
	var container = $(
			"<div>" +
			"<style type='text/css'> html { height: 100% }body { height: 100%; margin: 0; padding: 0 }#map-canvas { height: 100% }</style>"+
			"<div id='map-canvas'/>"+
			"</div>");

	ctx.prepareView().then(function(root) {
		$(root).append(container);
		
		initialize();
	});
	
	
    function initialize() {
        var mapOptions = {
          center: new google.maps.LatLng(-34.397, 150.644),
          zoom: 8
        };
        var map = new google.maps.Map(container.find("#map-canvas")[0],mapOptions);
     }
      

	
};
angular.module('webActivitiesApp.shared', [])

// Config
.config([ '$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
	$('<div id="shared-spinner"><img alt="" src="img/loader.gif" /></div>').appendTo($('body')).hide();
	$httpProvider.interceptors.push(function($q) {
		var numLoadings = 0;
		return {
			'request' : function(config) {
				numLoadings++;
				$('#shared-spinner').show();
				return config || $q.when(config);
			},
			'response' : function(response) {
				if ((--numLoadings) === 0) {
					$('#shared-spinner').hide();
				}
				return response || $q.when(response);
			},
			'responseError' : function(response) {
				if (!(--numLoadings)) {
					$('#shared-spinner').hide();
				}
				return $q.reject(response);
			}
		};
	});

} ]);
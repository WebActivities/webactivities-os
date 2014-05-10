'use strict';

// Declare app level module which depends on filters, and services
angular.module('webActivitiesApp.config', [])
// Version
.value('version', '0.1')

// Application
.value('Application', {
	"title" : "WebActivities"
})

.constant('TRANSITION_SPEED', 500)

// Running application
.run([ '$rootScope', '$location', '$http', 'Application', function($rootScope, $location, $http, Application) {
	$rootScope.application = Application;
	$rootScope.page = {
		setTitle : function(title) {
			this.title = title;
		}
	};
	$rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
		if (current.$$route !== undefined) {
			$rootScope.page.setTitle(current.$$route.title || Application.title);
		}
	});
} ]);
;

'use strict';

/* Controllers */

angular.module('webActivitiesApp.controllers', [])

.controller('HomeCtrl', [ '$rootScope', '$scope', 'framework', function($rootScope, $scope, framework) {

	// Utilities
	// =============================================
	$(window).resize(function() {
		var gap = 0;
		$(".top-bar").each(function() {
			gap += $(this).height();
		});
		$(".full-size").height($(window).height() - gap - 10);
	});

	// Declaration of scope variables
	$scope.apps = [];
	$scope.displayActivity = false;

	// Functions
	$scope.startApp = function(appId) {
		framework.startApp(appId);
	};

	framework.installApp("apps/app1/app.json");
	framework.installApp("apps/app2/app.json");

	$rootScope.$on('appInstalled', function(event, app) {
		$scope.apps.push(app);
		$scope.$apply();
	});

	$rootScope.$on('displayActivity', function(event, o) {
		console.log(o.view);
		$("#viewport").empty().append(o.view);
		$(window).resize();
		$scope.displayActivity = true;
		$scope.activity = o.activity;
		$scope.$apply();
	});

} ])

// end
;


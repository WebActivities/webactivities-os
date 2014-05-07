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
	$scope.startingApp = null;

	// Functions
	$scope.activityStack = function() {
		return framework.getActivityStack();
	};

	$scope.startApp = function(appId) {
		framework.startApp(appId);
	};

	$scope.stopActivity = function() {
		framework.stopActivity();
	};

	// Listener
	$rootScope.$on('appInstalled', function(event, app) {
		$scope.apps.push(app);
		$scope.$apply();
	});

	$rootScope.$on('appStarting', function(event, app) {
		$scope.startingApp = app.name;
	});

	$rootScope.$on('appStarted', function(event, app) {
		$scope.startingApp = null;
	});

	$rootScope.$on('displayActivity', function(event, o) {
		$("#viewport").empty().append(o.view);
		$(window).resize();
		$scope.displayActivity = true;
		$scope.activity = o.activity;
	});

	$rootScope.$on('hideActivity', function(event, o) {
		$(o.iframe).remove();
		$(window).resize();
		$scope.displayActivity = false;
		$scope.activity = null;
	});

	// Demo configuration
	framework.installApp("apps/app1/app.json");
	framework.installApp("apps/app2/app.json");

} ])

// end
;


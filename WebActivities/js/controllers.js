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
		$("#viewport").height($(window).height() - gap - 4);
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
		$(window).resize();
		var iframeWindow = $("#viewport")[0].contentWindow;
		var doc = iframeWindow.document;
		doc.open();
		doc.write("<script type=\"text/javascript\">window.parent = null;</script>");
		doc.write("<script type=\"text/javascript\">window.top = null;</script>");
		doc.write("<div id=\"internalViewport\"></div>");
		doc.close();

		var viewport = $("#viewport").contents().find("#internalViewport")[0];
		o.view.resolve(viewport);
		$scope.displayActivity = true;
		$scope.activity = o.activity;
		$scope.$apply();
	});

} ])

// end
;


'use strict';

/* Controllers */

angular.module('webActivitiesApp.controllers', [])

.controller('HomeCtrl', [ '$rootScope', '$scope', 'framework', '$modal', 'TRANSITION_SPEED', function($rootScope, $scope, framework, $modal, TRANSITION_SPEED) {

	// Utilities
	// =============================================

	// Declaration of scope variables
	$scope.apps = [];
	$scope.displayActivity = false;
	$scope.startingApp = null;

	// Functions
	$scope.activityStack = function() {
		if (framework.getActivityStack() == null) {
			return [];
		}
		var clone = framework.getActivityStack().slice(0);
		return clone.reverse();
	};

	$scope.startApp = function(appId) {
		framework.startApp(appId);
	};

	$scope.stopActivity = function() {
		framework.stopActivity();
	};

	$scope.stopAllActivities = function() {
		framework.stopAllActivities();
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
		if ($("#viewport").find(o.view).size() > 0) {
			$(o.view).css({left:'-100%'});
			$(o.view).show();
		} else {
			$(o.view).css({left:'100%'});
			$("#viewport").append(o.view);
		}
		$(o.view).animate({left: "0%"}, {
			duration: TRANSITION_SPEED
		});
		$scope.displayActivity = true;
		$scope.activity = o.activity;
	});

	$rootScope.$on('hideActivity', function(event, o) {
		$(o.view).animate({left: "-100%"}, {
			duration: TRANSITION_SPEED,
			complete: function() {
				$(o.view).hide();
				if (framework.getCurrentActivity()==null) {
					$scope.displayActivity = false;
					$scope.activity = null;
				}
				$scope.$apply();
			}
		});
		
	});

	$rootScope.$on('destroyActivity', function(event, o) {
		$(o.view).animate({left: "100%"}, {
			duration: TRANSITION_SPEED,
			complete: function() {
				$(o.view).remove();
				if (framework.getCurrentActivity()==null) {
					$scope.displayActivity = false;
					$scope.activity = null;
				}
				$scope.$apply();
			}
		});
		
	});

	$rootScope.$on('multipleActivityToStart', function(event, o) {
		var startMode = o.startMode;
		var parameters = o.parameters;
		var closeDefer = o.closeDefer;

		var modalInstance = $modal.open({
			templateUrl : 'activity-choice.html?' + new Date().getTime(),
			controller : [ '$scope', '$modalInstance', 'o', function($scope, $modalInstance, o) {
				$scope.items = o.activities;
				$scope.selected = $scope.items[0];
				$scope.select = function(app) {
					$scope.selected = app;
				};
				$scope.ok = function() {
					$modalInstance.close($scope.selected);
				};
				$scope.cancel = function() {
					$modalInstance.dismiss('cancel');
				};
			} ],
			resolve : {
				o : function() {
					return o;
				}
			}
		});

		modalInstance.result.then(function(act) {
			framework.startActivity(act.id, act.app, parameters, startMode, closeDefer);
		});

	});

	// Demo configuration
	framework.installApp("apps/app1/app.json");
	framework.installApp("apps/app2/app.json");

} ])

// end
;


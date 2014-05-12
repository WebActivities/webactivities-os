'use strict';

/* Controllers */

angular.module('webActivitiesApp.controllers', [])

.controller('HomeCtrl', [ '$rootScope', '$scope', 'framework', '$modal', 'TRANSITION_SPEED', '$q', function($rootScope, $scope, framework, $modal, TRANSITION_SPEED, $q) {

	// Utilities
	// =============================================

	// Declaration of scope variables
	$scope.apps = [];
	$scope.notifies = [];
	$scope.displayActivity = false;
	$scope.startingApp = null;
	$scope.maxBreadcrumbSize = 5;

	// Functions
	$scope.activityStack = function() {
		if (framework.getActivityStack() == null) {
			return [];
		}
		var clone = framework.getActivityStack().slice(0);
		return clone.reverse();
	};

	$scope.notifies = function() {
		return framework.listNotifies();
	};
	
	$scope.removeNotify = function(index) {
		framework.removeNotify(index);
	};
	
	$scope.removeAllNotifies = function() {
		var notifies = $scope.notifies().length;
		for (var i = 0; i < notifies; i++) {
			framework.removeNotify(0);
		}
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
	framework.on('appInstalled', function(event, app) {
		$scope.apps.push(app);
	});

	framework.on('appStarting', function(event, app) {
		$scope.startingApp = app.name;
	});

	framework.on('appStarted', function(event, app) {
		$scope.startingApp = null;
	});

	framework.on('showNotify', function(event, notify) {
		var q = $q.defer();
		var type = notify.type;
		var message = notify.message;
		toastr.options.positionClass = "toast-bottom-right";
		if (notify.options) {
			toastr.options = notify.options;
		}
		toastr.options.onHidden = function() {
			q.resolve();
		};
		if (type == 'error') {
			toastr.error(message);
		} else if (type == 'warning') {
			toastr.warning(message);
		} else if (type == 'success') {
			toastr.success(message);
		} else {
			toastr.info(message);
		}
		$scope.$apply();
		return q.promise;
	});

	framework.on('displayActivity', function(event, o) {
		var q = $q.defer();
		if ($("#viewport").find(o.view).size() > 0) {
			$(o.view).css({
				left : '-100%'
			});
			$(o.view).show();
		} else {
			$(o.view).css({
				left : '100%'
			});
			$("#viewport").append(o.view);
			$(o.view).trigger("attached");
		}
		$(o.view).animate({
			left : "0%"
		}, {
			duration : TRANSITION_SPEED,
			complete : function() {
				q.resolve();
			}
		});
		$scope.displayActivity = true;
		$scope.activity = o.activity;
		return q.promise;
	});

	framework.on('hideActivity', function(event, o) {
		var q = $q.defer();
		$(o.view).animate({
			left : "-100%"
		}, {
			duration : TRANSITION_SPEED,
			complete : function() {
				$(o.view).hide();
				if (framework.getCurrentActivity() == null) {
					$scope.displayActivity = false;
					$scope.activity = null;
				}
				$scope.$apply();
				q.resolve();
			}
		});
		return q.promise;
	});

	framework.on('destroyActivity', function(event, o) {
		var q = $q.defer();
		$(o.view).animate({
			left : "100%"
		}, {
			duration : TRANSITION_SPEED,
			complete : function() {
				$(o.view).remove();
				if (framework.getCurrentActivity() == null) {
					$scope.displayActivity = false;
					$scope.activity = null;
				}
				$scope.$apply();
				q.resolve();
			}
		});
		return q.promise;
	});
	
	framework.on('makeUserSelectOneActivity', function(event, o) {
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
		return modalInstance.result;
	});

	// Demo configuration
	framework.installApp("apps/app1/app.json");
	framework.installApp("apps/app2/app.json");
	framework.installApp("apps/maps/app.json");

} ])

// end
;


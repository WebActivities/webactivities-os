'use strict';

/* Controllers */

angular.module('webActivitiesApp.controllers', [])

.controller('HomeCtrl', [ '$rootScope', '$scope', 'framework', '$modal', 'TRANSITION_SPEED', '$q', function($rootScope, $scope, framework, $modal, TRANSITION_SPEED, $q) {

	var Stack = function() {
		this.top = null;
		this.count = 0;

		this.getCount = function() {
			return this.count;
		};

		this.getTop = function() {
			return this.top;
		};

		this.push = function(data) {
			var node = {
				data : data,
				next : null
			};

			node.next = this.top;
			this.top = node;

			this.count++;
		};

		this.peek = function() {
			if (this.top === null) {
				return null;
			} else {
				return this.top.data;
			}
		};

		this.pop = function() {
			if (this.top === null) {
				return null;
			} else {
				var out = this.top;
				this.top = this.top.next;
				if (this.count > 0) {
					this.count--;
				}

				return out.data;
			}
		};

		this.getAll = function() {
			if (this.top === null) {
				return null;
			} else {
				var arr = new Array();

				var current = this.top;
				// console.log(current);
				for (var i = 0; i < this.count; i++) {
					arr[i] = current.data;
					current = current.next;
				}

				return arr;
			}
		};
	};

	// Utilities
	// =============================================
	var viewports = new Stack();
	viewports.push($("#viewport"));

	// Declaration of scope variables
	$scope.apps = [];
	$scope.notifies = [];
	$scope.displayActivity = false;
	$scope.startingApp = null;
	$scope.maxBreadcrumbSize = 3;

	// Functions
	$scope.activityStack = function() {
		if (framework.getActivityStack() == null) {
			return [];
		}
		var clone = framework.getActivityStack().slice(0);
		return clone.reverse();
	};

	$scope.isLayerStacked = function() {
		return viewports.getCount() > 1;
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

	$scope.stopAllPopupActivities = function() {
		framework.stopAllPopupActivities();
	};

	$scope.showSettings = function() {
		var elements = $(document).add($("iframe").contents());

		var hideFunction = undefined;
		hideFunction = function(e) {
			if ($(e.target).closest("#settings-panel").size() == 0) {
				$("#settings-panel").addClass("hidden-panel", TRANSITION_SPEED);
				elements.unbind("click", hideFunction);
			}
		};

		$("#settings-panel").removeClass("hidden-panel", TRANSITION_SPEED, function() {
			elements.bind("click", hideFunction);
		});

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
		if (viewports.peek().find(o.view).size() > 0) {
			if (!o.disableEffects) {
				$(o.view).css({
					left : '-100%'
				});
			}
			$(o.view).show();
		} else {
			if (!o.disableEffects) {
				$(o.view).css({
					left : '100%'
				});
			}
			viewports.peek().append(o.view);
			$(o.view).trigger("attached");
		}
		if (!o.disableEffects) {
			$(o.view).animate({
				left : "0%"
			}, {
				duration : TRANSITION_SPEED,
				complete : function() {
					q.resolve();
				}
			});
		} else {
			q.resolve();
		}
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

	framework.on('popLayer', function(event, o) {
		var q = $q.defer();
		var element = viewports.pop();
		$(element).animate({
			opacity : 0
		}, {
			duration : TRANSITION_SPEED,
			complete : function() {
				element.data("shadow").remove();
				element.remove();
				q.resolve();
			}
		});
		return q.promise;
	});

	framework.on('pushLayer', function(event, o) {
		var q = $q.defer();
		var element = $("<div></div>").addClass("viewport popup").css("opacity", "0");
		if (o.size) {
			element.addClass(o.size);
		}
		var shadow = $("<div></div>").addClass("viewport-shadow");
		element.data("shadow", shadow);
		viewports.push(element);
		shadow.appendTo($("#layers-viewport"));
		element.appendTo($("#layers-viewport"));
		$(element).animate({
			opacity : 1
		}, {
			duration : TRANSITION_SPEED,
			complete : function() {
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


'use strict';

/* Controllers */

angular.module('webActivitiesApp.controllers', [])


.controller('HomeCtrl', [ '$rootScope', '$scope', 'framework', '$modal', 'TRANSITION_SPEED', '$q', function($rootScope, $scope, framework, $modal, TRANSITION_SPEED, $q) {

	// Utilities
	// =============================================
	var viewports = new Stack();
	viewports.push($("#viewport"));

	// Declaration of scope variables
	$scope.apps = [];
	$scope.activityDefs = [];
	
	$scope.notifies = [];
	$scope.displayActivity = false;
	$scope.startingApp = null;
	$scope.maxBreadcrumbSize = 3;
	
	$scope.settingsPanels = [{
		icon: 'fa-search',
		label: 'Cerca',
		templateUrl : 'partials/searchPanel.html',
		controller: 'SearchCtrl'
	},{
		icon: 'fa-picture-o',
		label: 'Temi e aspetto'
	},{
		icon: 'fa-cog',
		label: 'Impostazioni'
	}];

	// Functions
	$scope.activityStack = function() {
		if (framework.getActivityStack() == null) {
			return [];
		}
		var clone = framework.getActivityStack().slice(0);
		return clone.reverse();
	};

	$scope.currentActivity = function() {
		return framework.getCurrentActivity();
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
			$("#searchActivityInput").focus();
		});

	};

	// Listener
	framework.on('appInstalled', function(event, app) {
		$scope.apps.push(app);
		$.each(app.activities,function(k,v) {
			v.id=app.id+'.'+k;
			v.code=k;
			v.appName=app.name;
			$scope.activityDefs.push(v);
		});
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
		$(element.data("arrow")).remove();
		$(window).unbind("resize", element.data("resize-event"));
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
		var windowRelativeOffset = 5;

		var q = $q.defer();
		var element = $("<div></div>").addClass("viewport popup").css("opacity", "0");
		var shadow = $("<div></div>").addClass("viewport-shadow");
		element.data("shadow", shadow);

		if (o.size && !o.relativeTo) {
			element.addClass(o.size);
		}
		var currentViewport = viewports.peek();
		viewports.push(element);
		
		shadow.appendTo($("#layers-viewport"));
		element.appendTo($("#layers-viewport"));
		
		if (o.relativeTo) {

			var arrow = $("<div></div>").appendTo($("#layers-viewport"));

			var calculatePosition = function() {
				var position = $(o.relativeTo).position();
				var offsetTop = $(currentViewport).find("iframe").contents().scrollTop();
				var offsetLeft = $(currentViewport).find("iframe").contents().scrollLeft();
				var windowWidth = $(window).width();
				var windowHeight = $(window).height() - $(".nav").height();
				var top = position.top - offsetTop;
				var left = position.left - offsetLeft;
				var width = $(o.relativeTo).outerWidth();
				var height = $(o.relativeTo).outerHeight();

				var sizes = [];

				// Quadrante a sinistra
				sizes.push({
					top : windowRelativeOffset,
					left : windowRelativeOffset,
					width : left - windowRelativeOffset * 2,
					height : windowHeight - windowRelativeOffset * 2,
					arrow : "arrow-right",
					arrowtop : top + height / 2 - 10,
					arrowleft : left - windowRelativeOffset - 1
				});

				// Quadrante in alto
				sizes.push({
					top : windowRelativeOffset,
					left : windowRelativeOffset,
					width : windowWidth - windowRelativeOffset * 2,
					height : top - windowRelativeOffset * 2,
					arrow : "arrow-bottom",
					arrowtop : top - windowRelativeOffset - 1,
					arrowleft : left + width / 2 - 10
				});

				// Quadrante a destra
				sizes.push({
					top : windowRelativeOffset,
					left : windowRelativeOffset + left + width,
					width : windowWidth - windowRelativeOffset * 2 - left - width,
					height : windowHeight - windowRelativeOffset * 2,
					arrow : "arrow-left",
					arrowtop : top + height / 2 - 10,
					arrowleft : left + width - 20 + 1 + windowRelativeOffset
				});

				// Quadrante in basso
				sizes.push({
					top : windowRelativeOffset + top + height,
					left : windowRelativeOffset,
					width : windowWidth - windowRelativeOffset * 2,
					height : windowHeight - windowRelativeOffset * 2 - top - height,
					arrow : "arrow-top",
					arrowtop : top + height + windowRelativeOffset - 20 + 1,
					arrowleft : left + width / 2 - 10
				});

				var bestArea = 0;
				var bestAreaSize = null;
				for ( var i in sizes) {
					var s = sizes[i];
					var area = s.width * s.height;
					if (area > bestArea) {
						bestArea = area;
						bestAreaSize = s;
					}
				}

				element.css({
					top : bestAreaSize.top,
					left : bestAreaSize.left,
					width : bestAreaSize.width,
					height : bestAreaSize.height,
					bottom : null,
					right : null
				});

				arrow.removeClass().addClass(bestAreaSize.arrow).css({
					position : "absolute",
					top : bestAreaSize.arrowtop,
					left : bestAreaSize.arrowleft
				});
			};
			
			$(window).bind("resize", calculatePosition);
			element.data("arrow", arrow);
			element.data("resize-event", calculatePosition);
			
			calculatePosition();
		}

		
		
		
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

.controller('SearchCtrl', ['$scope', function($scope) {
	
	$scope.searchInput='';
	
	$scope.activityDefs = $scope.$parent.activityDefs;
	
	$scope.startActivity = function($event,activityDef,mode) {
		$event.stopPropagation();
		var i = new Intent(IntentType.START_ACTIVITY,framework);
		i.app = activityDef.app;
		i.activity = activityDef.code;
		i.parameters = {};
		i.startMode = mode || 'ROOT';
		return i.start();
	};
	
}])

// end
;


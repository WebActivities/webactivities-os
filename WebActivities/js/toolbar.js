'use strict';


angular.module('webActivitiesApp.toolbar', [])

.controller('ToolbarCtrl', [ '$rootScope', '$scope', 'framework', '$q', function($rootScope, $scope, framework, $q ) {
	
	$scope.liveActivity = null;
	
	var updateActions = function() {
		setTimeout(function() {
			if ($scope.liveActivity && $scope.liveActivity.context.actions) {			
				$scope.activityActions = $scope.liveActivity.context.actions;
			} else {
				$scope.activityActions = [];
			}
			$scope.$apply();
		},0);
	};
	
	var tracker = new LiveActivityTracker(framework.eventBus,
		function(oldActivity) {
			$scope.liveActivity = null;
			updateActions();
		},
		function(newActivity) {
			$scope.liveActivity = newActivity;
			$scope.liveActivity.context.eventBus.on("actionsChanged",updateActions);
		}
	);

	$scope.activityStack = function() {
		if (framework.getActivityStack() == null) {
			return [];
		}
		var clone = framework.getActivityStack().slice(0);
		return clone.reverse();
	};
	
	$scope.toolbarActions = [];
	$scope.activityActions = [];
	$scope.maxBreadcrumbSize = 3;
	
	framework.internalBus().syncTopic("com.newt.system.toolbar.actions",$scope.toolbarActions,function() {
		$scope.toolbarActions.sort(function(a, b){
			var aOrder = a.order || 10,
				bOrder = b.order || 10;
			return aOrder-bOrder;
		});
		$scope.$apply();
	});
	
	$scope.executeAction = function(action) {
		if (action.handler) {
			action.handler(action);
		}
	};
	
}])

//END
;


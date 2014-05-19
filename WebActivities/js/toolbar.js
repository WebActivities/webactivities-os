'use strict';


angular.module('webActivitiesApp.toolbar', [])

.controller('ToolbarCtrl', [ '$rootScope', '$scope', 'framework', '$q', function($rootScope, $scope, framework, $q ) {
	
	$scope.liveActivity = null;
	
	var tracker = new LiveActivityTracker(framework.uiCommunicator,
		function(oldActivity) {
			$scope.liveActivity = null;
		},
		function(newActivity) {
			$scope.liveActivity = newActivity;
		}
	);
	
	$scope.$watch(function () { 
		var la = $scope.liveActivity;
		return la?la.context.actions:null; 
	}, function (newVal, oldVal) {
		if (newVal) {			
			$scope.activityActions = newVal;
		} else {
			$scope.activityActions = [];
		}
	});
	
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
	
}])

//END
;


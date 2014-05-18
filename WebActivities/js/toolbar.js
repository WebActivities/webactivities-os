'use strict';


angular.module('webActivitiesApp.toolbar', [])

.service('ToolbarService', ['$rootScope','framework', '$q', function($rootScope, framework, $q) {
	
	var toolbarActionsPubs = [];
	
	framework.uiCommunicator.on('displayActivity', function(event, o) {
		showActivityActions(o.activity);
	});
	
	framework.uiCommunicator.on('hideActivity', function(event, o) {
		hideActivityActions(o.activity);
	});
	
	var showActivityActions = function(activity) {
		var activityId = activity.instanceId;
		$.each(toolbarActionsPubs,function(i,o) {
			if (o.publisherId && o.publisherId===activityId) {
				o.obj.hide=false;
			}
		});
	};
	
	var hideActivityActions = function(activity) {
		var activityId = activity.instanceId;
		$.each(toolbarActionsPubs,function(i,o) {
			if (o.publisherId && o.publisherId===activityId) {
				o.obj.hide=true;
			}
		});
	};
	
	framework.internalBus().syncTopic("com.newt.system.toolbar.actions",toolbarActionsPubs,function() {
		$rootScope.$apply();
	},true);
	
	return {
		toolbarActions : toolbarActionsPubs
	};
	
}])

.controller('ToolbarCtrl', [ '$rootScope', '$scope', 'framework', '$q', 'ToolbarService', function($rootScope, $scope, framework, $q, ToolbarService) {
	
	// Functions
	$scope.activityStack = function() {
		if (framework.getActivityStack() == null) {
			return [];
		}
		var clone = framework.getActivityStack().slice(0);
		return clone.reverse();
	};
	
	$scope.toolbarActions = ToolbarService.toolbarActions;
	$scope.maxBreadcrumbSize = 3;
	
}])

//END
;


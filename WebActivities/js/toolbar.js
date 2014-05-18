'use strict';


angular.module('webActivitiesApp.toolbar', [])

.service('ToolbarService', ['$rootScope','framework', '$q', function($rootScope, framework, $q) {
	
	
	var toolbarActions = [];
	
	
	framework.uiCommunicator.on('displayActivity', function(event, o) {
		showActivityActions(o.activity);
	});
	
	framework.uiCommunicator.on('hideActivity', function(event, o) {
		hideActivityActions(o.activity);
	});
	
	framework.uiCommunicator.on('destroyActivity', function(event, o) {
		
	});
	
	var showActivityActions = function(activity) {
		$.each(toolbarActions,function(i,o) {
			if (o.activityId && o.activityId==activity.instanceId) {
				o.hide=false;
			}
		});
	};
	
	var hideActivityActions = function(activity) {
		$.each(toolbarActions,function(i,o) {
			if (o.activityId && o.activityId==activity.instanceId) {
				o.hide=true;
			}
		});
	};

	var bus = framework.bus.createBus();
	
	//utility method to sync an array spostare su Bus
	var syncTopic = function(topicName,arrayTosync,onChange) {
		bus.subscribeTopic(topicName, function(added,removed) {
			$.each(added,function(i,a) {
				arrayTosync.push(a);
			});
			$.each(removed,function(i,a) {
				var index = toolbarActions.indexOf(a);
				if (index!=-1) {
					arrayTosync.splice(index,1);
				}
			});
			onChange();
		});
	};
	
	syncTopic("com.newt.system.toolbar.actions",toolbarActions,function() {
		$rootScope.$apply();
	});
	
	return {
		toolbarActions : toolbarActions
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
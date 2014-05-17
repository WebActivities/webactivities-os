
var ToolbarService = function(ctx) {
	
	ctx.onStart(function() {
		
		ctx.bus.subscribeTopic("com.newt.system.toolbar.actions", function(added, removed) {
			$.each(added,function(i,a) {
				ctx.broadcast("addedToolbarAction",a);
			});
			$.each(removed,function(i,a) {
				ctx.broadcast("removedToolbarAction",a);
			});
		});
		
	});
	
};

var SearchService = function(ctx) {
	
	var searchView = null;
	
	var getSearchView = function() {
		if (searchView==null) {
			searchView = createView();
		}
		return searchView;
	};
	
	var onStart = function() {
		
		ctx.bus.publish("com.newt.system.toolbar.actions", {
			action: "search",
			iconClass: "fa-search",
			handler: function(e) {
				ctx.broadcast("showSidePanel",{
					content: getSearchView
				}).then(function() {
					searchView.find('#searchActivityInput').focus();
				});
			}
		});
		ctx.bus.publish("com.newt.system.toolbar.actions", {
			action: "settings",
			iconClass: "fa-cogs",
			handler: function(e) {
				ctx.broadcast("showSidePanel",{
					content: $("<div>Settings soon to come.. </div>")
				});
			}
		});
		
	};
	
	var createView = function() {
		var view = $("<div>");
		view.load(ctx.resolveUrl("/view/searchPanel.html"),function() {
			angular.element(view).ready(function() {
				angular.module('SystemModule')
					.value("framework",ctx.framework())
					.value("ctx",ctx);
				angular.bootstrap(view, [ 'SystemModule' ]);
			});
		});
		return $("<div><link href='"+ctx.resolveUrl("/view/searchPanel.css")+"' rel='stylesheet' type='text/css'></div>").append(view);
	};
	
	ctx.onStart(onStart);

};


angular.module('SystemModule', [])
.controller('SearchCtrl', ['$scope','framework','ctx','$element',function($scope,framework,ctx,$element) {
	
	$scope.searchInput='';
		
	$scope.searchableItems = $.map(framework.applicationRegistry.getActivitiesDefinitions(), function(value,key) {
		  return value;
	});
	$scope.filteredItems = [];
	$scope.selectedItemIndex=0;
	

	var scroll = $.throttle( 100, function() {
		$($element).find(".list-group-item").eq($scope.selectedItemIndex).scrollintoview({
		    duration: 200,
		    direction: "vertical"
		});
	});
	
	var startActivity = function($event, activityDef, mode) {
		if ($event) {
			$event.stopPropagation();
		}
		var i = ctx.newActivityIntent(activityDef.app, activityDef.name, {});
		i.startMode = mode || 'ROOT';
		return i.start();
	};
	
	$scope.keyDown = function($event) {
		
		if ($event.keyCode==40) {
			$scope.selectedItemIndex = Math.min($scope.filteredItems.length-1,$scope.selectedItemIndex+1);
			scroll();
			
		} else if ($event.keyCode==38) {
			$scope.selectedItemIndex = Math.max(0,$scope.selectedItemIndex-1);
			
			scroll();
			
		} else if ($event.keyCode==13) {
			if ($scope.selectedItemIndex>=0 && $scope.selectedItemIndex<$scope.filteredItems.length) {
				var act = $scope.filteredItems[$scope.selectedItemIndex];
				startActivity(null,act);
			}
		}
	};
	
	$scope.startActivity = startActivity;

}]);



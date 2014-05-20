var SearchService = function(ctx) {
	
	var onStart = function() {	

		ctx.getService("it.newt.system","ActionsService").addPermanentAction(ctx,{
			action: "search",
			iconClass: "fa-search",
			handler: function(e) {
				
				//questa chiamata non mi piace, l'accesso all'eventBus
				//è a un livello troppo basso
				
				ctx.framework().eventBus.broadcast("showSidePanel",{
					content: loadView
				}).then(function() {
					cachedView.find('#searchActivityInput').focus();
				});
			}
		});
	};
	
	var cachedView = null;
	
	var loadView = function() {
		if (cachedView!=null) {
			return cachedView;
		}
		return loadAngularView(ctx,{
			templateUrl: "/view/searchPanel.html",
			linkCss: "/view/searchPanel.css",
			module: 'SearchModule'
		}).then(function(view) {
			cachedView = view;
			return cachedView;
		});
	};
	
	ctx.onStart(onStart);

};


angular.module('SearchModule', [])

.controller('SearchCtrl', ['$scope','framework','ctx','$element',function($scope,framework,ctx,$element) {
	
	$scope.searchInput='';
		
	$scope.searchableItems = $.map(framework.applicationRegistry.getActivitiesDefinitions(), function(value,key) {
		  return value;
	});
	$scope.filteredItems = [];
	$scope.selectedItemIndex=0;
	

	var scroll = $.throttle( 100, function() {
		if ($element) {
			$($element).find(".list-group-item").eq($scope.selectedItemIndex).scrollintoview({
			    duration: 200,
			    direction: "vertical"
			});
		}
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

}])

//end
;


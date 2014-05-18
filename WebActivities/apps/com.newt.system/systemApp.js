

var SearchService = function(ctx) {
	
	var onStart = function() {	
		ctx.bus.publish("com.newt.system.toolbar.actions", {
			action: "search",
			iconClass: "fa-search",
			handler: function(e) {
				ctx.framework().uiCommunicator.broadcast("showSidePanel",{
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
		var deferred = jQuery.Deferred();
		var view = $("<div>");
		view.load(ctx.resolveUrl("/view/searchPanel.html"),function() {
			angular.element(view).ready(function() {
				view.prepend("<link href='"+ctx.resolveUrl("/view/searchPanel.css")+"' rel='stylesheet' type='text/css'>");
				angular.module('SystemModule')
					.value("framework",ctx.framework())
					.value("ctx",ctx);
				angular.bootstrap(view, [ 'SystemModule' ]);
				cachedView = view;
				deferred.resolve(view);
			});
		}); 
		return deferred.promise();
	};
	
	ctx.onStart(onStart);

};

var ThemeService = function(ctx) {
	
	var onStart = function() {	
		ctx.bus.publish("com.newt.system.toolbar.actions", {
			action: "themes",
			iconClass: "fa-picture-o",
			handler: function(e) {
				ctx.framework().uiCommunicator.broadcast("showSidePanel",{
					content: loadView
				});
			}
		});
	};
	
	var cachedView = null;
	
	var loadView = function() {
		if (cachedView!=null) {
			return cachedView;
		}
		var deferred = jQuery.Deferred();
		var view = $("<div>");
		view.load(ctx.resolveUrl("/view/themePanel.html"),function() {
			angular.element(view).ready(function() {
				angular.module('SystemModule')
					.value("framework",ctx.framework())
					.value("ctx",ctx);
				angular.bootstrap(view, [ 'SystemModule' ]);
				cachedView = view;
				deferred.resolve(view);
			});
		}); 
		return deferred.promise();
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


.controller('ThemeCtrl', ['$scope','framework','ctx','$element',function($scope,framework,ctx,$element) {
	
	
	$scope.themes = [{
		label: 'amelia',
		link: "css/amelia.bootstrap.min.css"
	},{
		label: 'cerulean',
		link: "css/cerulean.bootstrap.min.css"
	},{
		label: 'cosmo',
		link: "css/cosmo.bootstrap.min.css"
	}];
	
	$scope.selectedTheme = null;
	
	$scope.themeSelected = function() {
		$(window.top.document).find("link[data-newt-theme]").remove();
		$(window.top.document).find("head").append("<link rel='stylesheet' data-newt-theme href='"+$scope.selectedTheme+"'  />");
	};
	
}])


//end
;



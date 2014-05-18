
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
		
		ctx.bus.publish("com.newt.system.themes",{
			label: 'amelia',
			link: "css/amelia.bootstrap.min.css"
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'cerulean',
			link: "css/cerulean.bootstrap.min.css"
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'cosmo',
			link: "css/cosmo.bootstrap.min.css"
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'cupid',
			link: "css/cupid.bootstrap.min.css"
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'cyborg',
			link: "css/cyborg.bootstrap.min.css"
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'journal',
			link: "css/journal.bootstrap.min.css"
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'lumen',
			link: "css/lumen.bootstrap.min.css"
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'readable',
			link: "css/readable.bootstrap.min.css"
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'simplex',
			link: "css/simplex.bootstrap.min.css"
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'slate',
			link: "css/slate.bootstrap.min.css"
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'spacelab',
			link: "css/spacelab.bootstrap.min.css"
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'superhero',
			link: "css/superhero.bootstrap.min.css"
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'yeti',
			link: "css/yeti.bootstrap.min.css"
		});
		
	};
	
	var cachedView = null;
	
	var loadView = function() {
		if (cachedView!=null) {
			return cachedView;
		}
		return loadAngularView(ctx,{
			templateUrl: "/view/themePanel.html",
//			linkCss: "/view/searchPanel.css",
			module: 'ThemeModule'
		}).then(function(view) {
			cachedView = view;
			return cachedView;
		});
	};
	
	ctx.onStart(onStart);

};


angular.module('ThemeModule', [])

.controller('ThemeCtrl', ['$scope','framework','ctx','$element',function($scope,framework,ctx,$element) {
	
	$scope.themes = [];
	
	ctx.bus.syncTopic("com.newt.system.themes",$scope.themes,function() {
		$scope.$apply();
	});
	
	$scope.currentTheme = framework.getCurrentTheme();
	
	$scope.selectTheme = function(theme) {
		$scope.currentTheme = framework.setCurrentTheme(theme);
	};
	
}])


//end
;

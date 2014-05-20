
var ThemeService = function(ctx) {
	
	var onStart = function() {	
		
		ctx.bus.publish("com.newt.system.toolbar.actions", {
			action: "themes",
			iconClass: "fa-picture-o",
			handler: function(e) {
				ctx.framework().eventBus.broadcast("showSidePanel",{
					content: loadView
				});
			}
		});
		
		ctx.bus.publish("com.newt.system.themes",{
			label: 'amelia',
			links: [ctx.toAbsoluteUrl("themes/amelia.bootstrap.min.css")]
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'cerulean',
			links: [ctx.toAbsoluteUrl("themes/cerulean.bootstrap.min.css")]
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'cosmo',
			links: [ctx.toAbsoluteUrl("themes/cosmo.bootstrap.min.css")]
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'cupid',
			links: [ctx.toAbsoluteUrl("themes/cupid.bootstrap.min.css")]
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'cyborg',
			links: [ctx.toAbsoluteUrl("themes/cyborg.bootstrap.min.css")]
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'journal',
			links: [ctx.toAbsoluteUrl("themes/journal.bootstrap.min.css")]
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'lumen',
			links: [ctx.toAbsoluteUrl("themes/lumen.bootstrap.min.css")]
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'readable',
			links: [ctx.toAbsoluteUrl("themes/readable.bootstrap.min.css")]
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'simplex',
			links: [ctx.toAbsoluteUrl("themes/simplex.bootstrap.min.css")]
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'slate',
			links: [ctx.toAbsoluteUrl("themes/slate.bootstrap.min.css")]
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'spacelab',
			links: [ctx.toAbsoluteUrl("themes/spacelab.bootstrap.min.css")]
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'superhero',
			links: [ctx.toAbsoluteUrl("themes/superhero.bootstrap.min.css")]
		});
		ctx.bus.publish("com.newt.system.themes",{
			label: 'yeti',
			links: [ctx.toAbsoluteUrl("themes/yeti.bootstrap.min.css")]
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

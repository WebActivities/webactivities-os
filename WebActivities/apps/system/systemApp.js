
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
	
	
	var searchView = $("<div></div>");
	searchView.load(ctx.resolveUrl("/view/searchPanel.html"),function() {
		
	});
	
	ctx.onStart(function() {
		
		ctx.bus.publish("com.newt.system.toolbar.actions", {
			action: "settings",
			iconClass: "fa-cogs",
			handler: function(e) {
				console.log("execute: "+e);
				ctx.broadcast("showSidePanel",{
					content: $("<div>Settings soon to come.. </div>")
				});
			}
		});
		
		ctx.bus.publish("com.newt.system.toolbar.actions", {
			action: "search",
			iconClass: "fa-search",
			handler: function(e) {
				console.log("execute: "+e);
				ctx.broadcast("showSidePanel",{
					content: searchView
				});
			}
		});
		
	});
	
};


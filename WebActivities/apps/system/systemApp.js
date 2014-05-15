//alert("system App installed");

alert("sss");

var ToolbarService = function(ctx) {
	
	ctx.onStart(function() {
		
		ctx.bus.subscribe("com.newt.system.toolbar.actions", function(added, removed) {
			console.log("Added");
			console.log(added);
			console.log("Removed");
			console.log(removed);
		});
		
	});
	
};

var SearchService = function(ctx) {
	
	ctx.onStart(function() {
		
		ctx.bus.publish("com.newt.system.toolbar.actions", {
			action: "search"
		});
		
	});
	
};
alert(SearchService);

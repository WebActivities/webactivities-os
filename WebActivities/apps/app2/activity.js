var Activity1 = function(context) {
	
	var view = "<h1>Another World</h1>";
	
	context.prepareView().then(function(ui) {
		ui.innerHTML  = view;
	});
	
	context.setResult("oooo");
	
	context.onShow(function() {
		context.bus.publish("com.newt.system.toolbar.actions", {
			order: 1,
			activityId: context.activityId(),
			action: "search",
			iconClass: "fa-search",
			handler: function(e) {
				alert("azione di Activity 1");
			}
		});
	});
	
};


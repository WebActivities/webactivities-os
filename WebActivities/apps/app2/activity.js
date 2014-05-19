var Activity1 = function(context) {
	
	var view = "<h1>Another World</h1>";
	
	context.prepareView().then(function(ui) {
		ui.innerHTML  = view;
	});
	
	context.setResult("oooo");
	
	context.onShow(function() {
		
		if (!ctx.actions) {
			ctx.actions = [];
		}
		ctx.actions.push({
			order: 1,
			action: "azione X",
			iconClass: "fa-search",
			handler: function(e) {
				alert("azione X dell'activity "+ctx.getActivityInstanceId());
			}
		});

	});
	
};


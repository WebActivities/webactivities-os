var Activity1 = function(context) {
	
	var view = "<h1>Another World</h1>";
	
	context.prepareView().then(function(ui) {
		ui.innerHTML  = view;
	});
	
	context.setResult("oooo");
	
};


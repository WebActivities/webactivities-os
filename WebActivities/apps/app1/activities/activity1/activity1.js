var Activity1 = function(ctx) {

	var container = $("<div></div>");
	var header = $("<h1>").text("This is the first application").appendTo(container);
	var btn = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Chiudi</button>").appendTo(container);
	btn.click(function() {
		ctx.stop();
	});

	ctx.prepareView().then(function(root) {
		$(root).append(container);
	});

	ctx.onStop(function() {
		var deferred = $.Deferred();
		header.text("Application will be stopped in 2 seconds...");
		setTimeout(function() {
			deferred.resolve();
		}, 2000);
		return deferred.promise();
	});

	ctx.onResume(function() {
		var deferred = $.Deferred();
		header.text("Application will be resumed in 2 seconds...");
		setTimeout(function() {
			deferred.resolve();
		}, 2000);
		return deferred.promise();
	});

};

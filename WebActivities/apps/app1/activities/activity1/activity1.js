var Activity1 = function(ctx) {

	var container = $("<div></div>");
	var header = $("<h1>").text("This is the first application").appendTo(container);
	$("<input type=\"text\" class=\"form-control\" placeholder=\"Inserisci qualcosa per vedere se mantiene lo stato\">").appendTo(container);
	$("<hr />").appendTo(container);
	var btn1 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Chiudi</button>").appendTo(container);
	btn1.click(function() {
		ctx.stop();
	});
	var btn2 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Avvia Activity1</button>").appendTo(container);
	btn2.click(function() {
		ctx.beginChildIntent("activity1");
	});
	var btn3 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Avvia Activity2</button>").appendTo(container);
	btn3.click(function() {
		ctx.beginChildIntent("activity2");
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
		header.text("Application is resumed!");
	});

	ctx.onPause(function() {
		var deferred = $.Deferred();
		header.text("Application will be paused in 2 seconds...");
		setTimeout(function() {
			deferred.resolve();
		}, 2000);
		return deferred.promise();
	});

};

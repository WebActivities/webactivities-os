var Activity3 = function(ctx) {
	var container = $("<div></div>");
	$("<h1>").text("This is another application").appendTo(container);

	var btn1 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Avvia un altra attività</button>").appendTo(container);
	btn1.click(function() {
		ctx.newActivityIntent("it.test.app.one", "activity3").start().then(function(result) {
			container.append("The result is " + result);
		});
	});

	ctx.prepareView().then(function(root) {
		$(root).append(container);
	});
};

var Activity1 = function(ctx) {

	var container = $("<div></div>");
	var header = $("<h1>").text("This is the first application").appendTo(container);
	var input = $("<input type=\"text\" class=\"form-control\" placeholder=\"Inserisci qualcosa per vedere se mantiene lo stato. Sarà anche il valore tornato all'activity precedente.\">").appendTo(
			container);
	input.change(function() {
		ctx.setResult(input.val());
	});
	$("<hr />").appendTo(container);
	var btn1 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Chiudi</button>").appendTo(container);
	btn1.click(function() {
		ctx.stop();
	});
	var btn7 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Chiudi e torna ciao!</button>").appendTo(container);
	btn7.click(function() {
		ctx.stop("ciao");
	});
	var btn8 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Avvia Activity1 come root</button>").appendTo(container);
	btn8.click(function() {
		var i = ctx.newActivityIntent("it.test.app.one", "activity1");
		i.startMode = "ROOT";
		i.start().then(function(result) {
			container.append("The result is " + result);
		});
	});
	var btn2 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Avvia Activity1</button>").appendTo(container);
	btn2.click(function() {
		ctx.newActivityIntent("it.test.app.one", "activity1").start().then(function(result) {
			container.append("The result is " + result);
		});
	});
	var btn22 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Avvia Activity3</button>").appendTo(container);
	btn22.click(function() {
		ctx.newActivityIntent("it.test.app.one", "activity3").start().then(function(result) {
			container.append("The result is " + result);
		});
	});
	var btn3 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Avvia Activity2</button>").appendTo(container);
	btn3.click(function() {
		ctx.newActivityIntent("it.test.app.two", "activity2").start().then(function(result) {
			container.append("The result is " + result);
		});
	});

	var btn31 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Avvia Map Intent Filter</button>").appendTo(container);
	btn31.click(function() {
		ctx.newIntent("map").start().then(function(result) {
			container.append("The result is " + result);
		});
	});
	
	var btn32 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Send Message</button>").appendTo(container);
	btn32.click(function() {
		ctx.sendMessage("Hello World!");
	});

	var types = [ "info", "warning", "error", "success" ];
	for ( var i in types) {
		var btn11 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Show Notify " + types[i] + "</button>").appendTo(container);
		btn11.click(function(t) {
			return function() {
				ctx.notify(t, "Questo è un messaggio di info").then(function() {

				});
			};
		}(types[i]));
	}
	
	ctx.onMessage(function(source, msg) {
		alert('Received message from ' + source.id + ": " + msg);
	});

	ctx.prepareView().then(function(root) {
		$(root).append(container);
	});

	ctx.onStop(function() {
		var deferred = $.Deferred();
		header.text("Application will be stopped in 2 seconds...");
		return true;
		setTimeout(function() {
			deferred.resolve();
		}, 2000);
		return deferred.promise();
	});
	
	ctx.onShow(function() {
		alert("Displayed");
	});

	ctx.onResume(function() {
		header.text("Application is resumed!");
	});

	ctx.onPause(function() {
		var deferred = $.Deferred();
		header.text("Application will be paused in 2 seconds...");
		return true;
		setTimeout(function() {
			deferred.resolve();
		}, 2000);
		return deferred.promise();
	});

};

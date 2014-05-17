var Activity3 = function(ctx) {
	
	var container = $("<div></div>");
	var header = $("<h1>").text("This is another application").appendTo(container);

	var btn1 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Avvia un altra attività</button>").appendTo(container);
	btn1.click(function() {
		ctx.newActivityIntent("it.test.app.one", "activity3").start().then(function(result) {
			container.append("The result is " + result);
		});
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

	ctx.onPause(function() {
		container.append("<div>Paused</div>");
	});

	ctx.onResume(function() {
		container.append("<div>Resumed</div>");
	});
	
};

var Activity1 = function(ctx) {
	var fragment = ctx.createFragment("it.test.app.one", "activity3");
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

	var btn18 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Avvia Activity3 POPUP grande</button>").appendTo(container);
	btn18.click(function() {
		var i = ctx.newActivityIntent("it.test.app.one", "activity1");
		i.startMode = "CHILD_POPUP";
		i.start({
			size : 'lg'
		}).then(function(result) {
			container.append("The result is " + result);
		});
	});

	var btn18 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Avvia Activity3 POPUP piccolo</button>").appendTo(container);
	btn18.click(function() {
		var i = ctx.newActivityIntent("it.test.app.one", "activity1");
		i.startMode = "CHILD_POPUP";
		i.start({
			size : 'sm'
		}).then(function(result) {
			container.append("The result is " + result);
		});
	});

	var btn118 = $("<button type=\"button\" class=\"btn btn-sm btn-primary\">Avvia Activity3 POPUP RELATIVO!</button>").appendTo(container);
	btn118.draggable();
	btn118.click(function() {
		var i = ctx.newActivityIntent("it.test.app.one", "activity1");
		i.startMode = "CHILD_POPUP";
		i.start({
			relativeTo : this
		}).then(function(result) {
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
		ctx.bus.publish("it.eng.test", "Ciao!");
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

	ctx.bus.subscribe("**", function(added, removed) {
		alert("Io ascolto tutto:\n - added:\n" + added + "\n - removed:\n" + removed);
	});

	ctx.prepareView().then(function(root) {
		$(root).append(container);
		fragment.start();
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
		ctx.bus.publish("com.newt.system.toolbar.actions", {
			order: 1,
			activityId: ctx.activityId(),
			action: "azione X",
			iconClass: "fa-coffee",
			handler: function(e) {
				alert("azione X dell'activity");
			}
		});
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

	
	container.append("<h2>Questo frammento parte subito</h2>");
	container.append(fragment.getComponent().css({
		width : "100%",
		height : "200px",
		margin : "1em 0",
		border : "2px solid royalblue"
	}));
	

	var fragment1 = ctx.createFragment("it.test.app.one", "activity3");
	container.append("<h2>Questo frammento parte con i pulsanti sotto</h2>");
	container.append(fragment1.getComponent().css({
		width : "100%",
		height : "200px",
		margin : "1em 0",
		border : "2px solid royalblue"
	}));

	$("<button type=\"button\" class=\"btn btn-sm btn-primary\"><i class=\"glyphicon glyphicon-play\"></i></button>").appendTo(container).click(function() {
		fragment1.start();
	});

	$("<button type=\"button\" class=\"btn btn-sm btn-primary\"><i class=\"glyphicon glyphicon-stop\"></i></button>").appendTo(container).click(function() {
		fragment1.stop();
	});

	$("<button type=\"button\" class=\"btn btn-sm btn-primary\"><i class=\"glyphicon glyphicon-pause\"></i></button>").appendTo(container).click(function() {
		fragment1.pause();
	});

	$("<button type=\"button\" class=\"btn btn-sm btn-primary\"><i class=\"glyphicon glyphicon-refresh\"></i></button>").appendTo(container).click(function() {
		fragment1.resume();
	});
	
	container.append("<br /><br /><br /><br />");

	
	
};

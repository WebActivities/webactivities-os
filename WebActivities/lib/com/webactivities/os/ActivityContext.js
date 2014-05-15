var ActivityContext = function(webActivities, stackItem, _closeDefer, $q) {

	var _stop = function() {
		return true;
	};

	var _resume = function() {
		return true;
	};

	var _pause = function() {
		return true;
	};

	var _show = function() {
		return true;
	};

	var _listeners = 0 || [];

	var _result = null;

	var writeActivityStartingDoc = function(iframe, activity) {
		var doc = iframe.contentWindow.window.document;
		doc.open();
		doc.write("<html>");
		doc.write("<head>");
		if (activity.seamless) {
			doc.write("<link rel=\"stylesheet\" href=\"css/yeti.bootstrap.min.css\" />");
		}
		doc.write("<base href=\"" + activity.path + "/\">");
		doc.write("<script type=\"text/javascript\">");
		doc.write("var top = null;");
		doc.write("var opener = null;");
		doc.write("window.parent = null;");
		doc.write("window.opener = null;");
		doc.write("</script>");
		doc.write("</head>");
		doc.write("<body>");
		doc.write("<div id=\"internalViewport\" ");
		if (activity.seamless) {
			doc.write(" class=\"container-fluid\"");
		}
		doc.write("></div>");
		doc.write("</body>");
		doc.write("</html>");
		doc.close();
	};

	this.getCloseDefer = function() {
		return _closeDefer;
	};

	this.setResult = function(result) {
		_result = result;
	};

	this.getResult = function() {
		return _result;
	};

	this.onStop = function(fn) {
		_stop = fn;
	};

	this.getStop = function() {
		return _stop;
	};

	this.onShow = function(fn) {
		_show = fn;
	};

	this.getShow = function() {
		return _show;
	};

	this.stop = function(result) {
		if (result !== undefined) {
			_result = result;
		}
		webActivities.stopActivity();
	};

	this.onResume = function(fn) {
		_resume = fn;
	};

	this.getResume = function() {
		return _resume;
	};

	this.onPause = function(fn) {
		_pause = fn;
	};

	this.getPause = function() {
		return _pause;
	};

	this.sendMessage = function(msg) {
		webActivities.sendMessage(stackItem.activity, msg);
	};

	this.onMessage = function(fn) {
		_listeners.push(fn);
	};

	this.getMessageListeners = function() {
		return _listeners;
	};

	this.newActivityIntent = function(app, activity, parameters) {
		var i = new Intent(IntentType.START_ACTIVITY, webActivities);
		i.activity = activity;
		i.parameters = parameters;
		i.app = app;
		return i;
	};

	this.newIntent = function(intentType, parameters) {
		var i = new Intent(intentType, webActivities);
		i.parameters = parameters;
		return i;
	};
	
	this.resolveUrl = function(path) {
		base = stackItem.activity.path;
		return path.indexOf("http") == 0 ? path : base + (path.indexOf("/") == 0 ? path : "/" + path);
	};

	this.prepareView = function(url) {
		var viewDeferred = $q.defer();
		var iframe = $("<iframe></iframe>")[0];

		$(iframe).on("attached", function() {
			$(iframe).load(function() {
				var viewport = $(iframe).contents().find("#internalViewport")[0];
				if (url) {
					$(viewport).load(url, function() {
						viewDeferred.resolve(viewport);
					});
				} else {
					viewDeferred.resolve(viewport);
				}
			});
			writeActivityStartingDoc(iframe, stackItem.activity);
		});

		stackItem.iframe = iframe;

		webActivities.broadcast('displayActivity', {
			view : iframe,
			activity : stackItem.activity
		}).then(function() {
			stackItem.status = Activity.status.ACTIVE;
			$q.when(stackItem.context.getShow()()).then(function() {
				// Nothing for the moment
			});
		});

		return viewDeferred.promise;
	};

	this.notify = function(type, message, options) {
		return webActivities.notify(type, message, options);
	};

};

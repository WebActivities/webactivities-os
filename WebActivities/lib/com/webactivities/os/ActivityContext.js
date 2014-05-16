var ActivityContext = function(framework, activity, _closeDefer, $q) {

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

	this.bus = framework.bus.createBus();

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
		framework.stopActivity();
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

	this.createFragment = function(app, activity, parameters) {
		var f = new Fragment(this);
		f.app = app;
		f.activity = activity;
		f.parameters = parameters;
		return f;
	};

	this.newActivityIntent = function(app, activity, parameters) {
		var i = new Intent(IntentType.START_ACTIVITY, framework);
		i.activity = activity;
		i.parameters = parameters;
		i.app = app;
		return i;
	};

	this.newIntent = function(intentType, parameters) {
		var i = new Intent(intentType, framework);
		i.parameters = parameters;
		return i;
	};

	this.resolveUrl = function(path) {
		return Utils.resolveUrl(activity.application, path);
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
			writeActivityStartingDoc(iframe, activity);
		});

		activity.iframe = iframe;

		framework.uiCommunicator.broadcast('displayActivity', {
			view : iframe,
			activity : activity.activity
		}).then(function() {
			activity.status = Activity.status.ACTIVE;
			$q.when(activity.context.getShow()()).then(function() {
				// Nothing for the moment
			});
		});

		return viewDeferred.promise;
	};

	this.notify = function(type, message, options) {
		return framework.notifyManager.notify(type, message, options);
	};

};

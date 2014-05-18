/**
 * Activity
 * 
 * @class Activity
 * @module Activity
 * @constructor
 */
var Activity = function(framework, application, activityDef, closeDefer, $q) {

	$.extend(this, activityDef);
	var self = this;

	this.instanceId = Utils.getUniqueKey("activity_");
	this.application = application;
	this.openMode = null;

	this.activityDef = activityDef;

	/**
	 * Connected iframe to Actvitity
	 * 
	 * @property iframe
	 * @type {Object}
	 * @default "null"
	 */
	this.iframe = null;

	/**
	 * My property description. Like other pieces of your comment blocks, this
	 * can span multiple lines.
	 * 
	 * @property propertyName
	 * @type {Object}
	 * @default "foo"
	 */
	this.context = framework.createContext(self, closeDefer, $q);

	this.instance = null;
	this.status = null;

	/**
	 * Start an Activity
	 * 
	 * @method start
	 * @param {Object} parameters
	 *            Start parameters
	 * @param {StartMode} startMode
	 *            startMode
	 * @param {Object} startOptions
	 *            Start options
	 * @return {Promise} Returns a promise
	 */
	this.start = function(parameters, startMode, startOptions) {
		return startMode(this, startOptions).then(function() {
			self.status = Activity.status.CREATED;
			self.instance = self.instantiate(self.context, parameters);
			framework.uiCommunicator.broadcast('activityStarted', self);
		});
	};

	this.instantiate = function(context, parameters) {
		return new application.iframe[0].contentWindow.window[activityDef.activator](context, parameters);
	};

	this.stop = function() {
		var d = framework.$q.defer();
		var self = this;
		framework.activityStopper.stop(this).then(function() {
			self.status = Activity.status.STOPPED;
			d.resolve();
		});
		return d.promise;
	};

	this.pause = function(options) {
		var d = framework.$q.defer();
		var self = this;
		framework.activityPauser.pause(this, options).then(function() {
			self.status = Activity.status.PAUSED;
			d.resolve();
		});
		return d.promise;
	};

	this.resume = function(options) {
		var d = framework.$q.defer();
		var self = this;
		framework.activityResumer.resume(this, options).then(function() {
			self.status = Activity.status.ACTIVE;
			d.resolve();
		});
		return d.promise;
	};
	
	this.setCurrentTheme = function(theme) {
		if (this.seamless) {
			var doc = $(this.iframe.contentWindow.document);
			doc.find("link[data-newt-theme]").remove();
			doc.find("head").append("<link rel=\"stylesheet\" data-newt-theme href=\""+theme.link+"\" />");
		}
	};
	
	this.prepareView = function(url) {
		var self = this;
		var viewDeferred = $q.defer();
		this.iframe = $("<iframe></iframe>")[0];
		var jIframe = $(this.iframe);
		jIframe.on("attached", function() {
			jIframe.load(function() {
				var viewport = jIframe.contents().find("#internalViewport")[0];
				if (url) {
					$(viewport).load(url, function() {
						viewDeferred.resolve(viewport);
						framework.uiCommunicator.broadcast("iframeLoaded", {});
					});
				} else {
					viewDeferred.resolve(viewport);
					framework.uiCommunicator.broadcast("iframeLoaded", {});
				}
			});
			self.writeActivityStartingDoc();
		});
		this.doDisplayView();
		return viewDeferred.promise;
	};
	
	this.doDisplayView = function() {
		var self = this;
		framework.uiCommunicator.broadcast('displayActivity', {
			view : self.iframe,
			activity : self
		}).then(function() {
			self.status = Activity.status.ACTIVE;
			$q.when(self.context.getShow()()).then(function() {
				framework.uiCommunicator.broadcast("activityDisplayed", {});
			});
		});
	};

	this.writeActivityStartingDoc = function() {
		var doc = this.iframe.contentWindow.window.document;
		doc.open();
		doc.write("<html>");
		doc.write("<head>");
		if (this.seamless) {
			var theme = framework.getCurrentTheme();
			doc.write("<link rel=\"stylesheet\" data-newt-theme href=\""+theme.link+"\" />");
		}
		doc.write("<base href=\"" + this.path + "/\">");
		doc.write("<script type=\"text/javascript\">");
		doc.write("var top = null;");
		doc.write("var opener = null;");
		doc.write("window.parent = null;");
		doc.write("window.opener = null;");
		doc.write("</script>");
		doc.write("</head>");
		doc.write("<body>");
		doc.write("<div id=\"internalViewport\" ");
		if (this.seamless) {
			doc.write(" class=\"container-fluid\"");
		}
		doc.write("></div>");
		doc.write("</body>");
		doc.write("</html>");
		doc.close();
	};
	
};

/**
 * Completa le informazioni presenti del manifest di una activity
 */
Activity.completeActivityDefinition = function(webActivities, application, activityDefinition) {
	activityDefinition.application = application;
	activityDefinition.id = Utils.composeActivityId(application.id, activityDefinition.name);
	activityDefinition.path = application.path;
	activityDefinition.app = application.id;
	activityDefinition.appName = application.name;
	activityDefinition.icon = Utils.resolveUrl(application, activityDefinition.icon);
	activityDefinition.searchableIndex = [ activityDefinition.name, activityDefinition.description ];
};

Activity.status = {
	"CREATED" : 0,
	"ACTIVE" : 2,
	"PAUSED" : 4,
	"STOPPED" : 8
};

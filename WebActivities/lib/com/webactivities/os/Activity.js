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
	 * L'eventBus che usa questa activity per fare il broadcast degli eventi di:
	 * - activityDisplayed
	 * - displayActivity
	 * - iframeLoaded
	 * - activityStarted
	 * 
	 * @property eventBus
	 * @type {Object}
	 */
	this.eventBus = framework.eventBus;

	/**
	 * Connected iframe to Actvitity
	 * 
	 * @property iframe
	 * @type {Object}
	 */
	this.iframe = null;

	/**
	 * l'ActivityContext l'API esposta verso l'interno
	 * dell'activity
	 * 
	 * @property propertyName
	 * @type {Object}
	 */
	this.context = framework.createContext(self, closeDefer, $q);

	/**
	 * l'istanza dell'oggetto specificato sull'Activator del manifest 
	 * instanziato dentro l'iframe tramite una new
	 * 
	 * @property instance
	 * @type {Object}
	 */
	this.instance = null;
	
	this.status = null;
	
	/**
	 * I fragments che vivono all'interno di questa Activity
	 * 
	 * @property fragments
	 * @type {Object}
	 * @default "foo"
	 */
	this.fragments = [];


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
			self.eventBus.broadcast('activityStarted', self);
		});
	};

	this.instantiate = function(context, parameters) {
		return new application.iframe[0].contentWindow.window[activityDef.activator](context, parameters);
	};

	
	this.stop = function() {
		
		var promises = [ $q.when(this.context.getStop()()) ];

		for (var i in this.fragments) {
			promises.push($q.when(this.fragments[i].stop()));
		}
		
		var stopAction = $q.all(promises);
		
		stopAction.then(function() {
			self.context.bus.destroy();
		});
		
		stopAction.then(function() {
			return self.eventBus.broadcast('destroyActivity', {
				view : self.iframe,
				activity : self
			});
		});
		
		if (!this.isFragment) {
			
			stopAction.then(function() {
				framework.activityStack.pop();
			});
			
			var disableEffects = false;
			if (this.openMode == 'CHILD_POPUP') {
				disableEffects=true;
				stopAction.then(function() {
					return framework.popLayer();
				});
			}
			stopAction.then(function() {
				return framework.resumeActivity({
					disableEffects : disableEffects
				});
			});
		}
		
		stopAction.then(function() {
			self.context.getCloseDefer().resolve(self.context.getResult());
		});
		
		stopAction.then(function() {
			self.status = Activity.status.STOPPED;
		});
		
		return stopAction;
	};
	
	this.pause = function(options) {
		
		var promises = [ $q.when(this.context.getPause()()) ];
		
		for (var i in this.fragments) {
			promises.push($q.when(this.fragments[i].pause()));
		}
		
		var pauseAction = $q.all(promises);
		
		if (options && options.mode == 'hidden') {
			pauseAction.then(function() {
				return self.eventBus.broadcast('hideActivity', {
					view : self.iframe,
					activity : self
				});
			});
		}
		
		pauseAction.then(function() {
			return self.eventBus.broadcast('pausedActivity',self);
		});
		
		pauseAction.then(function() {
			self.status = Activity.status.PAUSED;
		});
		return pauseAction;
	};
	
	this.resume = function(options) {
		
		var promises = [ $q.when(this.context.getResume()()) ];
		
		for (var i in this.fragments) {
			promises.push($q.when(this.fragments[i].resume()));
		}
		
		var resumeAction = $q.all(promises);
		
		if (!this.isFragment) {
			resumeAction.then(function() {
				self.eventBus.broadcast('displayActivity', {
					view : self.iframe,
					activity : self,
					disableEffects : options?options.disableEffects:null
				});
			});
		}
		
		resumeAction.then(function() {
			self.status = Activity.status.ACTIVE;
		});
		
		resumeAction.then(function() {
			return self.eventBus.broadcast('resumedActivity',self);
		});
		
		return resumeAction;
	};
	
	this.setCurrentTheme = function(theme) {
		if (this.seamless) {
			var doc = $(this.iframe.contentWindow.document);
			doc.find("link[data-newt-theme]").remove();
			var i=0, head=doc.find("head");
			for (i=0; i<theme.links.length; i++) {
				head.append("<link rel=\"stylesheet\" data-newt-theme href=\""+theme.links[i]+"\" />");
			}
		}
		$.each(this.fragments,function(i,f) {
			f.setCurrentTheme(theme);
		});
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
						self.eventBus.broadcast("iframeLoaded", {});
					});
				} else {
					viewDeferred.resolve(viewport);
					self.eventBus.broadcast("iframeLoaded", {});
				}
			});
			self.writeActivityStartingDoc();
		});
		this.doDisplayView();
		return viewDeferred.promise;
	};
	
	this.doDisplayView = function() {
		var self = this;
		self.eventBus.broadcast('displayActivity', {
			view : self.iframe,
			activity : self
		}).then(function() {
			self.status = Activity.status.ACTIVE;
			$q.when(self.context.getShow()()).then(function() {
				self.eventBus.broadcast("activityDisplayed", {});
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
			var i=0;
			for (i=0; i<theme.links.length; i++) {
				doc.write("<link rel=\"stylesheet\" data-newt-theme href=\""+theme.links[i]+"\" />");
				doc.write("<link rel=\"stylesheet\" href=\"css/font-awesome.min.css\" />");
				doc.write("<script src=\"lib/jquery/jquery-2.1.1.min.js\"></script>");
				doc.write("<script src=\"lib/uibootstrap/bootstrap.min.js\"></script>");
			}
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
	
	this.createFragment = function(appId, activityName, parameters) {
		var f = new Fragment(framework, this);
		f.app = appId;
		f.activity = activityName;
		f.parameters = parameters;
		this.fragments.push(f);
		return f;
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


var Application = function(webActivities,appDefinition, $q)  {
	
	var self = this;
	this.path = Utils.dirname(appDefinition.manifestUrl);
	
	$.extend(this,appDefinition);
	this.appDefinition = appDefinition;
	
	this.icon = Utils.resolveUrl(this, appDefinition.icon);
	appDefinition.icon = this.icon;
	
	
	/**
	 * Activities manifest json
	 */
	this.activitiesDefinitions = {};
	if ($.isArray(appDefinition.activities)) {
		$.each(appDefinition.activities,function(i,item) {
			Activity.completeActivityDefinition(webActivities, self, item);
			self.activitiesDefinitions[item.id]=item;
			Logger.log("Registered activity <" + item.id + "> ", item);
		});
	}
	
	/**
	 * Services manifest json
	 */
	this.servicesDefinitions = {};
	if ($.isArray(appDefinition.services)) {
		$.each(appDefinition.services,function(i,item) {
			Service.completeServiceDefinition(webActivities, self, item);
			self.servicesDefinitions[item.id]=item;
			Logger.log("Registered service <" + item.id + "> ", item);
		});
	}
	
	/**
	 * Running activities instances
	 */
	this.activities = [];
	
	/**
	 * Running services instances
	 */
	this.services = [];
	
	this.status = Application.status.REGISTERED;
	this.version = appDefinition.version || "0.0.0";

	var createHostingIframe= function(afterIframeLoadCallback) {
		var resourcesIncluded = "";
		if ($.isArray(appDefinition.resources)) {
			$.each(appDefinition.resources, function(index, value) {
				resourcesIncluded += "<script src='" + Utils.resolveUrl(self, value) + "' type='application/javascript'><\/script>";
			});
		}
		var iframe = $('<iframe />', {
			style : "border: 0; width: 0; height: 0"
		}).appendTo($("#app-class-loader"));
		var doc = iframe[0].contentWindow.window.document;
		doc.open();
		doc.write("<script type=\"text/javascript\">var top = null; var opener = null; var parent = null; window.opener = null; window.parent = null;</script>" + resourcesIncluded);
		doc.close();
		iframe.load(function() {
			afterIframeLoadCallback();
		});
		return iframe;
	};

	this.businessCard = function() {
		var icon = "<img src=\"" + this.appDefinition.icon + "\" style=\"max-width: 32px; vertical-align: middle\"><br />";
		var bc = "<strong>" + this.appDefinition.name + " (" + this.appDefinition.version + ")</strong><br />";
		var code = "<small>" + this.appDefinition.id + "</small><br />";
		var div = $("<div>").css("text-align", "center");
		div.append(icon);
		div.append(bc);
		div.append(code);
		return $("<div>").append(div).html();
	};
	
	this.startingPromise = null;
	
	this.startApplication = function(preventStartActivity) {
		
		if (this.status == Application.status.REGISTERED) {
			var deferred = $q.defer();
			webActivities.broadcast('appStarting',this);
			this.status = Application.status.STARTING;
			this.iframe = createHostingIframe(function() {
				self.status = Application.status.STARTED;
				webActivities.broadcast('appStarted', self);
				if (preventStartActivity) {
					deferred.resolve(self);
				} else {
					self.startMainActivity().then(function() {
						deferred.resolve(self);
					});
				}
			});
			startingPromise = deferred.promise
			return startingPromise;
			
		} else if (this.status == Application.status.STARTING) {
			
			return startingPromise;
			
		} else if (this.status == Application.status.STARTED) {
			if (!preventStartActivity) {
				return this.startMainActivity().then(function() {
					return self;
				});
			} else {
				return $q.when(this);
			}
		}
	};
	
	this.checkAutostartServices = function() {
		$.each(this.servicesDefinitions,function(k,v) {
			if (v.autostart) {
				self.startService(v.name,{},{});
			}
		});
	};
	
	this.startMainActivity = function() {
		if (this.status != Application.status.STARTED) {
			Logger.error("The application <" + this.id + "> isn't started");
			return $q.reject();
		} else if (!this.appDefinition.main) {
			Logger.log("The application <" + this.id + "> not have a main activity");
			return $q.when();
		} else {
			return webActivities.startActivity(this.appDefinition.main, this.id, null, webActivities.startMode.ROOT);
		}
	};
	
	this.startActivity = function(activityName, parameters, startMode, startOptions, closeDefer) {
		
		if (closeDefer == null) {
			closeDefer = $q.defer();
		}
		
		var activityId = Utils.composeActivityId(this.id, activityName);
		var activityDefinition = this.activitiesDefinitions[activityId];

		if (activityDefinition == null) {
			Logger.error("Activity <" + activityName + "> in app <" + this.id + "> not found");
			return $q.reject();
		} 
			
		if (this.status == Application.status.REGISTERED ||
			this.status == Application.status.STARTING) {
			
			return this.startApplication(true)
				.then(function(app) {
					return app.startActivity(activityName, parameters, startMode, startOptions, closeDefer);
				});

		} else {

			var activity = new Activity(webActivities,this,activityDefinition,closeDefer,$q); 
			webActivities.broadcast('activityStarting',activity);
			return activity.start(parameters,startMode,startOptions);
		}

	};
	
	this.startService = function(serviceName, parameters, startOptions) {
		
		var serviceId = Utils.composeServiceId(this.id, serviceName);
		var serviceDefinition = this.servicesDefinitions[serviceId];

		if (serviceDefinition == null) {
			Logger.error("Service <" + serviceName + "> in app <" + this.id + "> not found");
			return $q.reject();
		} 
			
		if (this.status == Application.status.REGISTERED ||
			this.status == Application.status.STARTING) {
			
			return this.startApplication(true)
				.then(function(app) {
					return app.startService(serviceName, parameters, startOptions);
				});

		} else {

			var service = new Service(webActivities,this,serviceDefinition,$q);
			return service.start(parameters,startOptions);
		}
		
	};

	Logger.log("Registered application " + appDefinition.name + " <" + appDefinition.id + ">");
	Logger.log(appDefinition);
};

Application.status = {
	"REGISTERED": 0,
	"STARTING": 2,
	"STARTED": 4
};

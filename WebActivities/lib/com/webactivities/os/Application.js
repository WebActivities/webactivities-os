
var Application = function(webActivities,appDefinition)  {
	
	var self = this;
	this.path = webActivities.dirname(appDefinition.manifestUrl);
	
	$.extend(this,appDefinition);
	this.appDefinition = appDefinition;
	
	this.icon = webActivities.resolveUrl(this, appDefinition.icon);
	appDefinition.icon = this.icon;
	
	
	/**
	 * Activity manifest json
	 */
	this.activitiesDefinitions = appDefinition.activities || [];
	$.each(this.activitiesDefinitions,function(i,item) {
		Activity.completeActivityDefinition(webActivities, self, item);
		Logger.log("Registered activity <" + item.id + "> ", item);
	});
	
	
	/**
	 * Running activities instances
	 */
	this.activities = [];
	
	this.status = Application.status.REGISTERED;
	this.version = appDefinition.version || "0.0.0";


	var createHostingIframe= function(afterIframeLoadCallback) {
		var resourcesIncluded = "";
		if ($.isArray(appDefinition.resources)) {
			$.each(appDefinition.resources, function(index, value) {
				resourcesIncluded += "<script src='" + webActivities.resolveUrl(self, value) + "' type='application/javascript'><\/script>";
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
	
	this.startApplication = function(preventStartActivity, callback) {
		
		//TODO e la callback??
		
		if (this.status == Application.status.REGISTERED) {
			
			webActivities.broadcast('appStarting',this);
			this.status = Application.status.STARTING;
			this.iframe = createHostingIframe(function() {
				self.status = Application.status.STARTED;
				webActivities.broadcast('appStarted', self);
				if (!preventStartActivity) {
					self.startMainActivity();
				}
				if (callback) {
					callback(self);
				}
			});
			
			
		} else if (this.status == Application.status.STARTING) {
			// do nothing... wait for start
			
		} else if (this.status == Application.status.STARTED) {
			if (!preventStartActivity) {
				this.startMainActivity();
			}
		}
	};
	
	this.startMainActivity = function(callback) {
		if (this.status != Application.status.STARTED) {
			Logger.error("The application <" + this.id + "> isn't started");
		} else if (!this.appDefinition.main) {
			Logger.log("The application <" + this.id + "> not have a main activity");
		} else {
			webActivities.startActivity(this.appDefinition.main, this.id, null, webActivities.startMode.ROOT);
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

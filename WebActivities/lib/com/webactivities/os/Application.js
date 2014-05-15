
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
	
	
	
	this.businessCard = function() {
		var icon = "<img src=\"" + appDefinition.icon + "\" style=\"max-width: 32px; vertical-align: middle\"><br />";
		var bc = "<strong>" + appDefinition.name + " (" + appDefinition.version + ")</strong><br />";
		var code = "<small>" + appDefinition.id + "</small><br />";
		var div = $("<div>").css("text-align", "center");
		div.append(icon);
		div.append(bc);
		div.append(code);
		return $("<div>").append(div).html();
	};

	Logger.log("Registered application " + appDefinition.name + " <" + appDefinition.id + ">");
	Logger.log(appDefinition);

	/*
	var self = this;
	if ($.isArray(appDefinition.activities)) {
		$.each(appDefinition.activities,function(i,activityDef) {
			var activity  = new Activity(webActivities,self,activityDef);
			self.activities.push(activity);
		});
	}
	*/
	
};

Application.status = {
	"REGISTERED": 0,
	"STARTING": 2,
	"STARTED": 4
};

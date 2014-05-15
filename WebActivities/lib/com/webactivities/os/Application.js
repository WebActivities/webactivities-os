
var Application = function(webActivities,appDefinition,appDefinitionUrl)  {
	
	$.extend(this,appDefinition);
	
	this.appDefinition = appDefinition;
	this.id = appDefinition.id;
	this.activities = [];
	
	this.status = webActivities.status.REGISTERED;
	
	this.path = webActivities.dirname(appDefinitionUrl);
	
	this.icon = webActivities.resolveUrl(this, appDefinition.icon);
	appDefinition.icon = this.icon;
	
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

	var self = this;
	if ($.isArray(appDefinition.activities)) {
		$.each(appDefinition.activities,function(i,activityDef) {
			var activity  = new Activity(webActivities,self,activityDef);
			self.activities.push(activity);
		});
	}
	
};
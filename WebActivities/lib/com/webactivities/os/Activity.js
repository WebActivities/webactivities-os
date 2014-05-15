
var Activity = function(webActivities,application,activityDef)  {
	
	
	$.extend(this,activityDef);
	
	this.application = application;
	this.activityDef = activityDef;
	
	this.id = webActivities.composeActivityId(application.id, activityDef.name);
	this.path = application.path;
	this.app = application.id;
	this.appName = application.name;
	this.icon = webActivities.resolveUrl(application, activityDef.icon);
	
	this.searchableIndex = [this.name,this.description];
	
	
	Logger.log("Registered activity <" + activityDef.id + "> ", activityDef);
	
};


Activity.status = {
	"CREATED": 0,
	"ACTIVE": 2,
	"PAUSED": 4,
	"STOPPED": 8
};
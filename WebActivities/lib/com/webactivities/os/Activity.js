
var Activity = function(webActivities,application,activityDef)  {
	
	
	//TODO
	
};

/**
 * Completa le informazioni presenti del manifest di una activity
 */
Activity.completeActivityDefinition = function(webActivities,application,activityDefinition) {
	activityDefinition.application = application;
	activityDefinition.id = webActivities.composeActivityId(application.id, activityDefinition.name);
	activityDefinition.path = application.path;
	activityDefinition.app = application.id;
	activityDefinition.appName = application.name;
	activityDefinition.icon = webActivities.resolveUrl(application, activityDefinition.icon);
	activityDefinition.searchableIndex = [activityDefinition.name,activityDefinition.description];
};


Activity.status = {
	"CREATED": 0,
	"ACTIVE": 2,
	"PAUSED": 4,
	"STOPPED": 8
};
var Activity = function(webActivities, application, activityDef, closeDefer, $q) {

	$.extend(this,activityDef);
	var self = this;
	
	this.instanceId = Utils.getUniqueKey();
	this.application = application;
	
	// Create a new context
	var createContext = function() {
		return new ActivityContext(webActivities,self,closeDefer,$q);
	};
	
	this.activityDef = activityDef;
	this.iframe = null;

	this.context = createContext(closeDefer);

	this.instance = null;
	this.status = null;

	this.start = function(parameters,startMode,startOptions) {
		return startMode(this, startOptions)
			.then(function() {
				self.status = Activity.status.CREATED;
				self.instance = new application.iframe[0].contentWindow.window[activityDef.activator](self.context, parameters);
				webActivities.broadcast('activityStarted',self);
			});
	};

};

/**
 * Completa le informazioni presenti del manifest di una activity
 */
Activity.completeActivityDefinition = function(webActivities, application,activityDefinition) {
	activityDefinition.application = application;
	activityDefinition.id = Utils.composeActivityId(application.id,activityDefinition.name);
	activityDefinition.path = application.path;
	activityDefinition.app = application.id;
	activityDefinition.appName = application.name;
	activityDefinition.icon = Utils.resolveUrl(application,activityDefinition.icon);
	activityDefinition.searchableIndex = [ activityDefinition.name,activityDefinition.description ];
};

Activity.status = {
	"CREATED" : 0,
	"ACTIVE" : 2,
	"PAUSED" : 4,
	"STOPPED" : 8
};
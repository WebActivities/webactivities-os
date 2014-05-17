var Activity = function(framework, application, activityDef, closeDefer, $q) {

	$.extend(this, activityDef);
	var self = this;

	this.instanceId = Utils.getUniqueKey("activity_");
	this.application = application;
	this.openMode = null;

	this.activityDef = activityDef;

	/**
	 * l'iframe dove viene visualizzata questa activity
	 */
	this.iframe = null;

	this.context = framework.createContext(self, closeDefer, $q);

	this.instance = null;
	this.status = null;

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

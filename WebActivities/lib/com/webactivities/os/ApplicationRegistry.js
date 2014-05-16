var ApplicationRegistry = function(framework) {

	var installedApplications = {};
	var activitiesDefinitions = {};

	this.getInstalledApplication = function() {
		return $.extend({}, installedApplication);
	};
	
	this.getActivitiesDefinitions = function() {
		return $.extend({}, activitiesDefinitions);
	};
	
	this.getActivitiesDefinition = function(activityId) {
		return $.extend({}, activitiesDefinitions[activityId]);
	};

	this.installApplication = function(appDefinitionUrl) {
		$.getJSON(appDefinitionUrl).done(function(appDefinition) {
			appDefinition.manifestUrl = appDefinitionUrl;
			var application = new Application(framework, appDefinition, framework.$q);
			$.each(application.activitiesDefinitions, function(i, activityDefinition) {
				activitiesDefinitions[activityDefinition.id] = activityDefinition;
			});
			installedApplications[application.id] = application;
			framework.uiCommunicator.broadcast('appInstalled', application);

			application.checkAutostartServices();

		}).fail(function(a, e) {
			Logger.error("Unable to register application <" + appDefinitionUrl + "> " + e);
		});
	};

	this.getApplication = function(appId) {
		var app = installedApplications[appId];
		if (app == null) {
			Logger.error("Application <" + appId + "> is not installed");
		}
		return app;
	};

};
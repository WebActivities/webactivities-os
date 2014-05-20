var ApplicationRegistry = function(framework) {

	var installedApplications = {};
	var activitiesDefinitions = {};
	
	var runningServicesInstances = {};
	

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
			framework.eventBus.broadcast('appInstalled', application);

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
	
	this.getService = function(serviceId) {
		return runningServicesInstances[serviceId];
	};

	this.registerStartedService = function(service) {
		var id = service.serviceDef.id;
		var s = this.getService(id);
		if (s!=null) {
			Logger.error("Service <" + id + "> is already registered, remember that services are singletons!");
			return;
		}
		runningServicesInstances[id] = service;
		Logger.log("Registered service <" + id + "> ", service);
	};
	
};
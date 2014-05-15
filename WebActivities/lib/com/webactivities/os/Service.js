var Service = function(webActivities, application, serviceDef, $q) {
	
	var self = this;
	
	this.instanceId = Utils.getUniqueKey("service_");
	this.serviceDef = serviceDef;
	
	this.create = function(parameters) {
		if (this.status!=null) {
			return $q.when();
		}
		this.status = Service.status.CREATED;
		this.instance = new application.iframe[0].contentWindow.window[serviceDef.activator](this.context, parameters);
		return webActivities.broadcast('serviceCreated',this);
	};
	
	this.start = function(parameters,startOptions) {
		if (this.status==null) {
			return this.create(parameters).then(function() {
				return self.start(startOptions);
			});
		}
		this.status = Service.status.STARTED;
		alert("starting service");
		return webActivities.broadcast('serviceStarted',this);
	};
	
};

/**
 * Completa le informazioni presenti del manifest di un service
 */
Service.completeServiceDefinition = function(webActivities, application, serviceDefinition) {
	serviceDefinition.application = application;
	serviceDefinition.id = Utils.composeServiceId(application.id,serviceDefinition.name);
	serviceDefinition.path = application.path;
	serviceDefinition.app = application.id;
	serviceDefinition.icon = Utils.resolveUrl(application,serviceDefinition.icon);
	serviceDefinition.searchableIndex = [ serviceDefinition.name,serviceDefinition.description ];
};

Service.status = {
	"CREATED" : 0,
	"STARTED" : 2,
	"STOPPED" : 4
};
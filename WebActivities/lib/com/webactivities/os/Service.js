var Service = function(framework, application, serviceDef, $q) {

	var self = this;

	this.instanceId = Utils.getUniqueKey("service_");
	this.serviceDef = serviceDef;
	this.application = application;
	this.context = new ServiceContext(framework, this, $q);

	this.create = function(parameters) {
		if (this.status != null) {
			return $q.when();
		}
		this.status = Service.status.CREATED;
		this.instance = new application.iframe[0].contentWindow.window[serviceDef.activator](this.context, parameters);
		return framework.eventBus.broadcast('serviceCreated', this);
	};

	this.start = function(parameters, startOptions) {
		if (this.status == null) {
			return this.create(parameters).then(function() {
				return self.start(parameters, startOptions);
			});
		}
		return $q.when(this.context.getStart()(startOptions)).then(function() {			
			self.status = Service.status.STARTED;
			return framework.eventBus.broadcast('serviceStarted',this);
		});
	};

};

/**
 * Completa le informazioni presenti del manifest di un service
 */
Service.completeServiceDefinition = function(webActivities, application, serviceDefinition) {
	serviceDefinition.application = application;
	serviceDefinition.id = Utils.composeServiceId(application.id, serviceDefinition.name);
	serviceDefinition.path = application.path;
	serviceDefinition.app = application.id;
	serviceDefinition.icon = Utils.resolveUrl(application, serviceDefinition.icon);
	serviceDefinition.searchableIndex = [ serviceDefinition.name, serviceDefinition.description ];
};

Service.status = {
	"CREATED" : 0,
	"STARTED" : 2,
	"STOPPED" : 4
}
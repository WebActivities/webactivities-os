var ServiceContext = function(framework, service, $q) {

	var _stop = function() {
		return true;
	};
	
	var _start = function() {
		return true;
	};

	this.bus = framework.bus.createBus(service.instanceId);

	this.onStart = function(fn) {
		_start = fn;
	};

	this.getStart = function() {
		return _start;
	};
	
	this.onStop = function(fn) {
		_stop = fn;
	};

	this.getStop = function() {
		return _stop;
	};
	
	this.stop = function() {
		alert("stop service to do..");
	};

	this.notify = function(type, message, options) {
		return framework.eventBus.notify(type, message, options);
	};
	
	this.framework = function() {
		return framework;
	};
	
	this.resolveUrl = function(path) {
		return Utils.resolveUrl(service.application, path);
	};
	
	this.newActivityIntent = function(app, activity, parameters) {
		var i = new Intent(IntentType.START_ACTIVITY, framework);
		i.activity = activity;
		i.parameters = parameters;
		i.app = app;
		return i;
	};

	this.newIntent = function(intentType, parameters) {
		var i = new Intent(intentType, framework);
		i.parameters = parameters;
		return i;
	};
	
	this.resolveUrl = function(path) {
		return Utils.resolveUrl(service.application,path);
	};
	
	this.toAbsoluteUrl = function(path) {
		return Utils.toAbsoluteUrl(service.application,path);
	};
	
	this.getService = function(appId, serviceName) {
		var s = framework.getService(Utils.composeServiceId(appId,serviceName));
		return s?s.instance:null;
	};
};

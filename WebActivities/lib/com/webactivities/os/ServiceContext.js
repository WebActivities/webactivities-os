var ServiceContext = function(webActivities, service, $q) {

	var _stop = function() {
		return true;
	};
	
	var _start = function() {
		return true;
	};

	this.bus = webActivities.bus.createBus();
	this.workbenchDocument = window.document;

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
		return webActivities.notify(type, message, options);
	};
	
	this.broadcast = function(type, parameters) {
		return webActivities.broadcast(type, parameters);
	};
	
	this.resolveUrl = function(path) {
		return Utils.resolveUrl(service.application,path);
	};

};

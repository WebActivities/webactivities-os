var ServiceContext = function(framework, service, $q) {

	var _stop = function() {
		return true;
	};
	
	var _start = function() {
		return true;
	};

	this.bus = framework.bus.createBus();

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
		return framework.uiCommunicator.notify(type, message, options);
	};

	this.broadcast = function(type, parameters) {
		return framework.uiCommunicator.broadcast(type, parameters);
	};
	
	this.resolveUrl = function(path) {
		return Utils.resolveUrl(service.application, path);
	};
	
};

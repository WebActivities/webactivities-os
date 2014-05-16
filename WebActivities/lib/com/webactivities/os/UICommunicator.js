/**
 * Manage the communication throw framework and UI
 */
var UICommunicator = function(framework) {

	var listeners = {};

	this.broadcast = function(type, parameters) {
		var promises = [];
		for ( var e in listeners[type]) {
			try {
				promises.push(listeners[type][e](type, parameters));
			} catch (ex) {
				Logger.error(ex);
			}
		}
		return framework.$q.all(promises);
	};

	this.on = function(l, fn) {
		if (!$.isArray(listeners[l])) {
			listeners[l] = [];
		}
		listeners[l].push(fn);
	};

};
/**
 * UICommunicator
 * 
 * @class UICommunicator
 * @constructor
 */
var UICommunicator = function($q) {

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
		return $q.all(promises);
	};

	this.on = function(l, fn) {
		if (!$.isArray(listeners[l])) {
			listeners[l] = [];
		}
		listeners[l].push(fn);
	};

};
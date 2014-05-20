var NotifyManager = function(framework) {

	var notifies = [];

	this.listNotifies = function() {
		return notifies.slice();
	};

	this.removeNotify = function(index) {
		notifies.splice(index, 1);
	};

	this.notify = function(type, message, options) {
		notifies.push({
			type : type,
			message : message,
			options : options
		});
		return framework.eventBus.broadcast("showNotify", {
			type : type,
			message : message,
			options : options
		});
	};

};
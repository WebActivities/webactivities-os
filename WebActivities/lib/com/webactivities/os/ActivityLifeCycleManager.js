var ActivityStarter = function(framework) {

	this.startMode = {};
	
	this.startMode.CHILD = function(activity, options) {
		var d = framework.$q.defer();
		framework.$q.when(framework.pauseActivity({
			mode : 'hidden'
		})).then(function() {
			framework.activityStack.push(activity);
			d.resolve();
		});
		return d.promise;
	};

	this.startMode.CHILD_POPUP = function(activity, options) {
		var d = framework.$q.defer();
		framework.$q.when(framework.pauseActivity({
			mode : 'visible'
		})).then(function() {
			framework.pushLayer(options).then(function() {
				activity.openMode = 'CHILD_POPUP';
				framework.activityStack.push(activity);
				d.resolve();
			});
		});
		return d.promise;
	};

	this.startMode.ROOT = function(activity, options) {
		var d = framework.$q.defer();
		framework.$q.when(framework.stopAllActivities()).then(function() {
			framework.activityStack.push(activity);
			d.resolve();
		});
		return d.promise;
	};

	this.startMode.UNKNOWN = function(activity) {
		var d = framework.$q.defer();
		alert('Start mode unknown');
		return d.promise;
	};

	this.startMode.VOID = function() {
		var d = framework.$q.defer();
		d.resolve();
		return d.promise;
	};

	this.resolveStartMode = function(mode) {
		for ( var i in this.startMode) {
			if (i == mode) {
				return this.startMode[i];
			}
		}
		return this.startMode.UNKNOWN;
	};

};

/*
var ActivityResumer = function(framework) {

	this.resume = function(activity, options) {
		var d = framework.$q.defer();
		var context = activity.context;
		
		var promises = [ context.getResume()() ];

		for (var i in activity.fragments) {
			promises.push(activity.fragments[i].resume());
		}
		
		framework.$q.when(promises).then(function() {
			framework.uiCommunicator.broadcast('displayActivity', {
				view : activity.iframe,
				activity : activity,
				disableEffects : options.disableEffects
			}).then(function() {
				d.resolve();
			});
		});
		return d.promise;
	};
};
*/



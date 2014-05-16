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

var ActivityPauser = function(framework) {

	this.pause = function(activity, options) {
		var d = framework.$q.defer();
		var context = activity.context;
		framework.$q.when(context.getPause()()).then(function() {
			if (options.mode == 'hidden') {
				framework.uiCommunicator.broadcast('hideActivity', {
					view : activity.iframe,
					activity : activity.activity
				}).then(function() {
					d.resolve();
				});
			} else if (options.mode == 'visible') {
				d.resolve();
			}
		});
		return d.promise;
	};
};

var ActivityResumer = function(framework) {

	this.resume = function(activity, options) {
		var d = framework.$q.defer();
		var context = activity.context;
		framework.$q.when(context.getResume()()).then(function() {
			framework.uiCommunicator.broadcast('displayActivity', {
				view : activity.iframe,
				activity : activity.activity,
				disableEffects : options.disableEffects
			}).then(function() {
				d.resolve();
			});
		});
		return d.promise;
	};
};

var ActivityStopper = function(framework) {

	this.stop = function(activity) {
		var context = activity.context;
		var d = framework.$q.defer();
		framework.$q.when(context.getStop()()).then(function() {
			framework.activityStack.pop();
			context.bus.destroy();
			framework.uiCommunicator.broadcast('destroyActivity', {
				view : activity.iframe,
				activity : activity.activity
			}).then(function() {
				var q = null;
				var disableEffects = false;
				if (activity.openMode == 'CHILD_POPUP') {
					q = framework.popLayer();
					disableEffects = true;
				}
				framework.$q.when(q).then(function() {
					framework.$q.when(framework.resumeActivity({
						disableEffects : disableEffects
					})).then(function() {
						activity.context.getCloseDefer().resolve(activity.context.getResult());
						d.resolve();
					});
				});

			});

		});
		return d.promise;
	};
};
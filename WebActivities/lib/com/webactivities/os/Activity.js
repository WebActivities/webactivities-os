var Activity = function(framework, application, activityDef, closeDefer, $q) {

	$.extend(this, activityDef);
	var self = this;

	this.instanceId = Utils.getUniqueKey("activity_");
	this.application = application;
	this.openMode = null;

	// Create a new context
	var createContext = function(closeDefer) {
		return new ActivityContext(framework, self, closeDefer, $q);
	};

	this.activityDef = activityDef;
	this.iframe = null;

	this.context = createContext(closeDefer);

	this.instance = null;
	this.status = null;

	this.start = function(parameters, startMode, startOptions) {
		return startMode(this, startOptions).then(function() {
			self.status = Activity.status.CREATED;
			self.instance = new application.iframe[0].contentWindow.window[activityDef.activator](self.context, parameters);
			framework.uiCommunicator.broadcast('activityStarted', self);
		});
	};

	this.stop = function() {
		var context = this.context;
		var d = framework.$q.defer();
		framework.$q.when(context.getStop()()).then(function() {
			self.status = Activity.status.STOPPED;
			framework.activityStack.pop();
			context.bus.destroy();
			framework.uiCommunicator.broadcast('destroyActivity', {
				view : self.iframe,
				activity : self.activity
			}).then(function() {
				var q = null;
				var disableEffects = false;
				if (self.openMode == 'CHILD_POPUP') {
					q = framework.popLayer();
					disableEffects = true;
				}
				framework.$q.when(q).then(function() {
					framework.$q.when(framework.resumeActivity({
						disableEffects : disableEffects
					})).then(function() {
						self.context.getCloseDefer().resolve(self.context.getResult());
						d.resolve();
					});
				});

			});

		});
		return d.promise;
	};

	this.pause = function(options) {
		var d = framework.$q.defer();
		var context = this.context;
		var self = this;
		$q.when(context.getPause()()).then(function() {
			self.status = Activity.status.PAUSED;
			if (options.mode == 'hidden') {
				framework.uiCommunicator.broadcast('hideActivity', {
					view : self.iframe,
					activity : self.activity
				}).then(function() {
					d.resolve();
				});
			} else if (options.mode == 'visible') {
				d.resolve();
			}
		});
		return d.promise;
	};

	this.resume = function(options) {
		var d = framework.$q.defer();
		var context = this.context;
		var self = this;
		$q.when(context.getResume()()).then(function() {
			self.status = Activity.status.ACTIVE;
			framework.uiCommunicator.broadcast('displayActivity', {
				view : self.iframe,
				activity : self.activity,
				disableEffects : options.disableEffects
			}).then(function() {
				d.resolve();
			});
		});
		return d.promise;
	};

};

/**
 * Completa le informazioni presenti del manifest di una activity
 */
Activity.completeActivityDefinition = function(webActivities, application, activityDefinition) {
	activityDefinition.application = application;
	activityDefinition.id = Utils.composeActivityId(application.id, activityDefinition.name);
	activityDefinition.path = application.path;
	activityDefinition.app = application.id;
	activityDefinition.appName = application.name;
	activityDefinition.icon = Utils.resolveUrl(application, activityDefinition.icon);
	activityDefinition.searchableIndex = [ activityDefinition.name, activityDefinition.description ];
};

Activity.status = {
	"CREATED" : 0,
	"ACTIVE" : 2,
	"PAUSED" : 4,
	"STOPPED" : 8
};

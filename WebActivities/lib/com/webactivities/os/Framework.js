var Framework = function($q) {

	this.$q = $q;

	this.uiCommunicator = new UICommunicator($q);

	this.applicationRegistry = new ApplicationRegistry(this);

	this.activityStack = new Stack();

	this.notifyManager = new NotifyManager(this);

	this.activityStarter = new ActivityStarter(this);
	
	this.bus = new Bus();
	
	this.currentTheme = {
		label: 'yeti',
		link: "css/yeti.bootstrap.min.css"
	};
	
	var _internalBus = this.bus.createBus("Framework");
	
	/**
	 * Ritorna il componentBus interno usato dal framework per pubblicare e sottoscrivere topic
	 * @method toJSON
	 * @return {ComponentBus} 
	 */
	this.internalBus = function() {
		return _internalBus;
	};

	this.createContext = function(activity, closeDefer, $q) {
		return new ActivityContext(this, activity, closeDefer, $q);
	};
	
	this.getCurrentActivity = function() {
		return this.activityStack.peek();
	};

	this.getActivityStack = function() {
		return this.activityStack.getAll();
	};

	this.startApplication = function(appId, preventStartActivity) {
		return this.applicationRegistry.getApplication(appId).startApplication(preventStartActivity);
	};

	this.startActivity = function(activityName, appId, parameters, startMode, startOptions, closeDefer) {
		return this.applicationRegistry.getApplication(appId).startApplication(true).then(function(application) {
			return application.startActivity(activityName, parameters, startMode, startOptions, closeDefer);
		});
	};

	this.startService = function(serviceName, appId, parameters, startOptions) {
		return this.applicationRegistry.getApplication(appId).startApplication(true).then(function(application) {
			return application.startService(serviceName, parameters, startOptions);
		});
	};

	this.pushLayer = function(options) {
		return this.uiCommunicator.broadcast("pushLayer", options || {});
	};

	this.popLayer = function() {
		return this.uiCommunicator.broadcast("popLayer", {});
	};

	this.stopAllPopupActivities = function() {
		var d = $q.defer();
		var stop = function(self) {
			var item = self.activityStack.peek();
			$q.when(self.stopActivity()).then(function() {
				if (self.activityStack.getCount() > 0 && item.openMode != 'CHILD_POPUP') {
					stop();
				} else {
					d.resolve();
				}
			});
		};
		stop(this);
		return d.promise;
	};

	this.stopAllActivities = function() {
		var d = this.$q.defer();
		var stop = function(self) {
			$q.when(self.stopActivity()).then(function() {
				if (self.activityStack.getCount() > 0) {
					stop(self);
				} else {
					d.resolve();
				}
			});
		};
		stop(this);
		return d.promise;
	};

	this.stopActivity = function() {
		var activity = this.activityStack.peek();
		if (activity == null) {
			return true;
		} else {
			return activity.stop();
		}
	};

	this.pauseActivity = function(options) {
		var activity = this.activityStack.peek();
		if (activity == null) {
			return true;
		} else {
			return activity.pause(options);
		}
	};

	this.resumeActivity = function(options) {
		var activity = this.activityStack.peek();
		if (activity == null) {
			return true;
		} else {
			return activity.resume(options);
		}
	};

	this.selectActivityForIntent = function(intent) {
		var matchings = [];
		var self = this;
		$.each(this.applicationRegistry.getActivitiesDefinitions(), function(i, a) {
			if ($.isArray(a.intentFilters)) {
				$.each(a.intentFilters, function(x, f) {
					if (f == intent.intentType) {
						matchings.push(a);
						return false;
					}
				});
			}
		});

		if (matchings.length == 1) {
			return $q.when(matchings[0]);
		}
		if (matchings.length > 0) {
			return self.uiCommunicator.broadcast("makeUserSelectOneActivity", {
				activities : matchings
			}).then(function(results) {
				return results[0];
			});
		}
		return $q.reject();
	};

	this.executeIntent = function(intent, startOptions) {
		var q = this.$q.defer();
		var self = this;
		if (intent.intentType == IntentType.START_ACTIVITY) {
			if (intent.app && intent.activity) {
				self.startActivity(intent.activity, intent.app, intent.parameters, self.activityStarter.resolveStartMode(intent.startMode), startOptions, q);
			}
		} else {
			if (intent.intentType) {
				this.selectActivityForIntent(intent).then(function(act) {
					self.startActivity(act.name, act.app, intent.parameters, self.activityStarter.resolveStartMode(intent.startMode), startOptions, q);
				});
			}
		}
		return q.promise;
	};
	
	this.getCurrentTheme = function() {
		return this.currentTheme;
	};
	
	this.setCurrentTheme = function(newTheme) {
		this.currentTheme = newTheme;
		this.uiCommunicator.broadcast("themeChanged", this.currentTheme);
		this.activityStack.forEach(function(activity) {
			activity.setCurrentTheme(newTheme);
		});
		return this.currentTheme;
	};

};
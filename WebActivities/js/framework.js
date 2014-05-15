'use strict';

/* Services */
angular.module('webActivitiesApp.framework', [])

.factory("framework", [ '$q', function($q) {
	/**
	 * WebActivities global instance
	 */
	var webActivities = {};

	/*
	 * ======================================================================
	 * Internal methods
	 * ======================================================================
	 */
	
	var resolveStartMode = function(mode) {
		for ( var i in webActivities.startMode) {
			if (i == mode) {
				return webActivities.startMode[i];
			}
		}
		return webActivities.startMode.UNKNOWN;
	};


	/*
	 * ======================================================================
	 * Internal variables
	 * ======================================================================
	 */
	var installedApplications = {};
	var activitiesDefinitions = {};
	
	var activityStack = new Stack();
	var listeners = {};
	var notifies = [];

	/*
	 * ======================================================================
	 * Public methods
	 * ======================================================================
	 */


	webActivities.bus = new Bus();
	
	webActivities.pushLayer = function(options) {
		return webActivities.broadcast("pushLayer", options || {});
	};

	webActivities.popLayer = function() {
		return webActivities.broadcast("popLayer", {});
	};

	webActivities.currentStack = function() {
		return activityStack;
	};

	webActivities.startMode = {};
	webActivities.startMode.CHILD = function(stackItem, options) {
		var d = $q.defer();
		$q.when(webActivities.pauseActivity({
			mode : 'hidden'
		})).then(function() {
			webActivities.currentStack().push(stackItem);
			d.resolve();
		});
		return d.promise;
	};
	webActivities.startMode.CHILD_POPUP = function(stackItem, options) {
		var d = $q.defer();
		$q.when(webActivities.pauseActivity({
			mode : 'visible'
		})).then(function() {
			webActivities.pushLayer(options).then(function() {
				stackItem.openMode = 'CHILD_POPUP';
				webActivities.currentStack().push(stackItem);
				d.resolve();
			});
		});
		return d.promise;
	};
	webActivities.startMode.ROOT = function(stackItem, options) {
		var d = $q.defer();
		$q.when(webActivities.stopAllActivities()).then(function() {
			webActivities.currentStack().push(stackItem);
			d.resolve();
		});
		return d.promise;
	};
	webActivities.startMode.UNKNOWN = function(stackItem) {
		var d = $q.defer();
		alert('Start mode unknown');
		return d.promise;
	};
	
	webActivities.listApps = function() {
		return $.extend({}, installedApplications);
	};

	webActivities.listNotifies = function() {
		return notifies.slice();
	};

	webActivities.removeNotify = function(index) {
		notifies.splice(index, 1);
	};

	webActivities.broadcast = function(type, parameters) {
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

	webActivities.on = function(l, fn) {
		if (!$.isArray(listeners[l])) {
			listeners[l] = [];
		}
		listeners[l].push(fn);
	};

	webActivities.notify = function(type, message, options) {
		notifies.push({
			type : type,
			message : message,
			options : options
		});
		return webActivities.broadcast("showNotify", {
			type : type,
			message : message,
			options : options
		});
	};

	webActivities.installApp = function(appDefinitionUrl) {
		
		$.getJSON(appDefinitionUrl).done(function(appDefinition) {
			
			appDefinition.manifestUrl = appDefinitionUrl;
			var application = new Application(webActivities,appDefinition,$q);
			
			$.each(application.activitiesDefinitions,function(i,activityDefinition) {
				activitiesDefinitions[activityDefinition.id] = activityDefinition;
			});
			
			installedApplications[application.id] = application;
			webActivities.broadcast('appInstalled',application);

			application.checkAutostartServices();
			
		}).fail(function(a, e) {
			Logger.error("Unable to register application <" + appDefinitionUrl + "> " + e);
		});
	};

	webActivities.getCurrentActivity = function() {
		return webActivities.currentStack().peek();
	};

	webActivities.getActivityStack = function() {
		return webActivities.currentStack().getAll();
	};

	webActivities.pauseActivity = function(options) {
		var d = $q.defer();
		var item = webActivities.currentStack().peek();
		if (item == null) {
			d.resolve();
		} else {
			var context = item.context;
			$q.when(context.getPause()()).then(function() {
				item.status = Activity.status.PAUSED;
				if (options.mode == 'hidden') {
					webActivities.broadcast('hideActivity', {
						view : item.iframe,
						activity : item.activity
					}).then(function() {
						d.resolve();
					});
				} else if (options.mode == 'visible') {
					d.resolve();
				}
				;
			});
		}
		return d.promise;
	};

	webActivities.resumeActivity = function(previousStackItem, disableEffects) {
		var d = $q.defer();
		var item = webActivities.currentStack().peek();
		if (item == null) {
			d.resolve();
		} else {
			var context = item.context;
			$q.when(context.getResume()()).then(function() {
				item.status = Activity.status.ACTIVE;
				webActivities.broadcast('displayActivity', {
					view : item.iframe,
					activity : item.activity,
					disableEffects : disableEffects
				}).then(function() {
					d.resolve();
				});
			});
		}
		return d.promise;
	};

	webActivities.stopActivity = function() {
		var d = $q.defer();
		var item = webActivities.currentStack().peek();
		if (item == null) {
			d.resolve();
		} else {
			var context = item.context;
			$q.when(context.getStop()()).then(function() {
				var item = webActivities.currentStack().pop();
				item.status = Activity.status.STOPPED;
				item.context.bus.destroy();
				webActivities.broadcast('destroyActivity', {
					view : item.iframe,
					activity : item.activity
				}).then(function() {
					var q = null;
					var disableEffects = false;
					if (item.openMode == 'CHILD_POPUP') {
						q = webActivities.popLayer();
						disableEffects = true;
					}
					$q.when(q).then(function() {
						$q.when(webActivities.resumeActivity(item, disableEffects)).then(function() {
							item.context.getCloseDefer().resolve(item.context.getResult());
							d.resolve();
						});
					});

				});

			});
		}
		return d.promise;
	};

	webActivities.stopAllPopupActivities = function() {
		var d = $q.defer();
		var stop = function() {
			var item = webActivities.currentStack().peek();
			$q.when(webActivities.stopActivity()).then(function() {
				if (webActivities.currentStack().getCount() > 0 && item.openMode != 'CHILD_POPUP') {
					stop();
				} else {
					d.resolve();
				}
			});
		};
		stop();
		return d.promise;
	};

	webActivities.stopAllActivities = function() {
		var d = $q.defer();
		var stop = function() {
			$q.when(webActivities.stopActivity()).then(function() {
				if (webActivities.currentStack().getCount() > 0) {
					stop();
				} else {
					d.resolve();
				}
			});
		};
		stop();
		return d.promise;
	};

	webActivities.selectActivityForIntent = function(intent) {
		var matchings = [];
		$.each(activitiesDefinitions, function(i, a) {
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
			return webActivities.broadcast("makeUserSelectOneActivity", {
				activities : matchings
			}).then(function(results) {
				return results[0];
			});
		}
		return $q.reject();
	};

	var getApplication = function(appId) {
		var app = installedApplications[appId];
		if (app == null) {
			Logger.error("Application <" + appId + "> is not installed");
		} 
		return app;
	};
	
	webActivities.startApp = function(appId, preventStartActivity) {
		return getApplication(appId).startApplication(preventStartActivity);
	};
	
	webActivities.startActivity = function(activityName, appId, parameters, startMode, startOptions, closeDefer) {

		return getApplication(appId)
			.startApplication(true)
			.then(function(application) {
				return application.startActivity(activityName, parameters, startMode, startOptions, closeDefer);
			});
		
	};
	
	webActivities.startService = function(serviceName, appId, parameters, startOptions) {

		return getApplication(appId)
			.startApplication(true)
			.then(function(application) {
				return application.startService(serviceName, parameters, startOptions);
			});
		
	};
	
	webActivities.executeIntent = function(intent,startOptions) {
		var q = $q.defer();
		if (intent.intentType == IntentType.START_ACTIVITY) {
			if (intent.app && intent.activity) {
				webActivities.startActivity(intent.activity, intent.app,
						intent.parameters, resolveStartMode(intent.startMode),
						startOptions, q);
			}
		} else {
			if (intent.intentType) {
				webActivities.selectActivityForIntent(intent).then(
						function(act) {
							webActivities.startActivity(act.id, act.app,
									intent.parameters,
									resolveStartMode(intent.startMode), startOptions,
									q);
						});
			}
		}
		return q.promise;
	};

	return webActivities;
} ])

//
;


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

	var resolveUrl = function(app, path) {
		path = path.replace("%v", app.version);
		path = path.replace("%d", new Date().getTime());
		var src = path.indexOf("http") == 0 ? path : app.path + (path.indexOf("/") == 0 ? path : "/" + path);
		return src;
	};
	var composeActivityId = function(appId, activityId) {
		return appId + "@" + activityId;
	};
	var dirname = function(path) {
		return path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
	};
	var resolveStartMode = function(mode) {
		for ( var i in webActivities.startMode) {
			if (i == mode) {
				return webActivities.startMode[i];
			}
		}
		return webActivities.startMode.UNKNOWN;
	};

	// Create a new context
	var createContext = function(stackItem, _closeDefer) {
		return new ActivityContext(webActivities,stackItem,_closeDefer,$q);
	};

	/*
	 * ======================================================================
	 * Internal variables
	 * ======================================================================
	 */
	var apps = {};
	var activities = {};
	var activityStack = new Stack();
	var listeners = {};
	var notifies = [];

	/*
	 * ======================================================================
	 * Public methods
	 * ======================================================================
	 */
	webActivities.status = {};
	webActivities.status.REGISTERED = 0;
	webActivities.status.STARTING = 2;
	webActivities.status.STARTED = 4;

	webActivities.activity = {};
	webActivities.activity.status = {};
	webActivities.activity.status.CREATED = 0;
	webActivities.activity.status.ACTIVE = 2;
	webActivities.activity.status.PAUSED = 4;
	webActivities.activity.status.STOPPED = 8;

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

	/*spostare su utils*/
	webActivities.resolveUrl = resolveUrl;
	webActivities.dirname = dirname;
	webActivities.composeActivityId = composeActivityId;
	/* */
	
	webActivities.listApps = function() {
		return $.extend({}, apps);
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

	webActivities.sendMessage = function(source, msg) {
		var items = webActivities.currentStack().getAll();
		var i = 0;
		for (i in items) {
			var item = items[i];
			var ls = item.context.getMessageListeners();
			var l = 0;
			for (l in ls) {
				if ($.isFunction(ls[l])) {
					ls[l](source, msg);
				}
			}
		}
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
			
			var application = new Application(webActivities,appDefinition,appDefinitionUrl);
			$.each(application.activities,function(i,activity) {
				activities[activity.id] = activity;
			});
			
			apps[application.id] = application;
			webActivities.broadcast('appInstalled',application);

		}).fail(function(a, e) {
			Logger.error("Unable to register application <" + appPath + "/app.json>: " + e);
		});
	};

	webActivities.startApp = function(appId, preventStartActivity, callback) {
		var app = apps[appId];
		if (!app) {
			Logger.error("The application <" + appId + "> doesn't exists");
		} else if (app.status == webActivities.status.REGISTERED) {
			webActivities.broadcast('appStarting',app);
			app.status = webActivities.status.STARTING;
			var resourcesIncluded = "";
			if ($.isArray(app.resources)) {
				$.each(app.resources, function(index, value) {
					resourcesIncluded += "<script src='" + resolveUrl(app, value) + "' type='application/javascript'><\/script>";
				});
			}
			var iframe = $('<iframe />', {
				style : "border: 0; width: 0; height: 0"
			}).appendTo($("#app-class-loader"));
			var doc = iframe[0].contentWindow.window.document;
			doc.open();
			doc.write("<script type=\"text/javascript\">var top = null; var opener = null; var parent = null; window.opener = null; window.parent = null;</script>" + resourcesIncluded);
			doc.close();

			app.iframe = iframe;
			iframe.load(function() {
				app.status = webActivities.status.STARTED;
				webActivities.broadcast('appStarted', $.extend({}, app));
				if (!preventStartActivity) {
					webActivities.startMainActivity(appId);
				}
				if (callback) {
					callback(app);
				}
			});
		} else if (app.status == webActivities.status.STARTING) {
			// do nothing... wait for start
		} else if (app.status == webActivities.status.STARTED) {
			if (!preventStartActivity) {
				webActivities.startMainActivity(appId);
			}
		}
	};

	webActivities.startMainActivity = function(appId) {
		var app = apps[appId];
		if (!app) {
			Logger.error("The application <" + appId + "> doesn't exists");
		} else if (app.status != webActivities.status.STARTED) {
			Logger.error("The application <" + appId + "> isn't started");
		} else if (!app.main) {
			Logger.log("The application <" + appId + "> not have a main activity");
		} else {
			webActivities.startActivity(app.main, appId, null, webActivities.startMode.ROOT);
		}
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
				item.status = webActivities.activity.status.PAUSED;
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
				item.status = webActivities.activity.status.ACTIVE;
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
				item.status = webActivities.activity.status.STOPPED;
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
		$.each(activities, function(i, a) {
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

	webActivities.startActivity = function(activityId, appId, parameters, startMode, startOptions, closeDefer) {

		if (closeDefer == null) {
			closeDefer = $q.defer();
		}

		var activity = activities[composeActivityId(appId, activityId)];

		if (activity == null) {
			Logger.error("Activity <" + activityId + "> in app <" + appId + "> not found");
		} else {
			var app = apps[activity.app];
			if (app == null) {
				Logger.error("Application <" + activity.app + "> is not installed");
			} else if (app.status == webActivities.status.REGISTERED) {
				webActivities.startApp(activity.app, true, function(app) {
					webActivities.startActivity(activityId, appId, parameters, startMode, startOptions, closeDefer);
				});
			} else {

				var stackItem = {
					activity : activity,
					iframe : null,
					context : null,
					instance : null,
					status : null
				};

				webActivities.broadcast('activityStarting', $.extend({}, activity));
				stackItem.context = createContext(stackItem, closeDefer);

				startMode(stackItem, startOptions).then(function(activity, stackItem) {
					return function() {
						// Run the app
						stackItem.status = webActivities.activity.status.CREATED;
						stackItem.instance = new app.iframe[0].contentWindow.window[activity.activator](stackItem.context, parameters);
						webActivities.broadcast('activityStarted', $.extend({}, activity));
					};
				}(activity, stackItem));
			}

		}
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


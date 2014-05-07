'use strict';

/* Services */
angular.module('webActivitiesApp.framework', [])

.factory("framework", [ '$rootScope', '$q', function($rootScope, $q) {
	/**
	 * WebActivities global instance
	 */
	var webActivities = {};

	/*
	 * ======================================================================
	 * Internal methods
	 * ======================================================================
	 */
	var log = function(log) {
		if (window.console) {
			console.log(log);
		}
	};
	var error = function(error) {
		if (window.console) {
			console.error(error);
		}
	};
	var resolveUrl = function(app, path) {
		path = path.replace("%v", app.version);
		path = path.replace("%d", new Date().getTime());
		var src = path.indexOf("http") == 0 ? path : app.path + (path.indexOf("/") == 0 ? path : "/" + path);
		return src;
	};
	var dirname = function(path) {
		return path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
	};
	var isSameActivity = function(a, b) {
		return a.id == b.id && a.app == b.app;
	};
	var Stack = function() {
		this.top = null;
		this.count = 0;

		this.getCount = function() {
			return this.count;
		};

		this.getTop = function() {
			return this.top;
		};

		this.push = function(data) {
			var node = {
				data : data,
				next : null
			};

			node.next = this.top;
			this.top = node;

			this.count++;
		};

		this.peek = function() {
			if (this.top === null) {
				return null;
			} else {
				return this.top.data;
			}
		};

		this.pop = function() {
			if (this.top === null) {
				return null;
			} else {
				var out = this.top;
				this.top = this.top.next;
				if (this.count > 0) {
					this.count--;
				}

				return out.data;
			}
		};

		this.getAll = function() {
			if (this.top === null) {
				return null;
			} else {
				var arr = new Array();

				var current = this.top;
				// console.log(current);
				for (var i = 0; i < this.count; i++) {
					arr[i] = current.data;
					current = current.next;
				}

				return arr;
			}
		};
	};

	/*
	 * ======================================================================
	 * Internal variables
	 * ======================================================================
	 */
	var apps = {};
	var activities = {};
	var runningActivity = null;
	var activityStack = new Stack();

	/*
	 * ======================================================================
	 * Public methods
	 * ======================================================================
	 */
	webActivities.status = {};
	webActivities.status.REGISTERED = 0;
	webActivities.status.STARTING = 2;
	webActivities.status.STARTED = 4;

	webActivities.startMode = {};
	webActivities.startMode.CHILD = function(stackItem) {
		var d = $q.defer();
		$q.when(webActivities.pauseActivity()).then(function() {
			activityStack.push(stackItem);
			d.resolve();
		});
		return d.promise;
	};
	webActivities.startMode.ROOT = function(stackItem) {
		var d = $q.defer();
		$q.when(webActivities.stopAllActivities()).then(function() {
			activityStack.push(stackItem);
			d.resolve();
		});
		return d.promise;
	};

	webActivities.listApps = function() {
		return $.extend({}, apps);
	};

	webActivities.installApp = function(appDefinition) {
		$.getJSON(appDefinition).done(function(app) {
			app.status = webActivities.status.REGISTERED;
			app.path = dirname(appDefinition);
			app.icon = resolveUrl(app, app.icon);
			if (!app.version) {
				app.version = "0.0.0";
			}
			app.businessCard = function() {
				var icon = "<img src=\"" + app.icon + "\" style=\"max-width: 32px; vertical-align: middle\"><br />";
				var bc = "<strong>" + this.name + " (" + this.version + ")</strong><br />";
				var code = "<small>" + this.id + "</small><br />";
				var div = $("<div>").css("text-align", "center");
				div.append(icon);
				div.append(bc);
				div.append(code);
				return $("<div>").append(div).html();
			};

			log("Registered application " + app.name + " <" + app.id + ">");
			log(app);

			apps[app.id] = app;

			var id = null;
			for (id in app.activities) {
				var activity = app.activities[id];
				activity.path = app.path;
				activity.app = app.id;
				activity.id = id;
				if (!$.isArray(activities[id])) {
					activities[id] = [];
				}
				activities[id].push(activity);
				log("Registered activity in application <" + app.id + ">: " + activity.name + " <" + id + ">");
			}
			$rootScope.$broadcast('appInstalled', $.extend({}, app));

		}).fail(function(a, e) {
			error("Unable to register application <" + appPath + "/app.json>: " + e);
		});
	};

	webActivities.startApp = function(appId, preventStartActivity, callback) {
		var app = apps[appId];
		if (!$.isPlainObject(app)) {
			error("The application <" + appId + "> doesn't exists");
		} else if (app.status == webActivities.status.REGISTERED) {
			$rootScope.$broadcast('appStarting', $.extend({}, app));
			app.status = webActivities.status.STARTING;
			var resourcesIncluded = "";
			if ($.isArray(app.resources)) {
				$.each(app.resources, function(index, value) {
					resourcesIncluded += "<script src='" + resolveUrl(app, value) + "' type='application/javascript'><\/script>";
				});
			}
			var iframe = $('<iframe />', {
				style : "border: 0; width: 0; height: 0",
				srcDoc : "<script type=\"text/javascript\">var top = null; var opener = null; var parent = null; window.opener = null; window.parent = null;</script>" + resourcesIncluded
			}).appendTo($("#app-class-loader"));

			app.iframe = iframe;
			iframe.load(function() {
				app.status = webActivities.status.STARTED;
				$rootScope.$broadcast('appStarted', $.extend({}, app));
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
		if (!$.isPlainObject(app)) {
			error("The application <" + appId + "> doesn't exists");
		} else if (app.status != webActivities.status.STARTED) {
			error("The application <" + appId + "> isn't started");
		} else if (!app.main) {
			log("The application <" + appId + "> not have a main activity");
		} else {
			webActivities.startActivity(app.main, appId, null, webActivities.startMode.ROOT);
		}
	};

	webActivities.getActivityStack = function() {
		return activityStack.getAll();
	};

	webActivities.pauseActivity = function() {
		var d = $q.defer();

		return d.promise;
	};

	webActivities.resumeActivity = function() {
		var d = $q.defer();
		var item = activityStack.peek();
		if (item == null) {
			d.resolve();
		} else {
			$q.when(context.getResume()()).then(function() {
				$rootScope.$broadcast('displayActivity', {
					view : item.iframe,
					activity : item.activity
				});
				d.resolve();
			});
		}
		return d.promise;
	};

	webActivities.stopActivity = function() {
		var d = $q.defer();
		var item = activityStack.peek();
		var context = item.context;
		$q.when(context.getStop()()).then(function() {
			var item = activityStack.pop();
			runningActivity = null;
			$rootScope.$broadcast('hideActivity', {
				view : item.iframe,
				activity : item.activity
			});
			$q.when(webActivities.resumeActivity()).then(function() {
				d.resolve();
			});
		});
		return d.promise;
	};

	webActivities.stopAllActivities = function() {
		return true;
	};

	webActivities.startActivity = function(activityId, appId, parameters, startMode) {
		log("Starting activity <" + activityId + ">");
		var acts = activities[activityId];
		var activity = null;
		var specific = appId != null;
		if ($.isArray(acts) && acts.length > 0) {
			if (specific) {
				$.each(acts, function(index, value) {
					if (value.app == appId) {
						activity = value;
					}
				});
			} else {
				if (acts.length > 1) {
					$rootScope.$broadcast('multipleActivityToStart', $.extend({}, acts));
				} else {
					activity = acts[0];
				}
			}
		}
		if (activity == null) {
			if ($.isArray(acts) && acts.length <= 1) {
				if (specific) {
					error("Activity <" + activityId + "> in app <" + appId + "> not found");
				} else {
					error("Activity <" + activityId + "> not found");
				}
			}
		} else {
			var app = apps[activity.app];
			if (app == null) {
				error("Application <" + activity.app + "> is not installed");
			} else if (app.status == webActivities.status.REGISTERED) {
				webActivities.startApp(activity.app, true, function(app) {
					webActivities.startActivity(activityId, appId, parameters, startMode);
				});
			} else if (runningActivity && isSameActivity(runningActivity, activity)) {
				log("Activity <" + activity.id + "> is still running");
			} else {

				var stackItem = {
					activity : activity,
					iframe : null,
					context : null,
					instance : null
				};

				// Create a new context
				var createContext = function(stackItem) {
					return function(webActivities) {
						var _stop = function() {
							return true;
						};
						var _resume = function() {
							return true;
						};
						var _pause = function() {
							return true;
						};
						var ctx = {
							onStop : function(fn) {
								_stop = fn;
							},
							getStop : function() {
								return _stop;
							},
							stop : function() {
								webActivities.stopActivity();
							},
							onResume : function(fn) {
								_resume = fn;
							},
							getResume : function() {
								return _resume;
							},
							onPause : function(fn) {
								_pause = fn;
							},
							getPause : function() {
								return _pause;
							},
							prepareView : function() {
								var viewDeferred = $q.defer();
								var iframe = $("<iframe class=\"full-size\" src=\"activity-viewport.html\" style=\"border: 0px; padding: 0px; margin: 0px; width: 100%;\"></iframe>")[0];
								stackItem.iframe = iframe;

								$rootScope.$broadcast('displayActivity', {
									view : iframe,
									activity : activity
								});

								$(iframe).load(function() {
									var viewport = $(iframe).contents().find("#internalViewport")[0];
									viewDeferred.resolve(viewport);
								});

								return viewDeferred.promise;
							}
						};
						return ctx;
					};
				}(stackItem);

				$rootScope.$broadcast('activityStarting', $.extend({}, activity));
				stackItem.context = createContext(webActivities);

				startMode(stackItem).then(function(activity, stackItem) {
					return function() {
						// Run the app
						stackItem.instance = new app.iframe[0].contentWindow.window[activity.activator](stackItem.context, parameters);
						runningActivity = activity;
						$rootScope.$broadcast('activityStarted', $.extend({}, activity));
					};
				}(activity, stackItem));

			}

		}
	};

	return webActivities;
} ])

//
;


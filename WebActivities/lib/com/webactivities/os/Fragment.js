var Fragment = function(framework, parentContext) {
	var self = this;

	var component = $("<div></div>", {
		style : "position: relative"
	});

	this.app = null;
	this.activity = null;
	this.parameter = null;
	this.context = null;
	this.activityInstance = null;
	this.inited = false;
	this.parentInited = false;

	parentContext.communicator.on("activityDisplayed", function() {
		self.parentInited = true;
	});

	this.getComponent = function() {
		return component;
	};

	this.start = function() {
		var self = this;
		if (!this.inited) {
			this.init();
			framework.applicationRegistry.getApplication(this.app).startApplication(true).then(function(application) {
				application.instantiateActivity(self.activity, self.parameter, self.context, self.context.getCloseDefer());
			});
		}
	};

	this.init = function() {
		var self = this;
		var app = framework.applicationRegistry.getApplication(this.app);
		var activityDef = framework.applicationRegistry.getActivitiesDefinition(Utils.composeActivityId(this.app, this.activity));
		var defer = framework.$q.defer();
		var $q = framework.$q;

		this.context = new ActivityContext(framework, null, defer, $q);

		this.context.broadcastDisplayView = function(iframe) {
			self.activityInstance.status = Activity.status.ACTIVE;
			$(iframe).css({
				position : "absolute",
				left : "0",
				top : "0",
				right : "0",
				bottom : "0",
				border : "0px none",
				width : "100%",
				height : "100%"
			});
			component.append(iframe);
			$(self.activityInstance.iframe).trigger("attached");
		};

		this.activityInstance = new Activity(framework, app, activityDef, defer, $q);
		this.activityInstance.context = this.context;
		this.context.activity = this.activityInstance;
		this.activityInstance.stop = function(activity) {
			self.inited = false;
			var context = self.activityInstance.context;
			var d = framework.$q.defer();
			framework.$q.when(context.getStop()()).then(function() {
				self.activityInstance.status = Activity.status.STOPPED;
				$(self.activityInstance.iframe).remove();
				d.resolve();
			});
			return d.promise;
		};
		this.activityInstance.pause = function(options) {
			var context = self.activityInstance.context;
			var d = framework.$q.defer();
			framework.$q.when(context.getPause()()).then(function() {
				self.activityInstance.status = Activity.status.PAUSED;
				d.resolve();
			});
			return d.promise;
		};
		this.activityInstance.resume = function(options) {
			var context = self.activityInstance.context;
			var d = framework.$q.defer();
			framework.$q.when(context.getResume()()).then(function() {
				self.activityInstance.status = Activity.status.ACTIVE;
				d.resolve();
			});
			return d.promise;
		};

		this.inited = true;
	};

	this.stop = function() {
		if (!this.activityInstance) {
			return true;
		}
		return this.activityInstance.stop();
	};

	this.pause = function() {
		if (!this.activityInstance) {
			return true;
		}
		return this.activityInstance.pause();
	};

	this.resume = function() {
		if (!this.activityInstance) {
			return true;
		}
		return this.activityInstance.resume();
	};

};
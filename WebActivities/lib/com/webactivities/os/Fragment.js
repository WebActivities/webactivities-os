var Fragment = function(framework, parentActivityInstance) {

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

		this.activityInstance = new Activity(framework, app, activityDef, defer, $q);
		this.context = new ActivityContext(framework, this.activityInstance, defer, $q);
		this.activityInstance.context = this.context;
		this.activityInstance.uiCommunicator = new UICommunicator($q);
		this.activityInstance.isFragment = true;

		this.activityInstance.uiCommunicator.on("displayActivity",function(event,o) {
			$(o.activity.iframe).css({
				position : "absolute",
				left : "0",
				top : "0",
				right : "0",
				bottom : "0",
				border : "0px none",
				width : "100%",
				height : "100%"
			})
			.appendTo(component)
			.trigger("attached");
		});
		
		this.activityInstance.uiCommunicator.on("destroyActivity",function(event,o) {
			self.inited = false;
			$(o.activity.iframe).remove();
		});
		
		this.activityInstance.uiCommunicator.on("pausedActivity",function(event,o) {
			//return framework.uiCommunicator.broadcast('pausedActivity',o);
		});
		
		this.activityInstance.uiCommunicator.on("resumedActivity",function(event,o) {
			//return framework.uiCommunicator.broadcast('pausedActivity',o);
		});

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
	
	this.setCurrentTheme = function(theme) {
		return this.activityInstance.setCurrentTheme(theme);
	};

};
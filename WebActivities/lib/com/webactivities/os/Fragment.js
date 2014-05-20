var Fragment = function(framework, parentActivityInstance) {

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

	this.getComponent = function() {
		return component;
	};

	this.loadView = function() {
		var defer = framework.$q.defer();
		component.load('partials/fragment.html',function() {
			console.log("loaded Fragment: ",this);
			angular.module('webActivitiesApp')
				.value("fragment",self);
			angular.bootstrap(this, ['webActivitiesApp']);
			defer.resolve(component);
		});
		return defer.promise;
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
		this.activityInstance.eventBus = new EventBus($q);
		this.activityInstance.isFragment = true;

		this.activityInstance.eventBus.on("activityStarted",function(event,o) {
			//return framework.eventBus.broadcast('pausedActivity',o);
		});
		
		this.activityInstance.eventBus.on("displayActivity",function(event,o) {
			return self.loadView().then(function() {				
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
				.appendTo(component.find('.fragmentViewport'))
				.trigger("attached");
			});
		});
		
		this.activityInstance.eventBus.on("destroyActivity",function(event,o) {
			self.inited = false;
			$(o.activity.iframe).remove();
			component.empty();
			var newComponent = component.clone();
			component.replaceWith(newComponent);
			component = newComponent;
		});
		
		this.activityInstance.eventBus.on("pausedActivity",function(event,o) {
			//return framework.eventBus.broadcast('pausedActivity',o);
		});
		
		this.activityInstance.eventBus.on("resumedActivity",function(event,o) {
			//return framework.eventBus.broadcast('pausedActivity',o);
		});

		this.inited = true;
	};

	this.start = function() {
		var self = this;
		if (!this.inited) {
			this.init();
			
			framework.applicationRegistry.getApplication(this.app).startApplication(true).then(function(application) {
				application.instantiateActivity(self.activity, self.parameter, self.context, self.context.getCloseDefer());
				
				var actInst = self.activityInstance;
				actInst.status = Activity.status.CREATED;
				actInst.eventBus.broadcast('activityStarted', actInst);
			});
		}
	};

	this.instantiate = function(context, parameters) {
		return new application.iframe[0].contentWindow.window[activityDef.activator](context, parameters);
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
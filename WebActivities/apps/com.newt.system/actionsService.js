var ActionsService = function(ctx) {
	
	
	ctx.onStart(function() {	
		
	});
	
	
	this.addPermanentAction = function(componentContext,action) {
		componentContext.bus.publish("com.newt.system.toolbar.actions",action);
	};
	
	this.removePermanentAction = function(componentContext,action) {
		componentContext.unpublish("com.newt.system.toolbar.actions",action);
	};
	
	this.addActivityAction = function(activityContext,action) {
		var ctx = activityContext;
		if (!ctx.actions) {
			ctx.actions = [];
		}
		ctx.actions.push(action);
		ctx.eventBus.broadcast("actionsChanged");
	};
	
	this.removeActivityAction = function(activityContext,action) {
		var ctx = activityContext;
		if (ctx.actions) {
			var index = ctx.actions.indexOf(action);
			if (index!=-1) {
				ctx.actions.splice(index,1);
				ctx.eventBus.broadcast("actionsChanged");
			}
		}
	};
	
};
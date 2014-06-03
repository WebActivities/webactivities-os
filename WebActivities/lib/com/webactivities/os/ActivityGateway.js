/**
 * Questo è il l'interfaccia con cui da dentro newt si comunica varso una activity di tipo
 * Sandboxed
 * 
 * @class ActivityGateway
 * @module Context
 * @constructor
 */
var ActivityGateway = function(framework, activity, _closeDefer, $q) {
	
	/**
	 * Contains an instance of ActivityBus. Permit the communication with other
	 * components of framework.
	 * 
	 * @property bus
	 * @type ActivityBus
	 * @example ctx.bus.publish("com.newt.system.toolbar.actions", {..options..}
	 *          });
	 */
	this.bus = framework.bus.createBus(activity.instanceId);
	
	
	/**
	 * Contains an instance of EventBus. Permit the firing of events outside this Activity.
	 * 
	 * @property eventBus
	 * @type EventBus
	 */
	this.eventBus = new EventBus($q);
	
	var _result = null;
	
	var activityChannel = new ActivityChannel(activity,$q);
	
	this.initChannel = function() {
		activityChannel.init();
	};
	
	activityChannel.on("stop",function(result) {
		if (result !== undefined) {
			_result = result;
		}
		framework.stopActivity();
	});
	
	
	this.callShow = function() {
		return activityChannel.sendAndReceive({
			commandName: "onShow"
		});
	};
	
	this.callStop = function() {
		return activityChannel.sendAndReceive({
			commandName: "onStop"
		});
	};
	
	this.resolveCloseDefer = function() {		
		//this.getCloseDefer().resolve(this.getResult());
		//TODO
	};
	
	
};

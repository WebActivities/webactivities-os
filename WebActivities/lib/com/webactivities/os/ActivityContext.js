/**
 * Provide the base Activity functionality. Permit the collaboration of activity
 * with newt framework.<br />
 * This object is the first argument of the activity constructor.
 * 
 * @class ActivityContext
 * @module Context
 * @constructor
 */
var ActivityContext = function(framework, activity, _closeDefer, $q) {

	var _stop = function() {
		return true;
	};

	var _resume = function() {
		return true;
	};

	var _pause = function() {
		return true;
	};

	var _show = function() {
		return true;
	};

	var _result = null;

	this.activity = activity;

	/**
	 * Contains an instance of ActivityBus. Permit the communication with other
	 * components of framework.
	 * 
	 * @property bus
	 * @type ActivityBus
	 * @example ctx.bus.publish("com.newt.system.toolbar.actions", {..options..}
	 *          });
	 */
	this.bus = framework.bus.createBus(this.activity.instanceId);

	/**
	 * Contains an instance of EventBus. Permit the firing of events outside this Activity.
	 * 
	 * @property eventBus
	 * @type EventBus
	 */
	this.eventBus = new EventBus($q);

	/**
	 * Returns the promise/deferred instance for the management of the activity
	 * closure. <br />
	 * Currently use $q AngularJs implementation. View
	 * https://docs.angularjs.org/api/ng/service/$q for more details.
	 * 
	 * @method getCloseDefer
	 * @return {Defer} The defer for manage promise
	 */
	this.getCloseDefer = function() {
		return _closeDefer;
	};
	
	this.resolveCloseDefer = function() {		
		this.getCloseDefer().resolve(this.getResult());
	};

	/**
	 * This method is used for set the activity result. Can be changed any time
	 * and the value set at activity closure is returned to parent. closure.
	 * 
	 * @method setResult
	 * @param {Object} result
	 *            The object result
	 */
	this.setResult = function(result) {
		_result = result;
	};

	this.getResult = function() {
		return _result;
	};

	this.onStop = function(fn) {
		_stop = fn;
	};

	this.callStop = function() {
		return this.getStop()();
	};
	
	this.getStop = function() {
		return _stop;
	};

	this.onShow = function(fn) {
		_show = fn;
	};
	
	this.callShow = function() {
		return this.getShow()();
	};

	this.getShow = function() {
		return _show;
	};

	this.stop = function(result) {
		if (result !== undefined) {
			_result = result;
		}
		framework.stopActivity();
	};

	this.onResume = function(fn) {
		_resume = fn;
	};

	this.callResume = function() {
		return this.getResume()();
	};
	
	this.getResume = function() {
		return _resume;
	};

	this.onPause = function(fn) {
		_pause = fn;
	};
	
	this.callPause = function() {
		return this.getPause()();
	};

	this.getPause = function() {
		return _pause;
	};

	this.createFragment = function(appId, activityName, parameters) {
		return this.activity.createFragment(appId, activityName, parameters);
	};

	this.newActivityIntent = function(appId, activityName, parameters) {
		var i = new Intent(IntentType.START_ACTIVITY, framework);
		i.activity = activityName;
		i.parameters = parameters;
		i.app = appId;
		return i;
	};

	this.newActivityIntentAsRoot = function(appId, activityName, parameters) {
		var i = new Intent(IntentType.START_ACTIVITY, framework);
		i.activity = activityName;
		i.parameters = parameters;
		i.app = appId;
		i.startMode = "ROOT";
		return i;
	};
	this.newActivityIntentAsPopup = function(appId, activityName, parameters) {
		var i = new Intent(IntentType.START_ACTIVITY, framework);
		i.activity = activityName;
		i.parameters = parameters;
		i.app = appId;
		i.startMode = "CHILD_POPUP";
		return i;
	};

	this.newIntent = function(intentType, parameters) {
		var i = new Intent(intentType, framework);
		i.parameters = parameters;
		return i;
	};

	this.resolveUrl = function(path) {
		return Utils.resolveUrl(this.activity.application, path);
	};

	this.prepareView = function(url) {
		return activity.prepareView(url);
	};

	this.notify = function(type, message, options) {
		return framework.notifyManager.notify(type, message, options);
	};

	this.getActivityInstanceId = function() {
		return this.activity.instanceId;
	};
	
	this.getService = function(appId, serviceName) {
		var s = framework.getService(Utils.composeServiceId(appId,serviceName));
		return s?s.instance:null;
	};
};

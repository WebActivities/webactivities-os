/**
* Activity Context
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

	this.bus = framework.bus.createBus(this.activity.instanceId);

	this.eventBus = new EventBus($q);

	this.getCloseDefer = function() {
		return _closeDefer;
	};

	this.setResult = function(result) {
		_result = result;
	};

	this.getResult = function() {
		return _result;
	};

	this.onStop = function(fn) {
		_stop = fn;
	};

	this.getStop = function() {
		return _stop;
	};

	this.onShow = function(fn) {
		_show = fn;
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

	this.getResume = function() {
		return _resume;
	};

	this.onPause = function(fn) {
		_pause = fn;
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
};

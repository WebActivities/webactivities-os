var IntentType = {
	START_ACTIVITY : 0,
	START_INTENT : 2
};

var Intent = function(type,intentExecutor) {
	this.intentType = type;
	this.activity = null;
	this.app = null;
	this.parameters = {};
	this.startMode = "CHILD";

	this.start = function(options) {
		return intentExecutor.executeIntent(this,options);
	};
};
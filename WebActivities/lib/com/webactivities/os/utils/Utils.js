var Utils = (function() {

	var uniqueCounter = 0;

	var getUniqueKey = function(prefix) {
		return (prefix || "") + (uniqueCounter++);
	};

	var resolveUrl = function(application, path) {
		path = path.replace("%v", application.version);
		path = path.replace("%d", new Date().getTime());
		var src = path.indexOf("http") == 0 ? path : application.path + (path.indexOf("/") == 0 ? path : "/" + path);
		return src;
	};

	var composeId = function(appId, componentId) {
		return appId + "@" + componentId;
	};

	var dirname = function(path) {
		return path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
	};

	var resolveStartMode = function(mode) {
		for ( var i in Activity.startMode) {
			if (i == mode) {
				return Activity.startMode[i];
			}
		}
		return Activity.startMode.UNKNOWN;
	};

	return {

		getUniqueKey : getUniqueKey,

		resolveUrl : resolveUrl,

		composeActivityId : composeId,

		composeServiceId : composeId,

		dirname : dirname,

		resolveStartMode : resolveStartMode

	};

})();
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
	
	var toAbsoluteUrl = function(application, path) {
		if (path.indexOf("http") == 0) {
			return path;
		}
		var url = resolveUrl(application, path);
		loc = window.top.location;
		return loc.origin+loc.pathname+url;
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

	var copy = function copy(obj) {
		// Handle the 3 simple types, and null or undefined
		if (null == obj || "object" != typeof obj)
			return obj;

		// Handle Object
		if (obj instanceof Object) {
			var copy = {};
			for ( var attr in obj) {
				if (obj.hasOwnProperty(attr)) {
					copy[attr] = obj[attr];
				}
			}
			return copy;
		}

		throw new Error("Unable to copy obj! Its type isn't supported.");
	};

	return {

		getUniqueKey : getUniqueKey,

		resolveUrl : resolveUrl,
		
		toAbsoluteUrl : toAbsoluteUrl,

		composeActivityId : composeId,

		composeServiceId : composeId,

		dirname : dirname,

		resolveStartMode : resolveStartMode,

		copy : copy

	};

})();
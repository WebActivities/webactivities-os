var Utils = (function() {
	
	var uniqueCounter=0;
	
	var getUniqueKey = function() {
		return uniqueCounter++;
	};
	
	var resolveUrl = function(application, path) {
		path = path.replace("%v", application.version);
		path = path.replace("%d", new Date().getTime());
		var src = path.indexOf("http") == 0 ? path : application.path + (path.indexOf("/") == 0 ? path : "/" + path);
		return src;
	};
	
	var composeActivityId = function(appId, activityId) {
		return appId + "@" + activityId;
	};
	
	var dirname = function(path) {
		return path.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
	};
	
	return {
		
		getUniqueKey: getUniqueKey,
		
		resolveUrl: resolveUrl,
		
		composeActivityId: composeActivityId,
		
		dirname : dirname
		
	};
	
})();
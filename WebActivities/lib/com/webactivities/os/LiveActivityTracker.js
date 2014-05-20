
/**
 * Classe di utilità che, dato un eventBus, traccia l'activity di primo piano
 * 
 * @class LiveActivityTracker
 * @constructor
 */
var LiveActivityTracker = function(eventBus,onClear,onSet) {
	
	var liveActivity = null;
	
	var setLiveActivity = function(newVal) {
		if (liveActivity!=null && liveActivity!=newVal) {
			onClear(liveActivity);
		}
		var prevVal = liveActivity;
		liveActivity = newVal;
		if (liveActivity!=null && liveActivity!=prevVal) {
			onSet(liveActivity);
		}
	};
	
	eventBus.on("activityStarted",function(event,o) {
	});
	
	eventBus.on("displayActivity",function(event,o) {
		setLiveActivity(o.activity);
	});
	
	eventBus.on("destroyActivity",function(event,o) {
		if (liveActivity == o.activity) {			
			setLiveActivity(null);
		}
	});
	
	eventBus.on("pausedActivity",function(event,act) {
		if (liveActivity == act) {			
			setLiveActivity(null);
		}
	});
	
	eventBus.on("resumedActivity",function(event,act) {
		if (liveActivity == null) {			
			setLiveActivity(act);
		}
	});	
	
};
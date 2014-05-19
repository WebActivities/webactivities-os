
/**
 * Classe di utilità che, dato un uiCommunicator, traccia l'activity di primo piano
 * 
 * @class LiveActivityTracker
 * @constructor
 */
var LiveActivityTracker = function(uiCommunicator,onClear,onSet) {
	
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
	
	uiCommunicator.on("activityStarted",function(event,o) {
	});
	
	uiCommunicator.on("displayActivity",function(event,o) {
		setLiveActivity(o.activity);
	});
	
	uiCommunicator.on("destroyActivity",function(event,o) {
		if (liveActivity == o.activity) {			
			setLiveActivity(null);
		}
	});
	
	uiCommunicator.on("pausedActivity",function(event,act) {
		if (liveActivity == act) {			
			setLiveActivity(null);
		}
	});
	
	uiCommunicator.on("resumedActivity",function(event,act) {
		if (liveActivity == null) {			
			setLiveActivity(act);
		}
	});	
	
};
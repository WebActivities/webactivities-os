

var newt = (function() {

	var commands = {};
	
    var onMessage = function(event) {
    	var commandName = event.data.commandName;
		if (commands[commandName]) {
			var replayCallback = function(result) {
				sendResultToNewt(result,event.data._channelId,event.data._conversationId);
			};
			commands[commandName](event.data,replayCallback);
		} else {
			sendResultToNewt( "Command Not Found!",event.data._channelId,event.data._conversationId);
		}
	};
	
	window.addEventListener("message", onMessage, false);

	var channelId = null;
	var onActivityStartingCallback = null;
	var onActivityStopCallback = null;
	
	var sendMessageToNewt = function(data, channelId) {
		data._channelId = channelId;
		parent.postMessage(data,"*");
	};
	
	var sendResultToNewt = function(result, channelId, replayTo) {
		parent.postMessage({
			_channelId : channelId,
			replayTo: replayTo,
			result: result
		},"*");
	};

	commands.onInitChannel= function(command,replay) {
		channelId = command.channelId;
		console.log("Initialized channel: ",command.channelId);
		replay();
	};
	
	commands.onShow = function(command,replay) {
		if (onActivityStartingCallback) {
			onActivityStartingCallback(replay);
		} else {
			replay();
		}
	};
	
	commands.onStop = function(command,replay) {
		if (onActivityStopCallback) {
			onActivityStopCallback(replay);
		} else {
			replay();
		}
	};

	
	//API Exposed to the Activity developer
	var newt = {
		
		
		onActivityStarting: function(listener) {
			onActivityStartingCallback = listener;	
		},
		
		onActivityStop: function(listener) {
			onActivityStopCallback = listener;	
		},
		
		stop: function(resultObject) {
			sendMessageToNewt({
				commandName : 'stop'
			},channelId);
		}
			
			
	};
	return newt;

})();




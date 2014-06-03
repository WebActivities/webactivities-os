

/**
 * Classe che permette la comunicazione tramite postMessage con uyna activity sandboxed
 * 
 * @class ActivityChannel
 * @module ActivityChannel
 * @constructor
 */
var ActivityChannel = function(activity,$q) {
	
	var initialized = false;
	var channelId = "channel_"+((new Date()).getTime());
	var conversations = {};
	var commandsHandlers = {};
	
	window.addEventListener("message", function(event) {
		if (event.data._channelId!=channelId) {
			return;
		}
		if (event.data.replayTo) {
			var conversation = conversations[event.data.replayTo];
			if (conversation) {
				conversation.deferred.resolve(event);
				delete conversations[event.replayTo]; 
			}
		} else {
			var handler = commandsHandlers[event.data.commandName];
			if (handler) {
				
				var replayCallback = function(result) {
					var msg = {};
					msg['_channelId']=channelId;
					msg.replayTo= event.data._conversationId;
					msg.result= result;
					if (activity.iframe && activity.iframe.contentWindow) {
						activity.iframe.contentWindow.postMessage(msg,"*");
					}
				};
				
				handler(event.data,replayCallback);
			}
		}
	}, false);
	
	var innerSendAndReceive = function(msg) {
		
		var deferred = $q.defer();
		var conversationId = "conversation_"+((new Date()).getTime());
		
		msg['_channelId']=channelId;
		msg['_conversationId']=conversationId;
		
		conversations[conversationId] = {
			deferred: deferred
		};
		
		activity.iframe.contentWindow.postMessage(msg,"*");
		return deferred.promise;
	};
	
	this.init = function() {
		if (!initialized) {			
			return innerSendAndReceive({
				commandName: "onInitChannel",
				channelId : channelId
			}).then(function() {
				initialized = true;
			});
		} else {
			return $q.when();
		}
	};
	
	this.sendAndReceive = function(msg) {
		if (!initialized) {
			this.init().then(function() {
				return innerSendAndReceive(msg);
			});
		} else {
			return innerSendAndReceive(msg);
		}
	};
	
	this.on = function(commandName,commandsHandler) {
		commandsHandlers[commandName] = commandsHandler;
	};
	
};
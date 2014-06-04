
var newt = (function() {
	
	var conversations = {};
	var commands = {};
	var initParams = _readInitParams();
	
    var onMessage = function(event) {
    	if (event.data.replayTo) {
    		var conversation = conversations[event.data.replayTo];
			if (conversation) {
				conversation.callback(event);
				delete conversations[event.replayTo]; 
			}
    	} else {
	    	var commandName = event.data.commandName;
			if (commands[commandName]) {
				var replayCallback = function(result) {
					sendResultToNewt(result,event.data._channelId,event.data._conversationId);
				};
				commands[commandName](event.data,replayCallback);
			} else {
				sendResultToNewt( "Command Not Found!",event.data._channelId,event.data._conversationId);
			}
    	}
	};
	
	window.addEventListener("message", onMessage, false);

	var channelId = null;
	var onActivityStartingCallback = null;
	var onActivityStopCallback = null;
	var onActivityPausingCallback = null;
	var onActivityResumingCallback = null;
	

	var sendMessageToNewt = function(data,replayHandler) {
		
		var conversationId = "conversation_"+((new Date()).getTime());
		data['_channelId'] = channelId;
		data['_conversationId']=conversationId;
		
		if (replayHandler) {
			conversations[conversationId] = {
					callback: replayHandler
			};
		}
		
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
	
	commands.onPause = function(command,replay) {
		if (onActivityPausingCallback) {
			onActivityPausingCallback(replay);
		} else {
			replay();
		}
	};
	
	commands.onResume = function(command,replay) {
		if (onActivityResumingCallback) {
			onActivityResumingCallback(replay);
		} else {
			replay();
		}
	};


	var intentExecutor = {
			executeIntent: function(intent,options) {
				
				//rimuove la funzione altrimenti l'oggetto non è clonabile
				intent.start = null;
				
				var deferred=null;
				deferred = {
					resolve: function(r) {
						if (deferred._then) {
							deferred._then(r);
						}
					},
					then: function(fn) {
						deferred._then = fn;
					}	
				};
				sendMessageToNewt({
					commandName : 'executeIntent',
					intent: intent,
					options: options
				},function(result) {
					deferred.resolve(result.data.result);
				});
				return deferred;
			}
	};
	
	var IntentType = {
		START_ACTIVITY : 0,
		START_INTENT : 2
	};
	
	var Intent = function(type) {
		this.intentType = type;
		this.activity = null;
		this.app = null;
		this.parameters = {};
		this.startMode = "CHILD";

		this.start = function(options) {
			return intentExecutor.executeIntent(this,options);
		};
	};
	
	var newActivityIntent = function(appId, activityName, parameters) {
		var i = new Intent(IntentType.START_ACTIVITY);
		i.activity = activityName;
		i.parameters = parameters;
		i.app = appId;
		return i;
	};

	var newActivityIntentAsRoot = function(appId, activityName, parameters) {
		var i = new Intent(IntentType.START_ACTIVITY);
		i.activity = activityName;
		i.parameters = parameters;
		i.app = appId;
		i.startMode = "ROOT";
		return i;
	};
	
	var newActivityIntentAsPopup = function(appId, activityName, parameters) {
		var i = new Intent(IntentType.START_ACTIVITY);
		i.activity = activityName;
		i.parameters = parameters;
		i.app = appId;
		i.startMode = "CHILD_POPUP";
		return i;
	};

	var newIntent = function(intentType, parameters) {
		var i = new Intent(intentType);
		i.parameters = parameters;
		return i;
	};
	
	var notify = function(type, message, options) {
		sendMessageToNewt({
			commandName : 'notify',
			type: type,
			message: message,
			options: options
		});
	};

	function _readInitParams() {
		
		var scripts = document.getElementsByTagName('script');
		var myScript = scripts[ scripts.length - 1 ];
		var queryString = myScript.src.replace(/^[^\?]+\??/,'');
		
		function parseQuery ( query ) {
		   var Params = new Object ();
		   if ( ! query ) return Params; // return empty object
		   var Pairs = query.split(/[;&]/);
		   for ( var i = 0; i < Pairs.length; i++ ) {
		      var KeyVal = Pairs[i].split('=');
		      if ( ! KeyVal || KeyVal.length != 2 ) continue;
		      var key = unescape( KeyVal[0] );
		      var val = unescape( KeyVal[1] );
		      val = val.replace(/\+/g, ' ');
		      Params[key] = val;
		   }
		   return Params;
		}
		
		return parseQuery( queryString );
	};
	
	
	//API Exposed to the Activity developer
	var newt = {
			
		onActivityStarting: function(listener) {
			onActivityStartingCallback = listener;	
		},
		
		onActivityStop: function(listener) {
			onActivityStopCallback = listener;	
		},
		
		onActivityPause: function(listener) {
			onActivityPausingCallback = listener;	
		},
		
		onActivityResume: function(listener) {
			onActivityResumingCallback = listener;	
		},
		
		stop: function(resultObject) {
			sendMessageToNewt({
				commandName : 'stop'
			});
		},
		
		newActivityIntentAsRoot: newActivityIntentAsRoot,
		newActivityIntentAsPopup: newActivityIntentAsPopup,
		newActivityIntent: newActivityIntent,
		newIntent: newIntent,
		
		notify: notify
			
	};
	return newt;

})();




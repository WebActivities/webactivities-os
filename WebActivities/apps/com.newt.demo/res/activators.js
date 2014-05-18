var SigninActivator = function(context, parameters) {

	context.prepareView(context.resolveUrl("view/signin.html")).then(function(ui) {

		$("#signinBtn", ui).click(function() {
			var email = $("#emailFld", ui).val();
			var password = $("#passwordFld", ui).val();
			context.newActivityIntent("com.newt.demo", "dashboard", {}).start();
		});
	});

};

var DashboardActivator = function(context, parameters) {

	context.prepareView(context.resolveUrl("view/dashboard.html")).then(function(ui) {
		$("#messagesBtn", ui).click(function() {
			context.newActivityIntentAsPopup("com.newt.demo", "messages", {}).start({
				relativeTo : this
			});
		});

		$("#messagesLnk", ui).click(function() {
			context.newActivityIntent("com.newt.demo", "messages", {}).start();
		});
	});

};

var MessagesActivator = function(context, parameters) {

	context.prepareView(context.resolveUrl("view/messages.html")).then(function(ui) {
		$("#messages", ui).find("tr").click(function() {
			context.newActivityIntentAsPopup("com.newt.demo", "messageReader", {}).start({
				relativeTo : this
			});
		});
	});

};

var MessageReaderActivator = function(context, parameters) {

	context.prepareView(context.resolveUrl("view/message-reader.html")).then(function(ui) {
		$("#close-message", ui).click(function() {
			context.stop();
		});
	});

};
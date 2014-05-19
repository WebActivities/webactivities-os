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
		$("#manageCustomerLnk", ui).click(function() {
			context.newActivityIntent("com.newt.demo", "customerSearch", {}).start();
		});
		$("#manageProjectLnk", ui).click(function() {
			context.newActivityIntent("com.newt.demo", "projectSearch", {}).start();
		});
		$("#newProjectLnk", ui).click(function() {
			context.newActivityIntentAsPopup("com.newt.demo", "projectEdit", {}).start({
				relativeTo : this
			});
		});
		$("#newCustomerLnk", ui).click(function() {
			context.newActivityIntentAsPopup("com.newt.demo", "customerEdit", {}).start({
				relativeTo : this
			});
		});
		$("#projectBtn", ui).click(function() {
			context.newActivityIntentAsPopup("com.newt.demo", "projectSearch", {}).start({
				relativeTo : this
			});
		});
		$("#customerBtn", ui).click(function() {
			context.newActivityIntentAsPopup("com.newt.demo", "customerSearch", {}).start({
				relativeTo : this
			});
		});
		var f1 = context.createFragment("com.newt.demo", "customerSearch");
		$("#customerFragment", ui).append(f1.getComponent().css({
			width : "100%",
			height : "200px",
		}));
		f1.start();
		var f2 = context.createFragment("com.newt.demo", "projectSearch");
		$("#projectFragment", ui).append(f2.getComponent().css({
			width : "100%",
			height : "300px",
		}));
		f2.start();
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

var CustomerSearchActivator = function(context, parameters) {

	context.prepareView(context.resolveUrl("view/customer-search.html")).then(function(ui) {
	});

};

var CustomerEditActivator = function(context, parameters) {

	context.prepareView(context.resolveUrl("view/customer-edit.html")).then(function(ui) {
	});

};

var ProjectSearchActivator = function(context, parameters) {

	context.prepareView(context.resolveUrl("view/project-search.html")).then(function(ui) {
	});

};

var ProjectEditActivator = function(context, parameters) {

	context.prepareView(context.resolveUrl("view/project-edit.html")).then(function(ui) {
	});

};
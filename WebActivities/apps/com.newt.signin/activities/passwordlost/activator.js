function PasswordLostActivator(context, parameters) {

	context.prepareView(context.resolveUrl("/view/passwordlost.html?" + new Date().getTime())).then(function(ui) {

		angular.module('passwordlostApp', [])

		// Signin Ctrl
		.controller('PasswordLostCtrl', [ '$scope', function($scope) {

		} ]);

		angular.element(ui).ready(function() {
			angular.bootstrap(ui, [ 'passwordlostApp' ]);
		});

	});

}
function SigninActivator(ctx, parameters) {

	ctx.prepareView(ctx.resolveUrl("/view/signin.html")).then(function(ui) {

		angular.module('signinApp', [])

		// Signin Ctrl
		.controller('SigninCtrl', [ '$scope', function($scope) {
			$scope.passwordLost = function(e) {
				var i = ctx.newActivityIntent("com.newt.signin", "passwordlost");
				i.startMode = "CHILD_POPUP";
				i.start({
					relativeTo : $(ui).find("#passwordLostBtn")
				}).then(function(result) {
				});
			};
		} ]);

		angular.element(ui).ready(function() {
			angular.bootstrap(ui, [ 'signinApp' ]);
		});

	});

}
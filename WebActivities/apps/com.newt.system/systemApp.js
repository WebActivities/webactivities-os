
var loadAngularView = function(ctx,options) {
	var deferred = jQuery.Deferred();
	var view = $("<div>");
	view.load(ctx.resolveUrl(options.templateUrl),function() {
		angular.element(view).ready(function() {
			if (options.linkCss) {
				view.prepend("<link href='"+ctx.resolveUrl(options.linkCss)+"' rel='stylesheet' type='text/css'>");
			}
			angular.module(options.module)
				.value("framework",ctx.framework())
				.value("ctx",ctx);
			angular.bootstrap(view, [ options.module ]);
			deferred.resolve(view);
		});
	}); 
	return deferred.promise();
};


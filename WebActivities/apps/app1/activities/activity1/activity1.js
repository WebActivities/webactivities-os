var Activity1 = function(ctx) {
	
	var view = $("<h1>").text("Hello World!");
	view.click(function() {
		alert('Mi hai cliccato! Grazie!');
		console.log($(window.top.document).find("*"));
		console.log(window.parent);
		console.log(window.opener);
	});

	ctx.prepareView().then(function(v) {
		$(v).append(view);
		for (var i = 0; i < 100; i++) {
			$(v).append($("<div>").text(i));
		}
	});
	
};

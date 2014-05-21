var Editor = function(ctx) {
	
	
	ctx.prepareView(ctx.resolveUrl("view/editor.html")).then(function(ui) {
		
		// inclusione script nell'iframe va fatta cos' per 
		//un bug di jquery nel load: "http://bugs.jquery.com/ticket/14568"
		var script = ui.ownerDocument.createElement("script");
		script.setAttribute('src','res/ace/ace.js');
		ui.appendChild(script);
		
		$(script).load(function() {
			
			var ace = ui.ownerDocument.defaultView.window.ace;
			var element = $("#editor",ui);
			element[0].style.fontSize='14px';
			var editor = ace.edit(element[0]);
		    editor.setTheme("ace/theme/chrome");
		    editor.getSession().setMode("ace/mode/javascript");
		    
		    element.css({
			    position: 'absolute',
			    margin: '0px',
			    top: '0px',
			    bottom: '0px',
			    left: '0px',
			    right: '0px'
		    });
			
		});
		
		
		
		
	});
	
};

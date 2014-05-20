var Logger = {

	log : function(log) {
		if (window.console) {
			console.log(log);
		}
	},

	error : function(error) {
		if (window.console) {
			console.error(error);
		}
	}
};

var Utils = (function() {
	
	var uniqueCounter=0;
	
	return {
		
		getUniqueKey: function() {
			return uniqueCounter++;
		}
		
	};
	
})();
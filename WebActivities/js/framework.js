'use strict';

/* Services */
angular.module('webActivitiesApp.framework', [])

.factory("framework", [ '$q', function($q) {
	return new Framework($q);
} ])

//
;


'use strict';

// Declare app level module which depends on filters, and services
angular.module('webActivitiesApp.routes', [])

// Config
.config([ '$routeProvider', function($routeProvider) {

	$routeProvider.when('/home', {
		templateUrl : 'partials/home.html',
		controller : 'HomeCtrl',
		resolve : {},
		title : "WebActivities Main page"
	});

	$routeProvider.otherwise({
		redirectTo : '/home'
	});

} ]);

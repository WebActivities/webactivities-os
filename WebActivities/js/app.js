'use strict';

// Declare app level module which depends on filters, and services
angular.module('webActivitiesApp', [ 'ngRoute', 'webActivitiesApp.filters', 'webActivitiesApp.services', 'webActivitiesApp.directives', 'webActivitiesApp.controllers', 
                                     'webActivitiesApp.toolbar','webActivitiesApp.routes',
		'webActivitiesApp.config', 'webActivitiesApp.shared', 'webActivitiesApp.framework', 'ui.bootstrap', 'ui.utils' ]);

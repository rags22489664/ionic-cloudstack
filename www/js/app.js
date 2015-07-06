// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.services', 'starter.controllers'])

.run(function ($rootScope, $state, authentication, $ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
        var requireLogin = undefined;

        if (toState.data && toState.data.requireLogin) {
            requireLogin = true;
        }

        if (toState.name === 'login' && authentication.isAuthenticated) {
            event.preventDefault();
            $state.go('app.home');
        }

        if (requireLogin && !authentication.isAuthenticated) {
            event.preventDefault();
            $state.go('login');
        }

    });
})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

    $ionicConfigProvider.views.maxCache(0);

    $stateProvider

        .state('login', {
        url: "/login",
        templateUrl: "templates/login.html",
        controller: 'LoginCtrl'
    })

    .state('app', {
        url: "/app",
        abstract: true,
        data: {
            requireLogin: true
        },
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
    })

    .state('app.home', {
        url: "/home",
        views: {
            'menuContent': {
                templateUrl: "templates/home.html",
                controller: 'HomeCtrl'
            }
        }
    })
    
    .state('app.vms', {
        url: "/virtualmachines",
        views: {
            'menuContent': {
                templateUrl: "templates/list.html",
                controller: 'VMCtrl'
            }
        }
    })
    
    .state('app.templates', {
        url: "/templates",
        views: {
            'menuContent': {
                templateUrl: "templates/list.html",
                controller: 'TemplateCtrl'
            }
        }
    })
    
    .state('app.volumes', {
        url: "/volumes",
        views: {
            'menuContent': {
                templateUrl: "templates/list.html",
                controller: 'VolumeCtrl'
            }
        }
    })

    .state('app.networks', {
        url: "/networks",
        views: {
            'menuContent': {
                templateUrl: "templates/list.html",
                controller: 'NetworkCtrl'
            }
        }
    })

    .state('app.events', {
        url: "/events",
        views: {
            'menuContent': {
                templateUrl: "templates/list.html",
                controller: 'EventCtrl'
            }
        }
    })

    .state('app.search', {
        url: "/search",
        views: {
            'menuContent': {
                templateUrl: "templates/search.html"
            }
        }
    })

    .state('app.browse', {
            url: "/browse",
            views: {
                'menuContent': {
                    templateUrl: "templates/browse.html"
                }
            }
        })
        .state('app.playlists', {
            url: "/playlists",
            views: {
                'menuContent': {
                    templateUrl: "templates/playlists.html",
                    controller: 'PlaylistsCtrl'
                }
            }
        })

    .state('app.single', {
        url: "/playlists/:playlistId",
        views: {
            'menuContent': {
                templateUrl: "templates/playlist.html",
                controller: 'PlaylistCtrl'
            }
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/login');
});
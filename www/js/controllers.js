angular.module('starter.controllers', [])

    .controller('AppCtrl', function ($scope, authentication) {
        $scope.authentication = authentication;
    })

    .controller('PlaylistsCtrl', function ($scope) {
        $scope.playlists = [{
            title: 'Reggae',
            id: 1
        }, {
            title: 'Chill',
            id: 2
        }, {
            title: 'Dubstep',
            id: 3
        }, {
            title: 'Indie',
            id: 4
        }, {
            title: 'Rap',
            id: 5
        }, {
            title: 'Cowbell',
            id: 6
        }];
    })

    .controller('PlaylistCtrl', function ($scope, $stateParams) {
    })


    .controller('LoginCtrl', function ($scope, $stateParams, $rootScope, $state, $timeout, $ionicHistory, authentication, LoadingService, ApiService, NotificationService) {

        $scope.form = {};

        $scope.showLoading = false;

        var sendHome = function () {
            $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
            });
            $scope.form = {};
            $state.go('app.home');
            LoadingService.hide();
        };

        if (authentication.isAuthenticated) {
            sendHome();
        }

        var onLoginSuccess = function (data, status, headers, config) {
            sendHome();
        };

        var onLoginFailure = function (data, status, headers, config) {
            NotificationService.toast('error during login');
        };

        $scope.login = function () {
            LoadingService.show();
            ApiService.login($scope.form.url, $scope.form.username, $scope.form.password, $scope.form.domain, onLoginSuccess, onLoginFailure);
        };

    })


    .controller('HomeCtrl', function ($scope, ApiService) {
        ApiService.invoke({
            command: 'listCapabilities'
        }, 'GET', function (data, status, headers, config) {
            alert('yahoo');
        }, function (data, status, headers, config) {

        });
    })


    .controller('VMCtrl', function ($scope, LoadingService, ApiService, ListService, VMService) {

        $scope.title = 'VirtualMachines';

        var mapperFn = function (vms) {
            if (vms && vms.length) {
                for (var i = 0; i < vms.length; i++) {
                    vms[i].primaryContent = vms[i].displayname;
                    vms[i].secondaryContent = vms[i].instancename;
                    vms[i].ternaryContent = vms[i].state;
                }
            }
        };

        ListService.initialize({
            scope: $scope,
            request: {
                command: 'listVirtualMachines',
                listAll: true
            },
            mapper: mapperFn,
            responsename: 'listvirtualmachinesresponse',
            responseobj: 'virtualmachine',
            actions: {
                filter: function (vm) {
                    var actions = {};
                    var buttons = [];
                    if (vm.state === 'Running') {
                        buttons.push({
                            text: 'Stop',
                            id: 'stop'
                        });
                        buttons.push({
                            text: 'Reboot',
                            id: 'reboot'
                        });
                        actions.destructiveText = 'Delete';
                    }
                    if (vm.state === 'Stopped') {
                        buttons.push({
                            text: 'Start',
                            id: 'start'
                        });
                        actions.destructiveText = 'Delete';
                    }

                    actions.buttons = buttons;
                    return actions;
                },
                cancel: function (vm) {

                },
                buttonClicked: function (button, vm, items, index) {

                    switch (button.id) {
                        case 'stop' : {
                            VMService.action('stop', vm, function(){
                                VMService.refresh(vm, function(updatedVM){
                                    if(updatedVM) {
                                        items[index] = mapperFn([updatedVM]);
                                    }
                                });
                            });
                            break;
                        }

                        case 'reboot' : {
                            VMService.action('reboot', vm, function(){
                                VMService.refresh(vm, function(updatedVM){
                                    if(updatedVM) {
                                        items[index] = mapperFn([updatedVM]);
                                    }
                                });
                            });
                            break;
                        }

                        case 'start' : {
                            VMService.action('start', vm, function(){
                                VMService.refresh(vm, function(updatedVM){
                                    if(updatedVM) {
                                        items[index] = mapperFn([updatedVM]);
                                    }
                                });
                            });
                            break;
                        }
                    }

                    return true;
                },
                destructiveButtonClicked: function(vm, items, index) {
                    VMService.action('destroy', vm, function(){
                        //var refreshedVM = VMService.refresh(vm);
                        delete items[index];
                    });
                    return true;
                }
            }
        });

    }).controller('TemplateCtrl', function ($scope, LoadingService, ApiService, ListService) {

        $scope.title = 'Templates';

        ListService.initialize({
            scope: $scope,
            request: {
                command: 'listTemplates',
                listAll: true,
                templatefilter: 'all'
            },
            mapper: function (templates) {
                if (templates && templates.length) {
                    for (var i = 0; i < templates.length; i++) {
                        templates[i].primaryContent = templates[i].displaytext;
                        templates[i].secondaryContent = templates[i].name;
                    }
                }
            },
            responsename: 'listtemplatesresponse',
            responseobj: 'template'
        });

    }).controller('VolumeCtrl', function ($scope, LoadingService, ApiService, ListService) {

        $scope.title = 'Volumes';

        ListService.initialize({
            scope: $scope,
            request: {
                command: 'listVolumes',
                listAll: true
            },
            mapper: function (volumes) {
                if (volumes && volumes.length) {
                    for (var i = 0; i < volumes.length; i++) {
                        volumes[i].primaryContent = volumes[i].name;
                        volumes[i].secondaryContent = volumes[i].vmdisplayname;
                    }
                }
            },
            responsename: 'listvolumesresponse',
            responseobj: 'volume'
        });

    }).controller('NetworkCtrl', function ($scope, LoadingService, ApiService, ListService) {

        $scope.title = 'Networks';

        ListService.initialize({
            scope: $scope,
            request: {
                command: 'listNetworks',
                listAll: true
            },
            mapper: function (networks) {
                if (networks && networks.length) {
                    for (var i = 0; i < networks.length; i++) {
                        networks[i].primaryContent = networks[i].name;
                        networks[i].secondaryContent = networks[i].cidr;
                    }
                }
            },
            responsename: 'listnetworksresponse',
            responseobj: 'network'
        });

    }).controller('EventCtrl', function ($scope, LoadingService, ApiService, ListService) {

        $scope.title = 'Events';

        ListService.initialize({
            scope: $scope,
            request: {
                command: 'listEvents',
                listAll: true
            },
            mapper: function (events) {
                if (events && events.length) {
                    for (var i = 0; i < events.length; i++) {
                        events[i].primaryContent = events[i].description;
                        events[i].secondaryContent = events[i].created;
                    }
                }
            },
            responsename: 'listeventsresponse',
            responseobj: 'event'
        });

    });
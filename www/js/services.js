angular.module('starter.services', [])


    .service('HttpService', function ($http) {
        this.ajax = function (request) {
            request.withCredentials = true;
            return $http(request);
        };
    })

    .service('NotificationService', function ($ionicLoading) {
        this.toast = function (message) {
            alert(message);
        };

    })

    .service('ApiService', function (HttpService, UtilityService, authentication, NotificationService) {
        this.login = function (url, username, password, domain, onSuccess, onFailure) {

            var data = [];
            data.push('command=login');
            data.push('response=json');
            data.push('username=' + username);
            data.push('password=' + password);
            if (domain) {
                data.push('domain=' + domain);
            }

            var successfn = function (data, status, headers, config) {
                authentication.setCloudstackUrl(url);
                authentication.setCurrentUser(data.loginresponse);
                onSuccess(data, status, headers, config);
            };

            var failurefn = function (data, status, headers, config) {
                onFailure(data, status, headers, config);
            };

            HttpService.ajax({
                method: 'POST',
                url: url,
                data: data.join('&'),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).success(successfn).error(failurefn);

        };

        this.invoke = function (data, method, onSuccess, onFailure, onfinally) {

            var url = authentication.cloudstackUrl;
            if (!url) {
                throw new Error('url cannot be null');
            }

            if (!method) {
                method = 'GET';
            }

            if (!data || typeof data !== 'object') {
                throw new Error('data is invalid');
            }

            data.sessionkey = authentication.currentUser.sessionkey;
            data._ = new Date().getTime();
            data.response = 'json';

            var request = {};

            request.url = url;

            if (method === 'GET') {

                request.method = 'GET';
                request.params = data;

            } else if (method === 'POST') {

                request.method = 'POST';
                request.data = data;
                request.headers = {
                    'Content-Type': 'application/x-www-form-urlencoded'
                };

            }

            HttpService.ajax(request).
                success(function (data, status, headers, config) {

                    if (UtilityService.isAFunction(onSuccess)) {
                        onSuccess(data, status, headers, config);
                    } else {
                        console.log(data);
                    }

                }).error(function (data, status, headers, config) {

                    if (status === 401) {
                        authentication.logout();
                        NotificationService.toast('Session Timed Out');
                    }

                    if (UtilityService.isAFunction(onFailure)) {
                        onFailure(data, status, headers, config);
                    } else {
                        console.log(data);
                    }

                }).finally(function () {
                    if (UtilityService.isAFunction(onfinally)) {
                        onfinally();
                    }
                });

        };
    })


    .service('UtilityService', function () {
        this.isAFunction = function (functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
        };
    })


    .service('LoadingService', function ($ionicLoading) {
        this.show = function (args) {
            $ionicLoading.show({
                template: '<ion-spinner icon="spiral"></ion-spinner>'
            });
        };

        this.hide = function () {
            $ionicLoading.hide();
        };
    })


    .service('ListService', function (ApiService, UtilityService, $ionicActionSheet) {
        this.initialize = function (args) {

            args.scope.data = {};

            args.scope.data.items = [];
            args.scope.data.end = false;
            args.scope.data.page = 1;
            args.scope.data.pageSize = 20;

            args.scope.data.filterText = undefined;

            args.scope.data.onHold = function (item, items, index) {

                var actionSheetOptions = {
                    buttons: [],
                    cancelText: 'Cancel'
                };

                if (args.actions) {

                    if (UtilityService.isAFunction(args.actions.filter)) {
                        var actions = args.actions.filter(item);

                        if (actions.buttons && actions.buttons.length) {
                            actionSheetOptions.buttons = actions.buttons;
                        }

                        if(actions.destructiveText) {
                            actionSheetOptions.destructiveText = actions.destructiveText;
                        }
                    }

                    if (UtilityService.isAFunction(args.actions.cancel)) {
                        actionSheetOptions.cancel = function() {
                            args.actions.cancel(item);
                        };
                    }

                    if (UtilityService.isAFunction(args.actions.buttonClicked)) {
                        actionSheetOptions.buttonClicked = function(index, button) {
                            return args.actions.buttonClicked(button, item, items, index);
                        };

                    }

                    if (UtilityService.isAFunction(args.actions.destructiveButtonClicked)) {
                        actionSheetOptions.destructiveButtonClicked = function() {
                            return args.actions.destructiveButtonClicked(item, items, index);
                        };
                    }

                }
                $ionicActionSheet.show(actionSheetOptions);
            };


            args.scope.data.fetchMore = function () {

                if (args.scope.data.end) {
                    args.scope.$broadcast("scroll.infiniteScrollComplete");
                    return
                }

                var count = args.scope.data.items.length;

                if (count !== 0) {
                    if (count < args.scope.data.pageSize) {
                        args.scope.data.end = true;
                        args.scope.$broadcast("scroll.infiniteScrollComplete");
                        return;
                    }
                    args.scope.data.page = Math.ceil((count / args.scope.data.pageSize)) + 1;
                }

                args.request.page = args.scope.data.page;
                args.request.pagesize = args.scope.data.pageSize;

                ApiService.invoke(args.request, 'GET', function (data, status, headers, config) {
                    var responseItems = data[args.responsename][args.responseobj];
                    if (responseItems && responseItems.length) {
                        if (args.mapper && UtilityService.isAFunction(args.mapper)) {
                            args.mapper(responseItems);
                        }
                        Array.prototype.push.apply(args.scope.data.items, responseItems);
                    } else {
                        args.scope.data.end = true;
                    }
                }, function (data, status, headers, config) {
                    args.scope.$broadcast("scroll.infiniteScrollComplete");
                }, function () {
                    args.scope.$broadcast("scroll.infiniteScrollComplete");
                });

            };

            args.scope.data.doRefresh = function () {
                args.scope.data.end = false;
                args.scope.data.items = [];
                args.scope.data.fetchMore();
            };


        };
    })

    .service('AsyncService', function (ApiService) {
        this.queryAsync = function (arguments) {

            var queryFunction = function(args){

                var query = {};

                query.command = 'queryAsyncJobResult';
                query.jobid = args.jobid;

                ApiService.invoke(query, 'GET', function (data, status, headers, config) {

                    var result = data.queryasyncjobresultresponse.jobstatus;

                    switch (result) {

                        case 0: {
                            setTimeout(function(){
                                queryFunction(args);
                            }, 5000);
                            break;
                        }

                        case 1: {
                            args.success();
                            break;
                        }

                        case 2: {
                            args.error();
                            break;
                        }
                    }

                }, function (data, status, headers, config){
                    args.error(data, status, headers, config);
                });

            };

            queryFunction(arguments);
        };
    })

    .service('VMService', function (ApiService, NotificationService, AsyncService) {

        this.action = function(action, vm, successFn, errorFn) {

            var query = {};

            query.id = vm.id;

            var responseName = '';

            switch (action) {
                case 'stop' : {
                    query.command = 'stopVirtualMachine';
                    responseName = 'stopvirtualmachineresponse';
                    break;
                }
                case 'reboot' : {
                    query.command = 'rebootVirtualMachine';
                    responseName = 'rebootvirtualmachineresponse';
                    break;
                }
                case 'start' : {
                    query.command = 'startVirtualMachine';
                    responseName = 'startvirtualmachineresponse';
                    break;
                }
                case 'destroy' : {
                    query.command = 'destroyVirtualMachine';
                    responseName = 'destroyvirtualmachineresponse';
                    break;
                }
            }

            ApiService.invoke(query, 'GET', function (data, status, headers, config) {
                AsyncService.queryAsync({
                    jobid: data[responseName].jobid,
                    success: function() {
                        successFn();
                        NotificationService.toast('action ' + action + ' on VM with name ' + vm.name + ' was successful');
                    },
                    error: function(data, status, headers, config) {
                        errorFn();
                        NotificationService.toast('error during query async');
                    }
                });
            }, function (data, status, headers, config) {
                NotificationService.toast('error during ' + action + ' on VM with name ' + vm.name);
            });
        };

        this.refresh = function(vm, callback) {
            var query = {};

            query.id = vm.id;
            query.command = 'listVirtualMachines';
            query.listall = true;

            ApiService.invoke(query, 'GET', function (data, status, headers, config) {
                //callback(data.listvirtualmachinesresponse.virtualmachine[0]);
            },function (data, status, headers, config) {
                //callback(null);
            });
        };
    })

    .factory('authentication', function ($state) {

        var isAuthenticated = localStorage.isAuthenticated;
        var cloudstackUrl = localStorage.cloudstackUrl;
        var currentUser = undefined;

        if (localStorage.currentUser !== undefined) {
            currentUser = JSON.parse(localStorage.currentUser);
        }

        return {
            isAuthenticated: isAuthenticated,
            currentUser: currentUser,
            cloudstackUrl: cloudstackUrl,
            setCurrentUser: function (user) {
                this.currentUser = user;
                this.isAuthenticated = true;
                localStorage.currentUser = JSON.stringify(user);
                localStorage.isAuthenticated = true;
            },
            setCloudstackUrl: function (url) {
                this.cloudstackUrl = url;
                localStorage.cloudstackUrl = url;
            },
            logout: function () {
                this.currentUser = undefined;
                this.isAuthenticated = undefined;
                this.cloudstackUrl = undefined;
                delete localStorage.currentUser;
                delete localStorage.isAuthenticated;
                delete localStorage.cloudstackUrl;
                $state.go('login');
            }
        }

    });
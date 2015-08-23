'use strict';
/*global angular*/
angular.module('jumpingKangaroosApp', ['ui.unique'])
    .controller('RewardCalculatorController', ['$rootScope', '$scope', '$http',
        function($rootScope, $scope, $http) {
            var calculator = this;
            
            $rootScope.$on('routesChange', function(event, routes) {
                calculator.routes = routes.all;
            });
            
            calculator.getRoutes = function() {
                $http.get('../routes/all')
                    .then(function(response) {
                        calculator.routes = response.data;
                    }, function(response) {
                        calculator.routes = [];
                    });
            };
            
            $scope.$watch('calculator.selectedOrigin',
                function(newOrigin) {
                    $http.post('../routes/search',
                        { 
                            origin: calculator.selectedOrigin
                            
                        })
                        .then(function(response) {
                            calculator.routesWithSelectedOrigin = response.data;
                        }, function(response) {
                            calculator.routes = [];
                        });
                });
                
            $scope.$watch('calculator.selectedDestination',
                function(newDestination) {
                    if(!!calculator.selectedOrigin && !!calculator.selectedDestination) {
                        $http.post('../routes/search',
                            { 
                                origin: calculator.selectedOrigin,
                                destination: calculator.selectedDestination
                            })
                            .then(function(response) {
                                calculator.price = response.data[0].price;
                            }, function(response) {
                                calculator.price = 0;
                            });                        
                    }
                });
            
            
            calculator.getRoutes();
        }])
    .controller('AuthController', ['$rootScope', '$http',
        function($rootScope, $http) {
            var auth = this;
            
            auth.check = function() {
                $http.get('../auth/status').
                    then(function(response) {
                        auth.status = true;
                        auth.name = response.data.name;
                        $rootScope.$broadcast('authStatusChange',
                            { status: auth.status });
                    }, function(response) {
                        auth.status = false;
                        $rootScope.$broadcast('authStatusChange',
                            { status: auth.status });
                    });
            };
            
            auth.logout = function() {
                $http.get('../auth/logout');
                auth.check();
            };
            
            auth.check();
        }])
    .controller('RoutesController', ['$rootScope', '$http',
        function($rootScope, $http) {
            var routes = this;
            
            routes.formDefault = {
                origin: "",
                destination: "",
                price: 0
            };
            
            routes.all = [];
            
            $rootScope.$on('authStatusChange', function(event, auth) {
                routes.auth = auth.status;    
            });
            
            routes.reset = function() {
                routes.form = angular.copy(routes.formDefault);
            };
            
            routes.add = function() {
                $http.post('../routes/create', routes.form)
                    .then(function(response) {
                        routes.reset();
                        routes.reload();
                    }, function(response) {
                        alert("Error while adding new route");
                    });
            };
            
            routes.reload = function() {
                $http.get('../routes/all')
                    .then(function(response) {
                        routes.all = response.data;
                        $rootScope.$broadcast('routesChange',
                            { all: routes.all });
                    }, function(response) {
                        routes.all = [];
                    });
            };
            
            routes.delete = function(id) {
                $http.post('../routes/delete', { id: id })
                    .then(function(response) {
                        routes.reload();
                    }, function(response) {
                        alert("Error while deleting route " + id);
                    });
            };
            
            routes.reload();
        }]);
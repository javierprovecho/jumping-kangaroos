'use strict';
/*global angular*/
angular.module('jumpingKangaroosApp', [])
    .controller('RewardCalculatorController', [
        function() {
            var todoList = this;
            todoList.todos = [
                {text:'learn angular', done:true},
                {text:'build an angular app', done:false}];
     
            todoList.addTodo = function() {
                todoList.todos.push({text:todoList.todoText, done:false});
                todoList.todoText = '';
            };
     
            todoList.remaining = function() {
                var count = 0;
                angular.forEach(todoList.todos, function(todo) {
                    count += todo.done ? 0 : 1;
                });
                return count;
            };
     
            todoList.archive = function() {
                var oldTodos = todoList.todos;
                todoList.todos = [];
                angular.forEach(oldTodos, function(todo) {
                    if (!todo.done) todoList.todos.push(todo);
                });
            };
        }])
    .controller('AuthController', ['$rootScope', '$interval', '$http',
        function($rootScope, $interval, $http) {
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
    .controller('RoutesController', ['$rootScope', '$interval', '$http',
        function($rootScope, $interval, $http) {
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
'use strict';
/*global angular*/
angular.module('jumpingKangaroosApp', [])
    .controller('RewardCalculatorController', function() {
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
    })
    .controller('AuthController', ['$interval', '$http', function($interval, $http) {
        var auth = this;
        
        auth.check = function() {
            $http.get('../auth/status').
                then(function(response) {
                    auth.status = true;
                    auth.name = response.data.name;
                }, function(response) {
                    auth.status = false;
                });
        };
        
        auth.logout = function() {
            $http.get('../auth/logout');
            auth.check();
        };
        
        auth.check();
        //$interval(auth.check, 5000);
    }])
    .controller('RoutesController', ['$interval', '$http', function($interval, $http) {
        var auth = this;
        
        auth.check = function() {
            $http.get('../auth/status').
                then(function(response) {
                    if (response.statusText == 'OK') {
                        auth.status = true;
                        auth.name = response.data.name;
                    }
                }, function(response) {
                    if (response.statusText == 'Unauthorized') {
                        auth.status = false;
                    }
                });
        };
        
        auth.logout = function() {
            $http.get('../auth/logout');
            auth.check();
        };
        
        auth.check();
        //$interval(auth.check, 5000);
    }]);
'use strict';

angular.module('gitCloneApp')
.controller('mainCtrl', function($scope){
    let scope = $scope;

    scope.helloWorld = function() {
        console.log('hello world');
    }
})
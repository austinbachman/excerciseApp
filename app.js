
'use strict';

angular.module('app', [])
  	.controller('ExerciseController', function($scope, $http) {
  		//reload current and list whenever search is modified
	    $scope.$watch('search', function() {
	      	fetch();
	    });

	    //if no exercises in db, use this object
	    var defaultExercise = {
	    	id: '',
	    	name: "No exercise",
	    	category: ""
	    };

	    //initialize search and currentExercise
	    $scope.search = -1;
	    $scope.currentExercise = JSON.parse(JSON.stringify(defaultExercise));

	    $scope.predicate = 'id'; //for sort

	    //get list of all exercises in db and current exercise to view
	    function fetch() {
	    	$http.get("http://exercise-logger.lambda-tech.io/api/v1/exercises/")
	        .then(function(response) {
	         	$scope.exerciseList = response.data;
	        })
	        .then(function(){
	        	var findIndex = findExercise($scope.search);

	        	if(findIndex){
		        	$http.get("http://exercise-logger.lambda-tech.io/api/v1/exercises/" + findIndex)
				    .then(function(response) {
				        $scope.currentExercise = JSON.parse(JSON.stringify(response.data));
				    })
				    .catch(function(data) {
				        $scope.currentExercise = JSON.parse(JSON.stringify(defaultExercise));
				    })
				}
				else
					$scope.currentExercise = JSON.parse(JSON.stringify(defaultExercise));
			});
	    }

	    //sets search, fetch will be called
	    $scope.update = function(exercise) {
	     	$scope.search = exercise;
	    };

	    //finds an exercise in db by name
	    $scope.searchEx = function(exercise) {
	    	var index, found = -1;

	    	found = findName(exercise.name) - 1;

	    	if(found < 0)
	    		alert("Exercise not found");

	    	$scope.search = $scope.exerciseList[found];
	    	fetch();
	    }

	    //insert a new exercise into db
	    $scope.insertEx = function(exercise) {
	    	if(validEx(exercise) && !findName(exercise.name)){
		    	exercise.id = ''; //remove existing id
		    	var newExercise = JSON.stringify(exercise);

		    	$http.post("http://exercise-logger.lambda-tech.io/api/v1/exercises", newExercise)
		    	.then(function(data){
		    		$scope.update(exercise);
		    	})
		    	.catch(function(data){
		    		fetch(); //reload current
		    	});
		    }
		    else
		    	fetch();
	    };

	    //save changes to an exercise to db
	    $scope.modifyEx = function(exercise) {
	    	if(validEx(exercise)){
		    	var updateExercise = JSON.stringify(exercise);

		    	$http.put("http://exercise-logger.lambda-tech.io/api/v1/exercises/" + exercise.id, updateExercise)
		    	.then(function(data){
		    		$scope.update(exercise);
		    	})
		    	.catch(function(data){
		    		fetch(); //reload current if put fails
		    	});
		    }
		    else
		    	fetch();
	    };

	    //delete an exercise from db
	    $scope.removeEx = function(exercise) {
	    	if(findName(exercise.name)){
		    	var removeExercise = JSON.stringify(exercise);

		    	$http.delete("http://exercise-logger.lambda-tech.io/api/v1/exercises/" + exercise.id, removeExercise)
		    	.then(function(data){
		    		fetch();
		    	})
		    	.catch(function(data){
		    		fetch();
		    	});
	    	}
	    	else
	    		fetch();
	    }

	    //select entire text field
	    $scope.select = function() {
	     	this.setSelectionRange(0, this.value.length);
	    }

	    //find exercise in db
	    function findExercise(searchKey) {
	    	if(searchKey != undefined)
	    	{
		    	for( var exercise = 0; exercise < $scope.exerciseList.length; exercise++ )
		    	{
		    		if(($scope.exerciseList[exercise].name == searchKey.name) || ($scope.exerciseList[exercise].id == searchKey.id))
		    		{
		    			return $scope.exerciseList[exercise].id; //found id
		    		}
		    	}
		    }

			var result = ($scope.exerciseList[0] === undefined) ? false : $scope.exerciseList[0].id;

	    	return  result; //return first exercise if not found, or -1 if no exercises available
	    }

	    //find if exercise exists by name in db
	    //could probably find a way to combine with previous
	    function findName(name) {
	    	for( var exIndex = 0; exIndex < $scope.exerciseList.length; exIndex++ )
		    {
		    	if($scope.exerciseList[exIndex].name == name)
		    	{
		    		return exIndex + 1; //index of 0 still returns 'true' - decrements after call
		    	}
		    }

		    return false;
	    }

	    //check if category of exercise is valid for API
	    function validEx(exercise) {
	    	if(exercise.category != "cardio" && exercise.category != "strength"){
	    		return false;
	    	}

	    	return true;
	    }

	});
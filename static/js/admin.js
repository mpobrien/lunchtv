var lunchTvApp = angular.module('lunchTvApp', []);

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};


lunchTvApp.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

function VideoForm($scope, $http, $window) {
	$scope.videoIds = $window.videoIds

    $scope.userType = 'guest';

    $scope.submit = function(){
		var data = {videoId:$scope.newVideoId}
		$http.post('/admin/video', data).success(
		function(){
			$scope.videoIds.push($scope.newVideoId)
			$scope.newVideoId = ''
		});
	}
	$scope.deleteVideo = function(v){
		$http.delete('/admin/video/' + v).success(
		function(){
			$scope.videoIds.remove(v)
		});
	}
}



/*
youtubeid = "AIzaSyBrchxP9dHCq8130FkK3dz8o1PEsTqaQQM"

function VideoForm($scope) {

    $scope.userType = 'guest';

    $scope.submit = function(){
		console.log($scope.newVideoId)
	}

}

function makeRequest(){
	var restRequest = gapi.client.request({
	  'path': '/youtube/v3/videos',
	  'params': {'part': 'snippet', 'id': 'gFuGfwIhv14', key:youtubeid}
	});

	restRequest.execute(function(resp) { console.log(resp); });
}

function load() {
  gapi.client.setApiKey(youtubeid);
  gapi.client.load('youtube', 'v3', makeRequest);
}

*/

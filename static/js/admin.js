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
  $scope.allvids = $window.allvids
  $scope.vid = { }
  $scope.$watch('vid.url', function(){
    if($scope.vid.url != undefined){
      console.log("ok got ",$scope.vid.url)
      if($scope.vid.url.indexOf("http://") >= 0 || $scope.vid.url.indexOf("https://")>=0) {
        console.log("yeah",$scope.vid.url)
        $scope.previewurl = $scope.vid.url
        $('#vidplayer')[0].src = $scope.vid.url
      }
    }else{
      console.log("no got ",$scope.vid.url)
    }
  });

  $scope.remove = function(v){
    $http.delete('/admin/video/' + v._id)
    $scope.allvids = _.without($scope.allvids, _.findWhere($scope.allvids, {_id:v._id}));
  }

  $scope.setvid = function(v){
    $scope.vid = v
  }

  $scope.update = function(){
    if($scope.vid._id){
      console.log("doing update")
      $http.post('/admin/video/' + $scope.vid._id, $scope.vid).success(
          function(){
            var match = _.findWhere(allvids , {_id : $scope.vid._id });
            if(match){
              for(var k in $scope.vid) match[k]=$scope.vid[k];
            }
          })
    }else{
      console.log("doing insert")
      $http.post('/admin/video', $scope.vid).success(
          function(data, status, headers, config){
            $scope.vid._id = data['oid']
            console.log("args", arguments)
            $scope.allvids.push($scope.vid)
            $scope.vid = {}
          })
    }
  }
}



  /*
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
  */



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

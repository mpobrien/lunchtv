var lunchtv = angular.module('lunchtv', [])
lunchtv.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});

/*
bumpers = [
  {"videoId":"3YssYJUNkXo"},
  {"videoId":"e3l0BQff2Co"},
  {"videoId":"Ys69g1sPHAo"},
  {"videoId":"y8JlkI2Fu_U"},
  {"videoId":"t_flfX6_7xY"},
  {"videoId":"3saHUMoUznE"},
]
*/
PAUSE_KEY = 32
var bumperThreshold = 60 * 3 * 1000 // play a bumper every 3 minutes
//var bumperThreshold = 10 * 1000
var lastBumperTime = -Infinity

BUMPER_INDEX = -1
 BUMPER_INTERVAL = 5

nextKeys = [ 121, 104, 98, 117, 106, 105, 107, 109, 111,
             108, 44, 112, 59, 46, 91, 39, 47, 93, 13 ]
prevKeys = [ 113, 119, 101, 114, 116, 49, 50, 51, 52, 53, 65,
             115, 100, 102, 103, 122, 120, 99, 118, 98, 97 ]

lunchtv.controller('VideoController', function($scope, $window, $http) {
    var bumpers = $window.bumpers
    var done = false;
    $scope.playedVideos = []
    //$scope.videos = $window.videoIds
    //$scope.videos.unshift({"videoId": "3YssYJUNkXo"})
    $scope.videoIndex = -1
    $scope.bumpered = true
    videoPlayer = document.getElementById('videoPlayer')

    $scope.nextVideo = function(){
      console.log("next video")
      if($scope.videoIndex+1 == $scope.playedVideos.length){
        //Time to play a bumper?
        console.log(+new Date(), lastBumperTime, bumperThreshold)
        if((+new Date()) - lastBumperTime > bumperThreshold){
          console.log("playing bumper!")
          $scope.playVideo(bumpers[++BUMPER_INDEX % bumpers.length])
          lastBumperTime = +new Date()
          $scope.bumpered = true
          return
        }else{
          $scope.bumpered = false
          $http({method: 'GET', url: '/next'}).
            success(function(data, status, headers, config) {
              console.log("not playing bumper!")
              var video = data
              $scope.playedVideos.push(video)
              $scope.videoIndex++
              $scope.playVideoAtIndex($scope.videoIndex)
            }).
            error(function(data, status, headers, config) {}
          );
        }
      }else{
          $scope.videoIndex++
          $scope.playVideoAtIndex($scope.videoIndex)
      }
      $http({method: 'GET', url: '/next'}).
        success(function(data, status, headers, config) {
          console.log("not playing bumper!")
          var video = data
          $scope.playedVideos.push(video)
          $scope.videoIndex++
          $scope.playVideoAtIndex($scope.videoIndex)
        }).
        error(function(data, status, headers, config) {})
    }

    $scope.playVideoAtIndex = function(videoIndex){
      console.log(videoIndex, $scope.playedVideos.length)
      var vid = $scope.playedVideos[videoIndex]
      $scope.playVideo(vid)
    }

    $scope.playVideo = function(vid){
      $scope.currentVideo = vid
      console.log("playing", vid)
      videoPlayer.src=vid.url
      videoPlayer.play()
      //$scope.player.loadVideoById(vid.videoId)
    }

    $scope.prevVideo = function(){
      if($scope.videoIndex>0){
        $scope.videoIndex--
        $scope.playVideoAtIndex($scope.videoIndex)
        console.log("previous video!")
      }
    }

    $scope.togglePause = function() {
      if(videoPlayer.currentTime > 0 && !videoPlayer.paused && !videoPlayer.ended){
        videoPlayer.pause()
        $('#blurb').fadeIn(200)
      }else {
        videoPlayer.play()
        $('#blurb').fadeOut(200)
      }
    }

    $scope.keyPressed = function($event){
        console.log($event.which)
        if($event.which==PAUSE_KEY){
          $scope.togglePause()
        }
        if(nextKeys.indexOf($event.which) >= 0){
            $scope.nextVideo()
        }else if(prevKeys.indexOf($event.which) >= 0){
            $scope.prevVideo()
        }
    }

    videoPlayer.onended = function(){
      $scope.nextVideo()
    }
    $scope.nextVideo()

    lastBumperTime = +new Date()
})
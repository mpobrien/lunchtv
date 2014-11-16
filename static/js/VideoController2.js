var lunchtv = angular.module('lunchtv', [])
lunchtv.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});

bumpers = [
  {"videoId":"3YssYJUNkXo"},
  {"videoId":"e3l0BQff2Co"},
  {"videoId":"Ys69g1sPHAo"},
  {"videoId":"y8JlkI2Fu_U"},
  {"videoId":"t_flfX6_7xY"},
  {"videoId":"3saHUMoUznE"},
]
PAUSE_KEY = 32
var bumperThreshold = 60 * 3 * 1000 // play a bumper every 3 minutes
//var bumperThreshold = 10 * 1000
var lastBumperTime = -Infinity

BUMPER_INDEX = -1
 BUMPER_INTERVAL = 5

nextKeys = [ 121, 104, 98, 117, 106, 105, 107, 109, 111,
             108, 44, 112, 59, 46, 91, 39, 47, 93, 13 ]
prevKeys = [ 113, 119, 101, 114, 116, 49, 50, 51, 52, 53,
             115, 100, 102, 103, 122, 120, 99, 118, 98, 97 ]

lunchtv.controller('VideoController', function($scope, $window, $http) {
    var done = false;
    $scope.playedVideos = []
    //$scope.videos = $window.videoIds
    //$scope.videos.unshift({"videoId": "3YssYJUNkXo"})
    $scope.videoIndex = -1
    $scope.bumpered = true

    $scope.nextVideo = function(){
      if($scope.videoIndex+1 == $scope.playedVideos.length){
        //Time to play a bumper?
        console.log(+new Date(), lastBumperTime, bumperThreshold)
        if((+new Date()) - lastBumperTime > bumperThreshold){
          console.log("playing bumper!")
          $scope.playVideo(bumpers[++BUMPER_INDEX % bumpers.length])
          lastBumperTime = +new Date()
          $scope.bumpered = true
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
    }

    $scope.playVideoAtIndex = function(videoIndex){
      console.log(videoIndex, $scope.playedVideos.length)
      var vid = $scope.playedVideos[videoIndex]
      $scope.playVideo(vid)
    }

    $scope.playVideo = function(vid){
      $scope.currentVideo = vid
      console.log("playing", vid.details)
      $scope.player.loadVideoById(vid.videoId)
    }

    $scope.prevVideo = function(){
      if($scope.videoIndex>0){
        $scope.videoIndex--
        $scope.playVideoAtIndex($scope.videoIndex)
        console.log("previous video!")
      }
    }

    $scope.togglePause = function() {
      var state = $scope.player.getPlayerState()
      if(state==YT.PlayerState.PLAYING){
        $scope.player.pauseVideo()
        $scope.isPaused = true
        $('#blurb').fadeIn(200)
      }else if(state==YT.PlayerState.PAUSED){
        $scope.player.playVideo()
        $scope.isPaused = false
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

    $scope.onPlayerReady = function(event){
        event.target.playVideo();
    }

    $scope.onPlayerStateChange = function(event){
        if(event.data == YT.PlayerState.ENDED){
            $scope.nextVideo()
        }
    }

    $scope.setupVideo = function(video){
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        $window.onYouTubeIframeAPIReady = function() {
            $scope.player = new YT.Player('player', {
                height: '100%',
                width: '100%',
                videoId:video.videoId,
                playerVars:{
                    iv_load_policy:3,
                    controls:0,
                    modestbranding:1,
                    showinfo:0,
                    rel:0
                },
                events: {
                    'onReady': $scope.onPlayerReady,
                    'onStateChange': $scope.onPlayerStateChange
                }
            });
        }
    }

    $scope.setupVideo({"videoId": "3YssYJUNkXo"})
    lastBumperTime = +new Date()

})

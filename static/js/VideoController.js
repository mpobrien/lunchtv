BUMPER_INTERVAL = 10
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

nextKeys = [ 121, 104, 98, 117, 106, 105, 107, 109, 111,
             108, 44, 112, 59, 46, 91, 39, 47, 93, 13 ]

lunchtv.controller('VideoController', function($scope, $window) {
    var done = false;
    $scope.videos = $window.videoIds
    $scope.videos.unshift({"videoId": "3YssYJUNkXo"})
    $scope.currentPos = 0
    $scope.infoFadeTimeout =null
    $scope.bumperCounter = 0
    $scope.bumperNext = 0
    $scope.player = null

    setInterval(function(){
      if($scope.player != null && 
         $scope.player.getPlayerState() == YT.PlayerState.PLAYING 
         && $scope.player.getDuration() > 0
         && ($scope.player.getDuration() - $scope.player.getCurrentTime() <= 5)) {
         $scope.doFadeInfo(true)
      }
    }, 1000)

    // 4. The API will call this function when the video player is ready.
    $scope.onPlayerReady = function(event){
        event.target.playVideo();
    }

    $scope.doFadeInfo = function(fadein){
      if(fadein){
        $('#blurb').fadeIn(1000)
      }else{
        $('#blurb').fadeIn(0)
      }
      if($scope.infoFadeTimeout){
        clearTimeout($scope.infoFadeTimeout)
      }
      $scope.infoFadeTimeout = setTimeout(function(){
        $('#blurb').fadeOut(1000)
      }, 5000)
    }

    $scope.nextVideo = function(){
      $scope.bumperCounter = ($scope.bumperCounter + 1) % BUMPER_INTERVAL
      if($scope.bumperCounter == 0){
        $scope.bumperNext = ($scope.bumperNext+1) % bumpers.length
        nextVideo = bumpers[$scope.bumperNext]
        nextVideoId = nextVideo.videoId
        $scope.currentVideo = nextVideo
      }else{
        nextVideo = $scope.videos[++$scope.currentPos]
        nextVideoId = nextVideo.videoId
        $scope.currentVideo = nextVideo
      }
      $scope.player.loadVideoById(nextVideoId)//, 5, "large")
      $scope.doFadeInfo()
    }
    $scope.onPlayerStateChange = function(event){
        if(event.data == YT.PlayerState.ENDED){
            console.log("going to next video")
            $scope.nextVideo()
            console.log($scope.currentVideo)
            $scope.$apply()
        }
    }

    $scope.stopVideo = function(){
        player.stopVideo();
    }

    $scope.launchFirstVideo = function(video){
        $scope.currentVideo = video
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        $scope.doFadeInfo()
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

    $scope.keyPressed = function($event){
        console.log($event, $event.which)
        if($event.which==32){
          var state = $scope.player.getPlayerState()
          if(state==YT.PlayerState.PLAYING){
            $scope.player.pauseVideo()
          }else if(state==YT.PlayerState.PAUSED){
            $scope.player.playVideo()
          }
          return
        }
        if(nextKeys.indexOf($event.which) >= 0){
            $scope.nextVideo()
        }
    }

    $scope.launchFirstVideo($scope.videos[$scope.currentPos])
})



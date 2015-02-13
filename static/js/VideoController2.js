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
var bumperThreshold = 60 * 1.5 * 1000 // play a bumper every 1.5 minutes
//var bumperThreshold = 10 * 1000
var lastBumperTime = -Infinity

BUMPER_INDEX = -1
 BUMPER_INTERVAL = 5

prevKeys = [ 81, 87, 69, 82, 84, 65, 83, 68, 70, 90, 88, 67, 86, 49, 50, 51, 52, 53, 37]
nextKeys = [ 48, 57, 56, 55, 54, 80, 79, 73, 85, 89, 76, 75, 74, 72, 71, 222, 191, 190, 188, 77, 78, 66, 39, 13]

function shuffle(array) {
    var counter = array.length, temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

lunchtv.controller('VideoController', function($scope, $window, $http) {
    var bumpers = shuffle($window.bumpers)
    var done = false;
    $scope.playedVideos = []
    $scope.videoIndex = -1
    $scope.bumpered = true
    videoPlayer = document.getElementById('videoPlayer')
    var newuser = $window.newuser

    var bumperPos = 0
    for(var i=0;i<bumpers.length;i++){
      if(bumpers[i].intro){
        bumperPos = i
        break
      }
    }
    if(newuser){
      BUMPER_INDEX = bumperPos-1
    }

    $scope.nextVideo = function(){
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
      /*$http({method: 'GET', url: '/next'}).
        success(function(data, status, headers, config) {
          console.log("not playing bumper!")
          var video = data
          $scope.playedVideos.push(video)
          $scope.videoIndex++
          $scope.playVideoAtIndex($scope.videoIndex)
        }).
        error(function(data, status, headers, config) {})
        */
    }

    $scope.playVideoAtIndex = function(videoIndex){
      console.log(videoIndex, $scope.playedVideos.length)
      var vid = $scope.playedVideos[videoIndex]
      $scope.playVideo(vid)
    }

    $scope.playVideo = function(vid){
      $scope.currentVideo = vid
      console.log("playing", vid)
      //videoPlayer.autoplay = true
      videoPlayer.src=vid.url
      videoPlayer.autobuffer = "auto"
      videoPlayer.preload = true
      videoPlayer.load()
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
        console.log("key code",$event.which)
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

    nextEvent = +new Date()

    function checkin(){
      timeSince = +new Date() - nextEvent
      nextEvent = +new Date()
      return timeSince
    }


    videoPlayer.onemptied = function(){
      console.log("onemptied", checkin());
    }
    videoPlayer.onloadedmetadata = function(){
      console.log("onloadedmetadata", checkin());
    }
    videoPlayer.onloadeddata = function(){
      console.log("onloadeddata", checkin());
    }
    videoPlayer.oncanplay = function(){
      console.log("oncanplay", checkin());
    }
    videoPlayer.oncanplaythrough = function(){
      console.log("oncanplaythrough", checkin());
    }
    videoPlayer.onplaying = function(){
      console.log("onplaying", checkin());
    }
    videoPlayer.onwaiting = function(){
      console.log("onwaiting", checkin());
    }

    videoPlayer.ondurationchange = function(){
      console.log("ondurationchange", checkin());
    }
    videoPlayer.ontimeupdate = function(){
      checkin()
    }
    videoPlayer.onplay = function(){
      console.log("onplay", checkin());
    }
    videoPlayer.onpause = function(){
      console.log("onpause", checkin());
    }
    videoPlayer.onratechange = function(){
      console.log("onratechange", checkin());
    }
    videoPlayer.onvolumechange = function(){
      console.log("onvolumechange", checkin());
    }

    $scope.nextVideo()

    lastBumperTime = +new Date()
})

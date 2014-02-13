var lunchtv = angular.module('lunchtv', [])
lunchtv.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});
lunchtv.controller('VideoController', function($scope, $window) {
    var done = false;
    $scope.videos = $window.videoIds
    $scope.currentPos = 0

    // 4. The API will call this function when the video player is ready.
    $scope.onPlayerReady = function(event){
        
        event.target.playVideo();
    }

    $scope.nextVideo = function(){
        nextVideo = $scope.videos[++$scope.currentPos]
        nextVideoId = nextVideo.videoId
        $scope.currentVideo = nextVideo
        console.log("launching next video", nextVideoId)
        $scope.player.loadVideoById(nextVideoId)//, 5, "large")
    }
    $scope.onPlayerStateChange = function(event){
        if(event.data == YT.PlayerState.ENDED){
            $scope.nextVideo()
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
        console.log("here", $event)
        if($event.which == 110){
            $scope.nextVideo()
        }
    }

    $scope.launchFirstVideo($scope.videos[$scope.currentPos])
})



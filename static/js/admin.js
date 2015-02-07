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

  $scope.showuploader = function(){
    $scope.uploadenabled = true
  }

  $scope.remove = function(v){
    if(confirm('delete this video - you sure?')){
      $http.delete('/admin/video/' + v._id)
      $scope.allvids = _.without($scope.allvids, _.findWhere($scope.allvids, {_id:v._id}));
    }
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

  $scope.uploadFiles = function(event) {
    event.stopPropagation(); 
    event.preventDefault(); 
    var data = new FormData();
    fileobj = $('input[type=file]').get(0).files[0]
    data.append("key", "uploads/${filename}")
    data.append("AWSAccessKeyId", "AKIAI7CP6GPX7NGZU2SA")
    data.append("acl", "public-read")
    data.append("policy", $window.policy)
    data.append("signature", $window.signature)
    data.append("Content-Type", "video/mp4")
    data.append("file", fileobj)

    $scope.uploading=true
    $.ajax({
      url: 'https://lunchvids.s3.amazonaws.com/',
      type: 'POST',
      data: data,
      crossDomain: true,
      cache: false,
      xhr: function() {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener("progress", function(evt){
          if (evt.lengthComputable) {
            var pct = (evt.loaded / evt.total) * 100;
            $scope.percentComplete = pct.toFixed(2)
            console.log($scope.percentComplete)
            $scope.$digest()
          }
        }, false);
        return xhr;
      },
      processData: false,
      contentType: false, // Set content type to false as jQuery will tell the server its a query string request
      success: function(data, textStatus, jqXHR) {
        $scope.vid.url = "https://lunchvids.s3.amazonaws.com/uploads/" + encodeURIComponent(fileobj.name)
        $scope.uploading=false
        $scope.$digest()
        console.log("success!", "https://lunchvids.s3.amazonaws.com/uploads/" + encodeURIComponent(fileobj.name))
      },
      error: function(jqXHR, textStatus, errorThrown) {
        alert("Error uploading: ", textStatus)
      }
     });
  }
}


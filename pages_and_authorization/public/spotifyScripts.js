(function() {
    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
      var hashParams = {};
      var e, r = /([^&;=]+)=?([^&;]*)/g,
          q = window.location.hash.substring(1);
      while ( e = r.exec(q)) {
         hashParams[e[1]] = decodeURIComponent(e[2]);
      }
      return hashParams;
    }

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    if (error) {
      alert('There was an error during the authentication');
    } else {
      if (access_token) {
          getPlaylists();
      } else {
          // render initial screen
          $('#login').show();
          $('#loggedin').hide();
      }
    }

    function getPlaylists(){
        $.ajax({
            url: 'https://api.spotify.com/v1/me/playlists',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
                $('#login').hide();
                $('#loggedin').show();

                let loggedinContainer = document.getElementById("loggedin");
                var playlistList = document.createElement("UL");
                var playlistArr = Object.values(response)[1];
                
                for(let i = 0; i < playlistArr.length; i++){
                    console.log(playlistArr[i]);
                    var listItem = document.createElement("LI");
                    listItem.setAttribute('class', 'playlist');
                    listItem.innerHTML = playlistArr[i].name;
                    listItem.onclick = function(){
                        console.log(playlistArr[i].id);
                        loggedinContainer.removeChild(playlistList);
                        getTracksFromPlaylist(playlistArr[i].id);
                    }
                    playlistList.appendChild(listItem);
                }
                playlistList.style.padding = "5px";
                loggedinContainer.appendChild(playlistList);
            },
            error: function(response) {
                console.log("error")
            }
        });
    }

    function getTracksFromPlaylist(playlistId){
        $.ajax({
            url: 'https://api.spotify.com/v1/playlists/' + playlistId + '/tracks',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function(response) {
                let loggedinContainer = document.getElementById("loggedin");
                var trackList = document.createElement("UL");
                var tracks = Object.values(response)[1];
                for(let i = 0; i < tracks.length; i++){
                    var listItem = document.createElement("LI");
                    let text = tracks[i].track.name + " –- " + tracks[i].track.artists[0].name;
                    listItem.innerHTML = text;
                    listItem.setAttribute('class', 'track');
                    console.log(tracks[i].track);
                    trackList.appendChild(listItem);
                }
                
                var backButton = document.createElement("button");
                backButton.setAttribute('class', 'menuButton');
                backButton.innerHTML = "<-- Back";
                backButton.onclick = function(){
                    loggedinContainer.removeChild(trackList);
                    loggedinContainer.removeChild(backButton);
                    loggedinContainer.removeChild(sortButton);
                    getPlaylists();
                }
                loggedinContainer.appendChild(backButton);

                var sortButton = document.createElement("button");
                sortButton.setAttribute('class', 'menuButton');
                sortButton.innerHTML = "Check Answers";
                sortButton.onclick = function(){
                    sortButton.disabled = true;
                    sortButton.setAttribute('class', 'disabledButton');

                    let oldArr = trackList.children;
                    console.log(oldArr);

                    tracks.sort(function(a, b){
                        return b.track.popularity - a.track.popularity;
                    });

                    var correctArr = new Array();

                    for(let i = 0; i < tracks.length; i++){
                        console.log(tracks[i].track.name + " , " + oldArr[i].innerHTML);
                        if(tracks[i].track.name + " –- " + tracks[i].track.artists[0].name == oldArr[i].innerHTML){
                            console.log("Good");
                            correctArr[i] = true;
                        }
                        else{
                            console.log("No");
                            correctArr[i] = false;
                        }
                    }

                    while (trackList.firstChild) {
                        trackList.removeChild(trackList.firstChild);
                    }

                    for(let i = 0; i < tracks.length; i++){
                        var listItem = document.createElement("LI");
                        let text = tracks[i].track.name + " –- " + tracks[i].track.artists[0].name + " -- [POPULARITY: " + tracks[i].track.popularity + "]";
                        listItem.innerHTML = text;
                        if(correctArr[i]){
                            listItem.setAttribute('class', 'correctAnswer');
                        }
                        else{
                            listItem.setAttribute('class', 'wrongAnswer');
                        }
                        trackList.appendChild(listItem);
                    }
                    trackList.removeAttribute('id');
                    trackList.setAttribute('id', 'tracklistStatic');
                }
                loggedinContainer.appendChild(sortButton);
                
                trackList.style.padding = "5px";
                trackList.setAttribute('id', 'tracklistSortable');
                loggedinContainer.appendChild(trackList);
            },
            error: function(response) {
                console.log("error")
            }
        });
    }
  })();
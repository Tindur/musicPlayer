(function($) {
	$.fn.musicPlayer = function ( playlist, userOptions) {
		var defaultOptions = { autoplay: false,
							   defaultVolume: 100,
							   spongebob: false,
							   playlist: false}
	   	var options = $.extend( defaultOptions, userOptions);

		return this.each( function () {
			var mainDiv = $("<div></div>").attr("id", "player");
			var controlsDiv = $("<div></div>").attr("id", "controls");
			var musicplayer = $("<audio></audio>").attr("id", "audio-player");
			var songInfo = $("<p></p>").attr("id", "song-info").html("Stopped");
			var timeInterval = $("<p></p>").attr("id", "time-interval").html("0:00");

			$(mainDiv).append(controlsDiv);
			$(mainDiv).append(musicplayer);
			$(mainDiv).append(songInfo);
			$(mainDiv).append(timeInterval);
			$(this).append(mainDiv);

			var audioelem = $("#audio-player")[0];
			var playlistLength = playlist.length;
			var playing = false;
			var currentSong = 0;
			var muted = false;
			var interval;
			audioelem.src = playlist[currentSong];
			audioelem.volume = options.defaultVolume*0.01;
			var playButton;
			var prevButton;
			var nextButton;
			var muteButton;
			var stopButton;

			if (options.spongebob === true) {
				playButton = $("<button></button>").attr("id", "play").attr("class", "buttons");
				stopButton = $("<button></button>").attr("id", "stop").attr("class", "buttons");
				prevButton = $("<button></button>").attr("id", "prev").attr("class", "small-buttons");
				var special = $("<div></div>").attr("id", "squidward");
				nextButton = $("<button></button>").attr("id", "next").attr("class", "small-buttons");
				var volumeDiv = $("<div></div>").attr("id", "volume");
				var volumeCtrl = $("<input/>").attr("type", "range").attr("value", options.defaultVolume).attr("id", "volume-control");
				var trackDiv = $("<div></div>").attr("id", "track");
				var track = $("<div></div>").attr("id", "track-position");

				$(controlsDiv).append(playButton);
				$(controlsDiv).append(stopButton);
				$(controlsDiv).append(prevButton);
				$(controlsDiv).append(special);
				$(controlsDiv).append(nextButton);
				$(controlsDiv).append(volumeDiv);
				$(volumeDiv).append(volumeCtrl);
				$(controlsDiv).append(trackDiv);
				$(controlsDiv).append(track);

			}
			else {
				prevButton = $("<button></button>").attr("id", "prev");
				playButton = $("<button></button>").attr("id", "play");
				nextButton = $("<button></button>").attr("id", "next");
				muteButton = $("<button></button>").attr("id", "mute");
				stopButton = $("<button></button>").attr("id", "stop");
				var special = $("<div></div>").attr("id", "band-image");
				$(controlsDiv).append(prevButton);
				$(controlsDiv).append(playButton);
				$(controlsDiv).append(nextButton);
				$(controlsDiv).append(muteButton);
				$(controlsDiv).append(stopButton);
				$(controlsDiv).append(special);

				var progressDiv = $("<div></div>").attr("id", "seeker")
				var progressBar = $("<progress></progress>").attr("id", "seek").attr("value","0").attr("max", "100");
				$(mainDiv).append(progressDiv);
				$(progressDiv).append(progressBar);

				if(options.playlist === true) {
					var playlistDiv = $("<div></div>").attr("id", "playlist");
					var playlistTable = $("<table><thead><tr><th>#</th><th>Song</th></tr></thead></table>");
					var playlistBody = $("<tbody></tbody>");

					$(this).append(playlistDiv);
					$(playlistDiv).append(playlistTable);
					$(playlistTable).append(playlistBody);

					for (var i = 0; i < playlist.length; i++) {
						var songname = modifySongName(playlist[i]);
						$(playlistBody).append("<tr><td>" + (i+1) + "</td><td class=\"playlistSong\" id=\"song_" + i + "\">" + songname +  "</td></td></tr>");
					}
					$(this).append(playlistDiv);					
				}				
			}

			if(options.autoplay === true) {
				$(musicplayer).attr("autoplay", "autoplay");
				startPlaying();
			}

			$(playButton).click( function() {
				startPlaying();
			});
			$(prevButton).click( function() {
				unTrackTime()
				if (currentSong > 0 ) {
					audioelem.src = playlist[--currentSong];
				}
				else {
					audioelem.currentTime = 0;
				}
				if (options.spongebob === true) {
						$("#play").css("background-image", "url(\"musicPlayer/css/sponge/pause.png\")");
					}
				else {
					setAlbumArtwork(playlist[currentSong]);
					$("#play").css("background-image", "url(\"musicPlayer/css/base/pause.png\")");
				}
				audioelem.play();
				playing = true;
				durationOfSong = audioelem.duration;
				$("#song-info").html(modifySongName(playlist[currentSong]));
				trackTime();
			});
		   	$(nextButton).click( function() {
		   		unTrackTime()
				if (currentSong < playlist.length-1) {
					audioelem.src = playlist[++currentSong];
				}
				else {
					audioelem.currentTime = 0;
				}
				if (options.spongebob === true) {
						$("#play").css("background-image", "url(\"musicPlayer/css/sponge/pause.png\")");
					}
				else {
					setAlbumArtwork(playlist[currentSong]);
					$("#play").css("background-image", "url(\"musicPlayer/css/base/pause.png\")");
				}
				audioelem.play();
				playing = true;
				durationOfSong = audioelem.duration;
				$("#song-info").html(modifySongName(playlist[currentSong]));
				trackTime();
			});
			$(stopButton).click( function() {
				unTrackTime();
				audioelem.pause();
				audioelem.currentTime = 0;
				playing = false;
				interval = window.clearInterval(interval);
				$("#time-interval").html("0:00");
				$("#song-info").html("Stopped");
				if (options.spongebob === true) {
					$("#play").css("background-image", "url(\"musicPlayer/css/sponge/play.png\")");
					$("#track-position").css('left', 470);
				}
				else {
					$("#play").css("background-image", "url(\"musicPlayer/css/base/play.png\")");
					$("#seek").attr("value", 0)
				}
			});
			$("#volume-control").change( function() {
				audioelem.volume = this.value*0.01;
			});
			$(muteButton).click( function() {
				if (muted === false) {;
					audioelem.volume = 0;
					muted = true;
					$("#mute").css("background-image", "url(\"musicPlayer/css/base/mute.png\")");
				}
				else {
					audioelem.volume = options.defaultVolume * 0.01;
					muted = false;
					$("#mute").css("background-image", "url(\"musicPlayer/css/base/sound.png\")");
				}
			});
			$(audioelem).bind("ended", function() {
				audioelem.src = playlist[++currentSong];
				audioelem.play();
			});
			$(".playlistSong").click( function() {
				unTrackTime();
				var songNumber = $(this).attr("id");
				songNumber = songNumber.split("_");
				songNumber = songNumber[1];
				currentSong = parseInt(songNumber);
				audioelem.src = playlist[currentSong];
				$("#song-info").html(modifySongName(playlist[currentSong]));
				audioelem.play();
				playing = true;
				setAlbumArtwork(playlist[currentSong]);
				trackTime();
			});
			$("#seek").click( function() {
				var x = event.pageX - document.getElementById("seeker").offsetLeft;
				var seek = x*audioelem.duration/197;
				audioelem.currentTime = seek;
				console.log(audioelem.duration, typeof(audioelem.duration));
				console.log(seek);

			});

			function setAlbumArtwork (songName) {
				var image;
				$.ajax({
					dataType: "json",
					url: "http://developer.echonest.com/api/v4/song/search?api_key=8FKBXM9UQKPYPEYJ8&format=json&results=1&combined=" + songName + "&bucket=id:7digital-US&bucket=tracks",
					data: null,
					success: function(data) {
						console.log(data);
						image = data.response.songs[0].tracks[0].release_image;
						if (image !== '') {
							$("#band-image").css("background-image", "url(\""+image+"\")");
						}
					}
				});	
			}

			function trackTime() {
				interval = setInterval(function() {
						var time = new Date(null);
						time.setSeconds(audioelem.currentTime);
						var songLength = new Date(null);
						songLength.setSeconds(audioelem.duration);
						$("#time-interval").html(time.toTimeString().substr(4, 4) + "/" + songLength.toTimeString().substr(4,4));
						if (options.spongebob === true) {
							console.log("moving snail");
							var position = (315/audioelem.duration)*audioelem.currentTime;
							$("#track-position").css('left', 470+position);
						}
						else {
							var position = audioelem.currentTime/audioelem.duration*100;
							console.log(position);
							$("#seeker").children().attr("value",position);
						}
					},1000);
			}

			function unTrackTime() {
				interval = window.clearInterval(interval);
			}

			function modifySongName(songName) {
				if (songName.length > 35) {
					var shortSongName = songName.substr(0, 33) + "...";
					return shortSongName
				}
				return songName;
			}

			function startPlaying() {
				if (playing === false) {
					audioelem.play();
					playing = true;
					$("#song-info").html(modifySongName(playlist[currentSong]));
					if (options.spongebob === true) {
						$("#play").css("background-image", "url(\"musicPlayer/css/sponge/pause.png\")");
					}
					else {
						setAlbumArtwork(playlist[currentSong]);
						$("#play").css("background-image", "url(\"musicPlayer/css/base/pause.png\")");
					}
					trackTime();
				}
				else {
					audioelem.pause();
					playing = false;
					if (options.spongebob === true) {
						$("#play").css("background-image", "url(\"musicPlayer/css/sponge/play.png\")");
					}
					else {
						$("#play").css("background-image", "url(\"musicPlayer/css/base/play.png\")");
					}
					unTrackTime();
				}
			}
		});
	};

})(jQuery);
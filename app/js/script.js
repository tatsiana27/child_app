(function($){
	var APP = {
		config: {
			srcApi: 'http://www.youtube.com/iframe_api',
			player: 'placeholder',
			youtube:  {
				ready: false,
				player: null,
				playerId: null,
				videoId: null,
				videoTitle: null,
				playerHeight: '360',
				playerWidth: '640',
				state: 'stopped'
			},
			history: [{
				id: 'HTL3dDsGP7M',
				title: ' Top 10 cartoons 2015!'
			}],
			videos_url: 'data/popularVideos.json'
		},

		init: function(){
			var tag = $('<script></script>', {
					src: this.config.srcApi
				}),
				self = this;

			tag.insertAfter($('head').find('script').first());

			window.onYouTubeIframeAPIReady = function () {
				console.log('Youtube API is ready');
				self.config.youtube.ready = true;
				self.bindPlayer(self.config.player);
				self.loadPlayer();
			};

			this.getPopularVideos(this.config.videos_url);
			this.addEvents();
		},

		bindPlayer: function(elementId) {
			this.config.youtube.playerId = elementId;
		},

		loadPlayer: function() {
			var youtube = this.config.youtube;
			if (youtube.ready && youtube.playerId) {
				if (youtube.player) {
					youtube.player.destroy();
				}
				youtube.player = this.createPlayer();
			}
		},

		createPlayer: function() {
			var youtube = this.config.youtube,
				self = this;

			return new YT.Player(youtube.playerId, {
				title: youtube.videoTitle,
				height: youtube.playerHeight,
				width: youtube.playerWidth,
				playerVars: {
					rel: 0,
					showinfo: 0
				},
				events: {
					'onReady': function() {
						self.onYoutubeReady(self);
					},
					'onStateChange': function(e) {
						self.onYoutubeStateChange(e, self);
					}
				}
			});
		},

		onYoutubeReady: function(self) {
			var history = self.config.history[0],
				youtube = self.config.youtube;
			console.log('YouTube Player is ready');

			youtube.player.cueVideoById(history.id);
			youtube.videoId = history.id;
			youtube.videoTitle = history.title;
			self.updatePlayerInformation(history.title);
		},

		onYoutubeStateChange: function(event, self) {
			var youtube = self.config.youtube;
			if (event.data == YT.PlayerState.PLAYING) {
				youtube.state = 'playing';
			} else if (event.data == YT.PlayerState.PAUSED) {
				youtube.state = 'paused';
			} else if (event.data == YT.PlayerState.ENDED) {
				youtube.state = 'ended';
				//service.launchPlayer(upcoming[0].id, upcoming[0].title);
				//service.archiveVideo(upcoming[0].id, upcoming[0].title);
				//service.deleteVideo(upcoming, upcoming[0].id);
			}
		},

		updatePlayerInformation: function(title, description) {
			$('.player').find('.title').text(title);
		},

		getPopularVideos: function(url) {
			var self = this;

			$.getJSON(url, function(data) {
				var items = [];

				$.each(data, function(key, obj) {
					items.push({
						id: obj.id.videoId,
						title: obj.snippet.title,
						img: obj.snippet.thumbnails.default.url,
						description: obj.snippet.description
					});
				});
				self.generateVideoList(items);
			});

		},
		generateVideoList: function(items) {
			var list = $('.popular_videos ul'),
				max = items.length,
				html = '',
				i;
			for (i=0; i<max; i+=1) {
				html += '<li><a class="item" data-id-item=' + items[i].id + ' href="#"><img src=' + items[i].img + '>';
				html += '<h2 class="title">' + items[i].title + '</h2>';
				html += '<p class="description">' + items[i].description + '</p></a></li>';
			}
			list.html(html);
		},

		launchPlayer: function(id, title, description) {
			var youtube = this.config.youtube;

			youtube.player.loadVideoById(id);
			youtube.videoId = id;
			youtube.videoTitle = title;

			this.updatePlayerInformation(title, description);
		},

		addEvents: function(){
			var self = this;
			$(document).on('click', 'img', function(e) {
				var $this = $(this),
					link = $this.parent(),
					title = link.find('.title').text(),
					description = link.find('.description').text();

				self.launchPlayer(link.data('idItem'), title, description);
			})
			.on('submit','form', function(e){
				var $this = $(this),
					data = {},
					params = {},
					url = "https://www.googleapis.com/youtube/v3/search";
				e.preventDefault();
				$.map($this.serializeArray(), function(n){
					data[n['name']] = n['value'];
				});

				params = {
					key: 'AIzaSyCw_esIizM0zULkoQlpjLUb0jQ25qBr3eI',
					type: 'video',
					maxResults: '50',
					part: 'id,snippet',
					fields: 'items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle',
					q: data.q
				};
				url = url + '?fields=items/id,items/snippet/title,items/snippet/description,items/snippet/thumbnails/default,items/snippet/channelTitle';
				url = url + '&key=AIzaSyCw_esIizM0zULkoQlpjLUb0jQ25qBr3eI';
				url = url + '&maxResults=50&part=id,snippet&&type=video';

				$.getJSON(url + '&q=' + data.q, function(json) {
					var count = 0,
						$results = $('.search_result');

					if (json.items) {
						var items = json.items,
							html = '';

						items.forEach(function (item) {
							html += '<li><a href="#" data-id-item =' + item.id.videoId + '>';
							html += '<img src="' + item.snippet.thumbnails.default.url +'">';
							html += '<h2 class="title">' + item.snippet.title + '</h2></a></li>';
							count++;
						});
					}

					if (count === 0) {
						$results.html("No videos found");
					} else {
						$results.html(html);

						if($('.search_result').find('li').length) {
							$('.jcarousel').jcarousel({
								vertical: true,
								start:1,
								offset:1,
								scroll: 1,
								size:10,
								wrap:null
							});
							$('.jcarousel-prev').addClass('visible');
							$('.jcarousel-next').addClass('visible');

							$('.jcarousel-prev')
								.on('jcarouselcontrol:active', function() {
									$(this).removeClass('inactive');
								})
								.on('jcarouselcontrol:inactive', function() {
									$(this).addClass('inactive');
								})
								.jcarouselControl({
									target: '-=1'
								});

							$('.jcarousel-next')
								.on('jcarouselcontrol:active', function() {
									$(this).removeClass('inactive');
								})
								.on('jcarouselcontrol:inactive', function() {
									$(this).addClass('inactive');
								})
								.jcarouselControl({
									target: '+=1'
							});
						}
					}
				});
			});
		}
	};
	APP.init();
})(jQuery);
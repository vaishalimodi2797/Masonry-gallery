(function ($) {
    /*================================
		        photoSwipe gallery
	==================================*/
	var $body = $('body');

	function initPhotoSwipe() {
		if (typeof PhotoSwipe !== 'undefined') {

			//will leave only .photoswipe-link later
			var gallerySelectors = '.photoswipe-link, a[data-gal^="prettyPhoto"], [data-thumb] a';
			var $galleryLinks = $(gallerySelectors);
			if ($galleryLinks.length) {

				//adding photoswipe gallery markup
				if (!($('.pswp').length)) {
					$body.append('<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true"><div class="pswp__bg"></div><div class="pswp__scroll-wrap"><div class="pswp__container"><div class="pswp__item"></div><div class="pswp__item"></div><div class="pswp__item"></div></div><div class="pswp__ui pswp__ui--hidden"><div class="pswp__top-bar"><div class="pswp__counter"></div><a class="pswp__button pswp__button--close" title="Close (Esc)"></a><a class="pswp__button pswp__button--share" title="Share"></a><a class="pswp__button pswp__button--fs" title="Toggle fullscreen"></a><a class="pswp__button pswp__button--zoom" title="Zoom in/out"></a><div class="pswp__preloader"><div class="pswp__preloader__icn"><div class="pswp__preloader__cut"><div class="pswp__preloader__donut"></div></div></div></div></div><div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"><div class="pswp__share-tooltip"></div> </div><a class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></a><a class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></a><div class="pswp__caption"><div class="pswp__caption__center"></div></div></div></div></div>');
					//if function already was called - return (all listeners was setted and .pswp gallery container was added)
				} else {
					return;
				}
				//adding prettyPhoto for backward compatibility. Deprecated.
				$('body').on('click', gallerySelectors, function (e) {
					e.preventDefault();

					var $link = $(this);
					var $linksParentContainer = $link.closest('.photoswipe-container, .isotope-wrapper, .owl-carousel, .images');
					var $links = $linksParentContainer.find(gallerySelectors);
					//if no container only adding this link
					if (!$links.length) {
						$links.push($link);
					}
					var items = [];
					var options = {
						bgOpacity: 0.7,
						showHideOpacity: true,
						history: false,
						shareEl: false,
						//data index is set in owl carousel init
						index: $link.data('index') ? $link.data('index') : 0
					};
					var gallery = $('.pswp')[0];
					//building items array
					$links.each(function (i) {
						var $this = $(this);
						//if cloned element (owl or flexslider thumbs) - continue
						if ($this.closest('.clone, .cloned').length) {
							return;
						}
						var item = {};
						//if not owl carousel
						if (($link[0] === $this[0]) && !($link.data('index'))) {
							//start from 0
							if ($linksParentContainer.hasClass('owl-carousel') || $linksParentContainer.hasClass('images')) {
								options.index = i - 1;
							} else {
								options.index = i;
							}
						}
						//video or image
						if ($this.data('iframe')) {
							//autoplay only if 1 iframe in gallery
							var autoplay = ($links.length > 1) ? '' : '&autoplay=1';
							item.html = '<div class="embed-responsive embed-responsive-16by9">';
							// item.html += '<iframe class="embed-responsive-item" src="'+ $(this).data('iframe') + '?rel=0&autoplay=1'+ '"></iframe>';
							item.html += '<iframe class="embed-responsive-item" src="' + $(this).data('iframe') + '?rel=0' + autoplay + '&enablejsapi=1&api=1"></iframe>';
							item.html += '</div>';
						} else {
							item.src = $this.attr('href');
							//default values
							var width = 1170;
							var height = 780;
							//template data on A element
							var data = $this.data();
							//image data in Woo
							var dataImage = $this.find('img').first().data();
							if (data.width) {
								width = data.width;
							}
							if (data.height) {
								height = data.height;
							}
							if (typeof dataImage !== 'undefined') {
								if (dataImage.large_image_width) {
									width = dataImage.large_image_width;
								}
								if (dataImage.large_image_height) {
									height = dataImage.large_image_height;
								}
							}
							item.w = width;
							item.h = height;
						}
						items.push(item);
					});

					var pswpGallery = new PhotoSwipe(gallery, PhotoSwipeUI_Default, items, options);
					pswpGallery.init();

					//pausing video on close and on slide change
					pswpGallery.listen('afterChange', function () {
						$(pswpGallery.container).find('iframe').each(function () {
							//"method":"pause" - form Vimeo, other - for YouTube
							$(this)[0].contentWindow.postMessage('{"method":"pause","event":"command","func":"pauseVideo","args":""}', '*')
						});
					});
					pswpGallery.listen('close', function () {
						$(pswpGallery.container).find('iframe').each(function () {
							//"method":"pause" - form Vimeo, other - for YouTube
							$(this)[0].contentWindow.postMessage('{"method":"pause","event":"command","func":"pauseVideo","args":""}', '*')
						});
					});

				});
			}

		}
	}

	initPhotoSwipe();
	/*================================
			        init Isotope
	==================================*/
	$('.isotope-wrapper').each(function (index) {
		var $container = $(this);
		var layoutMode = ($container.hasClass('masonry-layout')) ? 'masonry' : 'fitRows';
		var columnWidth = ($container.children('.col-xl-4').length) ? '.col-xl-4' : false;
		$container.isotope({
			percentPosition: true,
			layoutMode: layoutMode,
			masonry: {
				//TODO for big first element in grid - giving smaller element to use as grid
				// columnWidth: '.isotope-wrapper > .col-md-4'
				columnWidth: columnWidth
			}
		});

		var $filters = $container.attr('data-filters') ? $($container.attr('data-filters')) : $container.prev().find('.filters');
		// bind filter click
		if ($filters.length) {
			$filters.on('click', 'a', function (e) {
				e.preventDefault();
				var $thisA = $(this);
				var filterValue = $thisA.attr('data-filter');
				$container.isotope({
					filter: filterValue
				});
				$thisA.siblings().removeClass('selected active');
				$thisA.addClass('selected active');
			});
			//for works on select
			$filters.on('change', 'select', function (e) {
				e.preventDefault();
				var filterValue = $(this).val();
				$container.isotope({
					filter: filterValue
				});
			});
		}
    });
}(jQuery));
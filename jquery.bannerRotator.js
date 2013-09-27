(function($){
	$.fn.extend({
		bannerRotator: function(options){
			var defaults = {
				banners:'DIV.banners IMG',
				description: 'UL LI',
				auto: true,
				autoDelay: 8000
			};
			var o = $.extend(defaults, options);

			return this.each(function(){
				var $rotator = $(this),
					$banners = $rotator.find(o.banners),
					$descriptions = $rotator.find(o.description),
					$arrows;
				var currentIndex = -1, targetIndex = 0;
				var timeoutShrink, timeoutOpen, opening = false;
				var rotatorHeight = 0, shrinkHeight = 0;
				var count = $banners.length;
				var baseZindex = parseInt($rotator.css('z-index'));

				function init(){
					$banners.each(function(i){
						rotatorHeight = Math.max(rotatorHeight, $(this).height());
						$(this).css({
							display: i==0 ? 'block' : 'none',
							zIndex:baseZindex + (i==0 ? 1 : 0),
							position:'absolute',
							top:0,
							left:0
						});
					});
					shrinkHeight = rotatorHeight / count;
					$descriptions.each(function(i){
						$(this).addClass('description-'+i).css({
							height: i==0 ? rotatorHeight : shrinkHeight,
							overflow: 'hidden',
							position: 'relative',
							zIndex: baseZindex + 3
						});
						if(i==0){
							$(this).addClass('opened');
						}
						$(this).html('<div class="content">' + $(this).html() + '</div>');
					});
					$arrows = $('<div class="arrow"></div>').appendTo($descriptions)
					$arrows.css({
						position: 'absolute',
						zIndex: baseZindex + 3,
						left: 0,
						top: (shrinkHeight - $arrows.height())/2
					});
					$rotator.css({
						height: rotatorHeight,
						overflow: 'hidden'
					});

					$banners.on('mouseover', shrinkDescription);
					$descriptions.on('mouseover',function(){
						var targetIndex = $(this).index();
						showBanner(targetIndex);
						if(o.auto){
							resetAutoPlay(targetIndex);
						}
					});
				}
				function showBanner(index){
					if(opening){ return; }
					var $targetDescription = $descriptions.eq(index);
					if(currentIndex != index){
						var $targetBanner = $banners.eq(index);
						$targetBanner.siblings().css('z-index', baseZindex);
						$targetBanner.css('z-index',baseZindex+1).fadeIn(function(){
							$targetBanner.siblings().hide();
						});
						currentIndex = index;
					}
					if(!$targetDescription.is('.opened')){
						opening = true;
						$descriptions.removeClass('opened');
						$descriptions.parent().animate({
							marginTop: - index * shrinkHeight
						});
						$targetDescription.addClass('opening').animate({
							height: rotatorHeight
						}, function(){
							$targetDescription.removeClass('opening').addClass('opened');
							opening = false;
						});
					}
				}
				function shrinkDescription(callback){
					if(opening){
						$descriptions.add($descriptions.parent()).stop(true, true);
					}
					$descriptions.filter('.opened').removeClass('opened').addClass('shrinking').animate({
						height:shrinkHeight
					},function(){
						$(this).removeClass('shrinking');
					});
					$descriptions.parent().animate({
						marginTop: 0
					});
					if(!!callback && typeof(callback) == 'function'){
						callback.apply(this);
					}
				}
				function autoPlay(startIndex){
					timeoutShrink = setTimeout(function(){
						shrinkDescription(function(){
							timeoutOpen = setTimeout(function(){
								showBanner(!!startIndex ? startIndex :
									currentIndex < count -1 ? currentIndex+1 : 0);
								autoPlay();
							}, o.autoDelay * 0.2);
						});
					}, o.autoDelay * 0.8);
				}
				function resetAutoPlay(startIndex){
					clearTimeout(timeoutShrink);
					clearTimeout(timeoutOpen);
					autoPlay(startIndex);
				}


				init();
				if(o.auto){
					autoPlay(1);
				}
			});
		}
	});
})(jQuery);
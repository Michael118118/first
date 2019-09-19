/**
 * 图片预览组件
 * varstion 0.4.0
 * by Houfeng
 * Houfeng@DCloud.io
 */
(function($, document) {
	$.init({
		gestureConfig: {
			tap: true, //默认为true
			doubletap: true, //默认为false
			longtap: true, //默认为false
			swipe: true, //默认为true
			drag: true, //默认为true
			hold: true, //默认为false，不监听
			release: true //默认为false，不监听
		}
	});   

	var touchSupport = ('ontouchstart' in document);   
	var tapEventName = touchSupport ? 'tap' : 'click';
	var enterEventName = touchSupport ? 'tap' : 'click';
	var imageClassName = $.className('image');
	var DownloadUtil = require('scripts/Core/DownLoadUtil.js');
	
	//创建DOM (此函数是否可放在 mui.js 中)
	$.dom = function(str) {
		if (!$.__create_dom_div__) {
			$.__create_dom_div__ = document.createElement('div');
		}
		$.__create_dom_div__.innerHTML = str;
		return $.__create_dom_div__.childNodes;
	};

	//图片预览组件类
	var ImageViewer = $.ImageViewer = $.Class.extend({		
		//构造函数
		init: function(selector, options) {
			var self = this;   
			self.options = options || {};
			self.selector = selector || 'img';
			if (self.options.dbl) {
				enterEventName = touchSupport ? 'doubletap' : 'dblclick';
			}
			self.findAllImage();
			self.download_options();
			self.createViewer();
			self.bindEvent();
		},
		//创建图片预览组件的整体 UI
		createViewer: function() {
			var self = this;
			self.viewer = $.dom("<div class='mui-imageviewer'><div class='mui-imageviewer-mask'></div><div class='mui-imageviewer-header'><i class='mui-icon mui-icon-closeempty mui-imageviewer-close'></i><span class='mui-imageviewer-state'></span></div><i class='mui-icon mui-icon-arrowleft  mui-imageviewer-left'></i><i class='mui-icon mui-icon-arrowright mui-imageviewer-right'></i></div>");
			self.viewer = self.viewer[0] || self.viewer;
			//self.viewer.style.height = screen.height;
			self.closeButton = self.viewer.querySelector('.mui-imageviewer-close');
			self.state = self.viewer.querySelector('.mui-imageviewer-state');
			self.leftButton = self.viewer.querySelector('.mui-imageviewer-left');
			self.rightButton = self.viewer.querySelector('.mui-imageviewer-right');
			self.mask = self.viewer.querySelector('.mui-imageviewer-mask');
			document.body.appendChild(self.viewer);
		},
		//查找所有符合的图片
		findAllImage: function() {
			var self = this;
			self.images = [].slice.call($(self.selector));
			//缓存下载图片
			Zepto.each(self.images, function(key, value) {
				var $this = this;
				var src = '';
				src = $this.getAttribute('id');
				if(src){
					var str_head = src.substr(0,4);					
					if(str_head == 'http'){
						//src_httpurl存储网络路径 用于判断是否已经缓存
						if($this.getAttribute('src_httpurl')){							
							src = $this.getAttribute('src_httpurl');
						}else{
							src = $this.getAttribute('id');
						}						
						self.downLoadImg(src,$this);
					}					
				}
			});
		},
		//检查图片是否为启动预览的图片
		checkImage: function(target) {
			var self = this;						
			if (target.tagName !== 'IMG'){return false};			
			return self.images.some(function(image) {				
				return image == target;
			});
		},
		//下载并保存图片
		downloaderandsave: function(url_value){
			plus.nativeUI.showWaiting('正在保存，请稍后...');			
			var dtask = plus.downloader.createDownload(url_value, {}, function(d,status){
				// 下载完成				
				if ( status == 200 ) {
					plus.gallery.save(d.filename,function() {
						plus.nativeUI.closeWaiting();
						mui.toast('保存成功');
					}, function() {
						plus.nativeUI.closeWaiting();
						mui.toast('保存失败，请重试！');
					});
				} else {
					plus.nativeUI.closeWaiting();
					mui.toast('保存失败，请重试！');
			    }
			});
			dtask.start(); 
		},
		//绑定事件
		bindEvent: function() { 
			var self = this;			
			//绑定图片 tap 事件
			document.addEventListener(enterEventName, function(event) {					
				if (!self.viewer) return;
				var target = event.target;
				if (!self.checkImage(target)) return;				
				self.viewer.style.display = 'block';
				setTimeout(function() {
					self.viewer.style.opacity = 1;
				}, 0);
				self.index = self.images.indexOf(target);				
				self.currentItem = self.createImage(self.index);
			}, false);			
			self.viewer.addEventListener('longtap', function(event) {
				var target = event.target;
				if (!self.viewer) return;
				self.viewer.style.display = 'block';
				setTimeout(function() {
					self.viewer.style.opacity = 1;
				}, 0);
				var image_i = self.images.indexOf(target);					
				if (image_i < 0) image_i = self.images.length - 1;
				if (image_i > self.images.length - 1) image_i = 0;	   
				plus.nativeUI.actionSheet( {title:"选择操作",cancel:"取消",buttons:[{title:"保存到相册"}]}, function(e){										
					if(e.index == 1){ 	
						plus.gallery.save(self.images[image_i].src,function() {
							plus.nativeUI.closeWaiting();
							mui.toast('保存成功');
						}, function() {
							plus.nativeUI.closeWaiting();
							mui.toast('保存失败，请重试！');
						});
					}
				} );
			}, false);
			//关系按钮事件
			self.closeButton.addEventListener(tapEventName, function(event) {
				self.viewer.style.opacity = 0;
				setTimeout(function() {
					self.viewer.style.display = 'none';
					self.disposeImage(true);
				}, 600);
				event.preventDefault();
				event.cancelBubble = true;
			}, false);
			//处理左右按钮
			self.leftButton.addEventListener(tapEventName, function() {
				self.prev();
			}, false);
			self.rightButton.addEventListener(tapEventName, function() {
				self.next();
			}, false);
			//处理划动
			self.mask.addEventListener($.EVENT_MOVE, function(event) {
				event.preventDefault();
				event.cancelBubble = true;
			}, false);
			self.viewer.addEventListener('swipeleft', function(event) {
				if (self.scaleValue == 1) self.next();
				event.preventDefault();
				event.cancelBubble = true;
			}, false);
			self.viewer.addEventListener('swiperight', function(event) {
				if (self.scaleValue == 1) self.prev();
				event.preventDefault();
				event.cancelBubble = true;
			}, false);
			//处理缩放开始
			self.viewer.addEventListener($.EVENT_START, function(event) {
				var touches = event.touches;
				if (touches.length == 2) {
					var p1 = touches[0];
					var p2 = touches[1];
					var x = p1.pageX - p2.pageX; //x1-x2
					var y = p1.pageY - p2.pageY; //y1-y2
					self.scaleStart = Math.sqrt(x * x + y * y);
					self.isMultiTouch = true;
				} else if (touches.length = 1) {
					self.dragStart = touches[0];
				}
			}, false);
			self.viewer.addEventListener($.EVENT_MOVE, function(event) {
				var img = self.currentItem.querySelector('img');
				var touches = event.changedTouches;
				if (touches.length == 2) {
					event.preventDefault();
					event.cancelBubble = true;
					var p1 = touches[0];
					var p2 = touches[1];
					var x = p1.pageX - p2.pageX;
					var y = p1.pageY - p2.pageY;
					self.scaleEnd = Math.sqrt(x * x + y * y);
					self._scaleValue = (self.scaleValue * (self.scaleEnd / self.scaleStart));
					img.style.webkitTransform = "scale(" + self._scaleValue + "," + self._scaleValue + ") "; // + " translate(" + self.dragX || 0 + "px," + self.dragY || 0 + "px)";
				} else if (!self.isMultiTouch && touches.length == 1 && self.scaleValue != 1) {
					event.preventDefault();
					event.cancelBubble = true;
					self.dragEnd = touches[0];
					self._dragX = self.dragX + (self.dragEnd.pageX - self.dragStart.pageX);
					self._dragY = self.dragY + (self.dragEnd.pageY - self.dragStart.pageY);
					img.style.marginLeft = self._dragX + 'px';
					img.style.marginTop = self._dragY + 'px';
					//img.style.transform = "translate(" + self._dragX + "px," + self._dragY + "px) " + " scale(" + self.scaleValue || 1 + "," + self.scaleValue || 1 + ")";
				}
			}, false);
			self.viewer.addEventListener($.EVENT_END, function() {
				self.scaleValue = self._scaleValue || self.scaleValue;
				self._scaleValue = null;
				self.dragX = self._dragX;
				self.dragY = self._dragY;
				self._dragX = null;
				self._dragY = null;
				var touches = event.touches;
				self.isMultiTouch = (touches.length != 0);
			});
			// doubletap 好像不能用
			self.viewer.addEventListener('doubletap', function() {
				var img = self.currentItem.querySelector('img');
				if (self.scaleValue === 1) {
					self.scaleValue = 2;
				} else {
					self.scaleValue = 1;
				}
				self.dragX = 0;
				self.dragY = 0;
				img.style.marginLeft = self.dragX + 'px';
				img.style.marginTop = self.dragY + 'px';
				img.style.webkitTransform = "scale(" + self.scaleValue + "," + self.scaleValue + ") "; //+ " translate(" + self.dragX || 0 + "px," + self.dragY || 0 + "px)";
				self.viewer.__tap_num = 0;
			}, false);
			//处理缩放结束
		},
		//下一张图片
		next: function() {
			var self = this;
			self.mask.style.display = 'block';
			self.index++;
			var newItem = self.createImage(self.index, 'right');
			setTimeout(function() {
				self.currentItem.classList.remove('mui-imageviewer-item-center');
				self.currentItem.classList.add('mui-imageviewer-item-left');
				newItem.classList.remove('mui-imageviewer-item-right');
				newItem.classList.add('mui-imageviewer-item-center');
				self.oldItem = self.currentItem;
				self.currentItem = newItem;
				// TODO: 临时,稍候将调整
				setTimeout(function() {
					self.disposeImage();
					self.mask.style.display = 'none';
				}, 600);
			}, 25);
		},
		//上一张图片
		prev: function() {
			var self = this;
			self.mask.style.display = 'block';
			self.index--;
			var newItem = self.createImage(self.index, 'left');
			setTimeout(function() {
				self.currentItem.classList.remove('mui-imageviewer-item-center');
				self.currentItem.classList.add('mui-imageviewer-item-right');
				newItem.classList.remove('mui-imageviewer-item-left');
				newItem.classList.add('mui-imageviewer-item-center');
				self.oldItem = self.currentItem;
				self.currentItem = newItem;
				// TODO: 临时,稍候将调整
				setTimeout(function() {
					self.disposeImage();
					self.mask.style.display = 'none';
				}, 600);
			}, 25);
		},
		//释放不显示的图片
		disposeImage: function(all) {
			var sel = '.mui-imageviewer-item-left,.mui-imageviewer-item-right';
			if (all) sel += ",.mui-imageviewer-item";
			var willdisposes = $(sel);
			willdisposes.each(function(i, item) {
				if (item.parentNode && item.parentNode.removeChild)
					item.parentNode.removeChild(item, true);
			});
		},
		//创建一个图片
		createImage: function(index, type) {
			var self = this;
			type = type || 'center';
			if (index < 0) index = self.images.length - 1;
			if (index > self.images.length - 1) index = 0;
			self.index = index;       
			var item = $.dom("<div class='mui-imageviewer-item'></div>")[0];
			//console.log('image_curent'+ self.images[self.index].src);
			item.appendChild($.dom('<span><img src="' + self.images[self.index].src + '"/></span>')[0]);
			item.classList.add('mui-imageviewer-item-' + type);
			self.viewer.appendChild(item);
			self.state.innerText = (self.index + 1) + "/" + self.images.length;
			//重置初始缩放比例
			self.scaleValue = 1;   
			self.dragX = 0;
			self.dragY = 0;
			return item;
		},
		download_options:function() {			
			//console.log('down-'+ DownloadUtil);
			//通过工具类下载文件,这里进行设置
			DownloadUtil.setOptions({
				//默认的下载缓存目录-存到应用的downloads/downloadFiles下
				'downloadStoragePath': "_downloads/downloadFiles/",
				//本地缓存的时间戳,毫秒单位,默认为1天
				'fileCacheTimeStamp': 10000000000000 * 60 * 60 * 24 * 1,
				//同时最多的downloader 并发下载数目,默认为3个
				'concurrentDownloadCount': 1,
				//超时请求时间
				'timeout': 3,
				//超时请求后的重试次数
				'retryInterval': 3,
				//单个下载任务最大的请求时间,防止一些机型上无法触发错误回调,单位毫秒,默认10秒
				'maxTimeSingleDownloadTaskSpend': 1000 * 10,
				//获取相对路径的函数,如果不传,则用默认的路径处理方法
				'getRelativePathFromLoadUrlCallback': function(loadUrl) {
					//获取图片后缀,如果没有获取到后缀,默认是jpg
					var imgSuffix = loadUrl.substring(loadUrl.lastIndexOf(".") + 1, loadUrl.length);
					if (
						imgSuffix.toLocaleLowerCase() != ("jpg") &&
						imgSuffix.toLocaleLowerCase() != ("jpeg") &&
						imgSuffix.toLocaleLowerCase() != ("png") &&
						imgSuffix.toLocaleLowerCase() != ("bmp") &&
						imgSuffix.toLocaleLowerCase() != ("svg") &&
						imgSuffix.toLocaleLowerCase() != ("gif")
					) {
						//如果后缀没有包含以上图片,将后缀改为jpg
						//imgSuffix = 'jpg';
					}
					//更换存储方式,变为将整个路径存储下来,然后去除非法字符
					var regIllegal = /[&\|\\\*^%$#@\-:.?\/=!]/g;
					//获取图片名字
					var imgName = loadUrl.replace(regIllegal, '');
					//最终的名字
					var filename = imgName + '.' + imgSuffix;
					var relativePath = '_downloads/downloadFiles/' + filename;
					return relativePath;
				}
			});
		},
		//下载并缓存图片
		downLoadImg:function(src, dom) {
			var self = this;
			DownloadUtil.downloadFileWidthLocalCache(src, {
				beforeDownload: function() {
					if(dom.getAttribute('src') == ''){
						dom.setAttribute('src', self.defaultPath4Img() + 'images/default_img.png');
					}					
				},
				successDownload: function(relativePath) {
					//console.log('下载成功:' + relativePath);
					mui.plusReady(function() {
						var sd_path = plus.io.convertLocalFileSystemURL(relativePath);
						//console.log('sd_path-'+sd_path + 'dom-' + JSON.stringify(dom));
						dom.setAttribute('src', sd_path);
						dom.setAttribute('src_httpurl', src);
						//console.log('src=' + sd_path);
						return sd_path;
					});
				},
				errorDownload: function(msg) {
					dom.setAttribute('src', self.defaultPath4Img() + 'images/img_error.jpg');
				}
			});
		},
		//查看是否有缓存图片
		images_down:function(src) {
			return DownloadUtil.isFileLocalCache(src);
		},
		//默认图片地址
		defaultPath4Img: function() {
			var defaultPathStr = '';
			var thisPath = window.location.pathname;
			var arr = window.location.pathname.split('www/page/');  //按照www/page/ 分组
			var shortPath = '';
			if(arr.length >=2){
				shortPath = arr[arr.length - 1];
			}			
			var deep = shortPath.split('/').length;
			if(deep >= 0){
				for(var i =0; i<deep; i++) {
					defaultPathStr += '../';
				}
			}else{
				defaultPathStr += '../../../';
			}
			return defaultPathStr;			
		},		
	});

	$.imageViewer = function(selector, options) {
		return new ImageViewer(selector, options);
	};

	$.ready(function() {
		$.imageViewer('.' + imageClassName);
	});

}(mui, document));
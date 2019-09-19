/*
 * 该js引用前需先引用watermark.min.js
 * 占位符拍照1
 */
(function($, owner) {
	var index = 1;
	var size = null;
	var imageIndexIdNum = 0;
	var starIndex = 0;
	var pictures = {
		introduce: document.getElementById('introduce'), 
		imageList: document.getElementById('image-list'),
	};
	owner.pictures=pictures;
	pictures.files = [];
	pictures.deviceInfo = null; 
	mui.plusReady(function() {
		currentView = plus.webview.currentWebview();
		//设备信息，无需修改
		pictures.deviceInfo = {
			appid: plus.runtime.appid, 
			imei: plus.device.imei, //设备标识
			images: pictures.files, //图片文件
			p: mui.os.android ? 'a' : 'i', //平台类型，i表示iOS平台，a表示Android平台。
			md: plus.device.model, //设备型号
			app_version: plus.runtime.version,
			plus_version: plus.runtime.innerVersion, //基座版本号
			os:  mui.os.version,
			net: ''+plus.networkinfo.getCurrentType()
		}
		pictures.currentViewId = currentView.id;   // 当前页面id;
	});
	/**
	 *提交成功之后，恢复表单项 
	 */
	pictures.clearForm = function() {
		pictures.imageList.innerHTML = '';
		pictures.newPlaceholder();
		pictures.files = [];
		index = 0;
		size = 0;
		imageIndexIdNum = 0;
		starIndex = 0;
		
	};
	pictures.getFileInputArray = function() {
		return [].slice.call(pictures.imageList.querySelectorAll('.file'));
	};
	// 
	pictures.addFile = function(name, path, id, longt, lat, pcoords_type, isNew, accuracy) {
		if(id == undefined || id == null || id == ''){
			id = '';
		}
		pictures.files.push({name:name, path:path, id:id, longt:longt, lat:lat, pcoords_type:pcoords_type, accuracy:accuracy});
		// 更新临时缓存数据
		plus.storage.setItem("photos_" + pictures.currentViewId, JSON.stringify(pictures.files));
		index++;
	};
	
	//相机拍照
	pictures.getImage = function(self, index, placeholder, longt, lat, pcoords_type, accuracy) {
		var c = plus.camera.getCamera();
		c.captureImage(function(e) {			
			plus.io.resolveLocalFileSystemURL(e, function(entry) {
				var a = entry.toLocalURL();
				var temp = a.split('/');
				var name = temp.pop();				
				plus.zip.compressImage({
					src: a,
					dst: a,
					overwrite: true,
					width: 1024,
					//rotate:90
				}, function(zip) {
					var psubstr = zip.target.substring(7);
					var relativepath = plus.io.convertAbsoluteFileSystem( psubstr );//转成_doc/..的形式
					size += zip.size;
					if (size > (10*1024*1024)) {
						return mui.toast('文件超大,请重新选择~');
					}
					var imgPath = zip.target;
					// 保存照片成功在业务页面显示，及返回地址					
					if (!self.parentNode.classList.contains('space')) { //已有图片
						pictures.files.splice(index-1, 1, {name:name, path:imgPath});
					} else { //加号
						placeholder.classList.remove('space');
						pictures.addFile(name, relativepath, '', longt, lat, pcoords_type, true, accuracy);
						pictures.newPlaceholder();
					}
					placeholder.style.backgroundImage = 'url(' + imgPath + ')';
					placeholder.setAttribute('img_name', name);
					placeholder.setAttribute('img_path', relativepath);				       
				}, function(zipe) {
					mui.toast('压缩失败！')
				});
			}, function(e) {
				console.log("读取拍照文件错误：" + e.message);
			});
		}, function(s) {
			console.log("error" + JSON.stringify(s)); 
		}, {
			filename: "_doc/release" + Math.random() + ".jpg"
		})
	}

	/**
	 * 初始化图片域占位
	 */
	pictures.newPlaceholder = function() {
		var fileInputArray = pictures.getFileInputArray();
		if (fileInputArray &&
			fileInputArray.length > 0 &&
			fileInputArray[fileInputArray.length - 1].parentNode.classList.contains('space')) {
			return;
		};
		imageIndexIdNum++;
		var placeholder = document.createElement('div');
		placeholder.setAttribute('class', 'image-item space');
		//删除图片
		var closeButton = document.createElement('div');
		closeButton.setAttribute('class', 'image-close');
		closeButton.innerHTML = 'X';
		//小X的点击事件
		closeButton.addEventListener('tap', function(event) {
			setTimeout(function() {
				var imgid = placeholder.getAttribute('imgid');
				var iname = placeholder.getAttribute('img_name');
				var ipath = placeholder.getAttribute('img_path');
				for(var k = 0 ; k<pictures.files.length;k++){
					if(pictures.files[k].name == iname && (pictures.files[k].path == ipath)){
						pictures.files.splice(k,1);
					}
				}
				pictures.imageList.removeChild(placeholder);
				// 更新临时缓存数据
				plus.storage.setItem("photos_" + pictures.currentViewId, JSON.stringify(pictures.files));
			}, 0);
			return false;
		}, false);
		
		//
		var fileInput = document.createElement('div');
		fileInput.setAttribute('class', 'file');
		fileInput.setAttribute('id', 'image-' + imageIndexIdNum);
		fileInput.addEventListener('tap', function(event) {
			var self = this;
			var index = (this.id).substr(-1);			
			placeholder.setAttribute('imgid', index-1);
			if(mui.os.plus){
				// 不要定位了，提高效率
				pictures.getImage(self,index, placeholder, 0, 0, 'unuse', '0');
				return;
			}
		}, false);
		placeholder.appendChild(closeButton);
		placeholder.appendChild(fileInput);
		pictures.imageList.appendChild(placeholder);
	};
	pictures.newPlaceholder();

	pictures.str_trim = function(str) { 
	  return str.replace(/(^\s*)|(\s*$)/g, ''); 
	}; 
		  	
})(mui, picture={});
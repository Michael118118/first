/*
 * 该js引用前需先引用
 * 占位符拍照1
 */
(function($, owner) {
	var index = 1;
	var size = null;
	var imageIndexIdNum = 0;
	var starIndex = 0;
	var pictures1 = {
		imageList: document.getElementById('image-list'),
	};
	owner.pictures1=pictures1;
	pictures1.files = [];
	pictures1.deviceInfo = null; 
	mui.plusReady(function() {
		//设备信息，无需修改
		pictures1.deviceInfo = {
			appid: plus.runtime.appid, 
			imei: plus.device.imei, //设备标识
			images: pictures1.files, //图片文件
			p: mui.os.android ? 'a' : 'i', //平台类型，i表示iOS平台，a表示Android平台。
			md: plus.device.model, //设备型号
			app_version: plus.runtime.version,
			plus_version: plus.runtime.innerVersion, //基座版本号
			os:  mui.os.version,
			net: '' + plus.networkinfo.getCurrentType()
		}	
	});
	/**
	 *提交成功之后，恢复表单项 
	 */
	pictures1.clearForm = function() {
		pictures1.imageList.innerHTML = '';
		pictures1.newPlaceholder();
		pictures1.files = [];
		index = 0;
		size = 0;
		imageIndexIdNum = 0;
		starIndex = 0;		
	};
	pictures1.getFileInputArray = function() {
		return [].slice.call(pictures1.imageList.querySelectorAll('.file'));
	};
	pictures1.addFile = function(name,path,id) {
		if(id == undefined || id == null || id == ''){
			id = '';
		}
		pictures1.files.push({name:name, path:path, id:id});
		// 更新临时缓存数据
		plus.storage.setItem("photos_" + pictures1.currentViewId, JSON.stringify(pictures1.files));
		index++;
	};
	
	//相机拍照
	pictures1.getImage = function(self, index, placeholder) {
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
					//width: 640,
					//rotate:90
					quality:100
				}, function(zip) {
					var psubstr = zip.target.substring(7);
					var relativepath = plus.io.convertAbsoluteFileSystem( psubstr );//转成_doc/..的形式
					size += zip.size;
					if (size > (10*1024*1024)) {
						return mui.toast('文件超大,请重新选择~');
					}
					// 添加水印并反馈图片
					pictures1.watermark(zip.target, relativepath, self, name, placeholder);
				       
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
	
	//相册
	pictures1.galleryImg = function(self,index,placeholder) {		
		plus.gallery.pick(function(e) {
			plus.io.resolveLocalFileSystemURL(e, function(entry) {
				var a = entry.toLocalURL();
				var temp = a.split('/');
				var name = Date.parse(new Date()) + temp.pop();
				// 先复制相册图片到其他位置，若不然就会把相册中的原图片给压缩、打水印，改变了原图片 edited by liuj 2017-8-22
				// 复制文件到以下目录			
				var newfile = '_doc/album/' + name;				
				file.copyFile1(entry, plus.io.PRIVATE_DOC, 'album', newfile, name, function(file1) {
					a = file1.toLocalURL();//取新文件
					var relativepath1 = plus.io.convertAbsoluteFileSystem( a );//转成_doc/..的形式
					// 再处理
					plus.zip.compressImage({
						src: a,
						dst: a,
						overwrite: true,
						//width: 640,
						//rotate:100
						quality:100
					}, function(zip) {
						//文件上传
						var psubstr = zip.target.substring(7);
						var relativepath = plus.io.convertAbsoluteFileSystem( psubstr );//转成_doc/..的形式
						size += zip.size;
						if (size > (10*1024*1024)) {
							return mui.toast('文件超大,请重新选择~');
						}							
						// 添加水印并反馈图片
						pictures1.watermark(zip.target, relativepath, self, name, placeholder);					
					}, function(zipe) {
						mui.toast('压缩失败！')
					});
				})
			}, function(e) {
				console.log("读取拍照文件错误：" + e.message);
			});
		}, function(e) {
			console.log("error" + s); 
		},{});
	}

	/**
	 * 初始化图片域占位
	 */
	pictures1.newPlaceholder = function() {
		var fileInputArray = pictures1.getFileInputArray();
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
				for(var k = 0 ; k<pictures1.files.length;k++){
					if(pictures1.files[k].name == iname && (pictures1.files[k].path == ipath)){
						pictures1.files.splice(k,1);
					}
				}
				pictures1.imageList.removeChild(placeholder);
				// 更新临时缓存数据
				plus.storage.setItem("photos_" + pictures1.currentViewId, JSON.stringify(pictures1.files));
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
				// 只有拍照选项 所以下边的就不需要了
				var a = [{
					title: "拍照"
				}, {
					title: "从手机相册选择"
				}];
				plus.nativeUI.actionSheet({
					title: '上传图片',
					cancel: "取消",
					buttons: a
				}, function(b) {
					switch (b.index) {
						case 0:
							break;
						case 1:
							pictures1.getImage(self,index, placeholder);
							break;
						case 2:
							pictures1.galleryImg(self,index,placeholder);
							break;
						default:
							break
					}
				})	
			}			
		}, false);
		placeholder.appendChild(closeButton);
		placeholder.appendChild(fileInput);
		pictures1.imageList.appendChild(placeholder);
	};
	pictures1.newPlaceholder();
	pictures1.watermark = function(imgPath, relativepath, self, name, placeholder){
		// 保存照片成功在业务页面显示，及返回地址					
		if (!self.parentNode.classList.contains('space')) { //已有图片
			pictures1.files.splice(index-1, 1, {name:name, path:imgPath});
		} else { //加号
			placeholder.classList.remove('space');
			pictures1.addFile(name, relativepath);
			pictures1.newPlaceholder();
		}
		placeholder.style.backgroundImage = 'url(' + imgPath + ')';
		placeholder.classList.add('image-item-after');
		placeholder.setAttribute('img_name', name);
		placeholder.setAttribute('img_path', relativepath);
	}
	pictures1.str_trim = function(str) { 
	  return str.replace(/(^\s*)|(\s*$)/g, ''); 
	}; 
		  	
})(mui,picture1={});
(function($, owner) {
	//服务器地址
    //owner.root = "http://192.168.191.1/concretecoupontest";
    //owner.root = "http://192.168.191.1/concretecoupon";
    owner.root = "http://192.168.191.1";
    //owner.root = "http://jcyp.gongjiangyun.cn";
    //owner.root = "http://htjdb.htzhcs.com"; 
	owner.url = owner.root + "";
	owner.serverurl = owner.url + "/api.php?s=";
	owner.show = false;
	owner.EternetweakAndSave2Offline = "网络不给力，数据已保存到离线数据，请稍后在离线数据中提交。";
	owner.GpsNotAllowed = "获取地理坐标失败，请检查确保已为“检测唯一码”用开启gps定位服务!";
     
	/*
	 * 是否仅在使用无线网络
	 */
	owner.isWifi = function() {
		return plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_WIFI;
	}

	/*
	 * 是否开启了网络，可以是4G或无线
	 */
	owner.isEternet = function() {
		return (plus.networkinfo.getCurrentType() != plus.networkinfo.CONNECTION_NONE  && plus.networkinfo.getCurrentType() != plus.networkinfo.CONNECTION_UNKNOW);
	};

	/*
	 * 获取用户账号信息
	 */
	owner.get_account = function() {
		var data = plus.storage.getItem("$account");
		if(data == "") return {};
		else
			return JSON.parse(data);
	};

	/*
	 * 设置用户账号信息
	 */
	owner.set_account = function(val) {
		plus.storage.setItem("$account", val == null || val == undefined ? "" : JSON.stringify(val));
	};

	/*
	 * 获取当前经纬度
	 */
	owner.geolocation = function(callback) {
		//获取经纬度
		plus.geolocation.getCurrentPosition(function(position) {
			var r = /^(-)?\d+(\.\d+)?$/;
			if(r.test(position.coords.longitude) && r.test(position.coords.latitude)){
				// 回调函数
		        callback(position);
			}else{
				plus.nativeUI.alert('定位错误，请检查权限设置！');
				app.closeWaiting();
			}
		},function(){
			app.closeWaiting();
			plus.nativeUI.alert(app.GpsNotAllowed);
		}, {'provider':'baidu', 'geocode' : false});
	}

	/*
	 * 打开窗口 不创建新窗口
	 * 默认打开相同id的旧窗口时不初始化
	 * 未提供更好的交互效果，不自动显示界面，不自动显示等待条
	 * 默认右侧进场
	 */
	owner.openWindow = function(id, url, extras, styles, aniShow, autoShow) {
		owner.show && console.log("打开窗口:" + url);
		var param = {
			'id': id,
			'url': url,
			'show': {
				'autoShow': false,
				'aniShow': aniShow || 'slide-in-right'
			},
			'waiting': {
				'autoShow': autoShow || false
			},
			'extras': extras,
			'styles': styles
		};
		return $.openWindow(param);
	};

	owner.ajax = function(url, param, callback, isasync, errorcallback) {
		//判断离线状态
		if(!app.isEternet()) {
			plus && plus.nativeUI && plus.nativeUI.closeWaiting();
			$.toast('当前无网络，请检查网络设置');
			return;
		}

		//var setting = app.getSettings();
		owner.show && console.log("这是owner.serverurl:" + owner.serverurl);		
		owner.show && console.log(owner.serverurl + url);
		owner.show && console.log(JSON.stringify(param));
        var atimeout = 200; // 单位秒
		mui.ajax(owner.root + "/api.php?s=" + url, {
			data: param,
			dataType: 'json',
			async: (isasync == undefined ? true : isasync),
			type: 'post',
			timeout: atimeout,
			success: function(data) {
				owner.show && console.log(JSON.stringify(data));
				return callback(data);
			},
			error: function(xhr, type, errorThrown) {				
				if(type == 'abort' && errorThrown == null){
					plus && plus.nativeUI && plus.nativeUI.closeWaiting();
					plus && plus.nativeUI && plus.nativeUI.toast("访问网络超时，请检查网络！");
					//console.log("访问网络超时-ajax，请检查网络！" + url);
					if(errorcallback){
						return errorcallback(param);  
					}else{
						return;
					}
				}
				owner.show && console.log(JSON.stringify(arguments));
				plus && plus.nativeUI && plus.nativeUI.closeWaiting();
				plus && plus.nativeUI && plus.nativeUI.toast("请求异常！");
				if(errorcallback){
					return errorcallback(param);
				}
			},
			timeout: function() {
				//owner.show && console.log(JSON.stringify(arguments));
				plus && plus.nativeUI && plus.nativeUI.closeWaiting();
				if(errorcallback){
					return errorcallback(param);
				}else{
					plus && plus.nativeUI && plus.nativeUI.toast("请求超时，请重试.");
				}
			}
		});
	};

	//安装更新
	owner.installWgt = function(path) {
		plus.nativeUI.showWaiting("安装更新文件...");
		plus.runtime.install(path, {}, function() {
			plus.nativeUI.closeWaiting();
			app.ajax('/user/Mobileversion/updateInfo', {}, function(data) {
				if(data.s == "ok") {
					plus.nativeUI.alert(data.data, function() {
						plus.runtime.restart();
					});
				} else {
					plus.nativeUI.alert("应用更新完成！", function() {
						plus.runtime.restart();
					});
				}
			});

		}, function(e) {
			plus.nativeUI.closeWaiting();
			plus.nativeUI.alert("更新失败[" + e.code + "]：" + e.message);
		});
	};
	//下载安装包
	owner.downWgt = function(wgtUrl) {
		plus.nativeUI.showWaiting("下载更新文件...");
		plus.downloader.createDownload(wgtUrl, {
			filename: "_doc/update/"
		}, function(d, status) {
			if(status == 200) {
				owner.installWgt(d.filename); // 安装wgt包
			} else {
				plus.nativeUI.alert("下载文件失败！");
			}
			plus.nativeUI.closeWaiting();
		}).start();
	};
	
	/*
	 * 获取当前app版本
	 */
	owner.getAppVersion = function(callback){
		plus.runtime.getProperty(plus.runtime.appid, function(inf) {
			callback && callback(inf.version);
		});
	}
	
	/*
	 * 更新版本
	 */
	owner.updateVersion = function(callback) {		
	    //if(sessionStorage.getItem('app-uploading') == 'false') {
			if(callback){
				//plus.nativeUI.showWaiting("检查版本中...");
			}			
			var setting = app.getSettings();
			var wgtVer = '';
			plus.runtime.getProperty(plus.runtime.appid, function(inf) {
				wgtVer = inf.version;	
				var osName = '';
				if(mui.os.ios){
					osName = 'ios';
				}else if(mui.os.android){
					osName = 'android';
				}else{
					osName = 'other';
				}
				owner.ajax('/user/Mobileversion/index', {
					"appid": plus.runtime.appid,
					"version": wgtVer,
					"imei": plus.device.imei,
					"os_name" : osName
				}, function(data) {
					plus.nativeUI.closeWaiting();
					//var apkUrl = mui.os.ios ? data.iosurl : data.url;
					// 有callback 时走callback
					if(data.status){
						if(callback){
							callback(data);
						}
					}else{
						callback(data, '已是最新版本！');
					}
				});
			});
//		} else {
//			//callback(null, '正在下载请稍后！');
//		}
	};

	/*
	 * 设置默认项目
	 */
	owner.setDefaultProject = function() {
		return '';
	};
	/*
	 * 清空状态
	 * 设置不清理项 excludes edited by liuj
	 */
	owner.clearState = function(excludes = null) {
		// 这是现在所有的本地缓存
		var allLocalStorage = ['settings', 'state', 'messages', 'default', 'tempCaches', 'helpread', 'defaultSite'];		
		if(excludes != null) {
			// 这一些不需要被清理
			for(var i = 0; i < excludes.length; i++) {	
				for(var j=0;j<allLocalStorage.length;j++){
					if(excludes[i] == allLocalStorage[j]){
						allLocalStorage.splice(j, 1);
						break;
					}
				}				
			}			
		}
		for(var i =0;i < allLocalStorage.length; i++){
			if(allLocalStorage[i] == "settings"){
				app.setSettings({});				
			}
			if(allLocalStorage[i] == "state"){
				app.setState({});				
			}
			if(allLocalStorage[i] == "messages"){
				app.setMessages({});				
			}
			if(allLocalStorage[i] == "default"){
				app.setDefault({});				
			}
			if(allLocalStorage[i] == "tempCaches"){
				app.setTempCaches({});				
			}
			if(allLocalStorage[i] == "helpread"){
				app.setHelpRead({});				
			}
		}
		//localStorage.clear();
	}
	owner.createState = function(userid, community, project, building, unit, door, nickname, password, companyid, companyname, sessionid, group, childmenuid, prolist) {
		var state = owner.getState();
		state.userid = userid;
		state.community = community;
		state.project = project;
		state.building = building;
		state.unit = unit;
		state.door = door;
		state.nickname = nickname;
		state.password = password;
		state.companyid = companyid;
		state.companyname = companyname;
		state.sessionid = sessionid;
		state.group = group;
		state.menuid = childmenuid;
		state.prolist = prolist;
		//设置角色图表
		owner.setState(state);
	}

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}

	/**
	 * 获取信息本地配置
	 **/
	owner.setMessages = function(messages) {
		messages = messages || {};
		localStorage.setItem('$messages', JSON.stringify(messages));
	}

	/**
	 * 设置信息本地配置
	 **/
	owner.getMessages = function() {
		var messagesText = localStorage.getItem('$messages') || "{}";
		return JSON.parse(messagesText);
	}

	/**
	 * 获取应用本地配置
	 **/
	owner.setDefault = function(defaults) {
		defaults = defaults || {};
		localStorage.setItem('$default', JSON.stringify(
			defaults));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getDefault = function() {
		var defaultText = localStorage.getItem('$default') || "{}";
		return JSON.parse(defaultText);
	}
	
	/**
	 * 获取临时缓存数据
	 **/
	owner.setTempCaches = function(tempCaches) {
		tempCaches = tempCaches || {};
		localStorage.setItem('$tempCaches', JSON.stringify(tempCaches));
	}

	/**
	 * 设置临时缓存数据
	 **/
	owner.getTempCaches = function() {
		var tempCachesText = localStorage.getItem('$tempCaches') || "{}";
		return JSON.parse(tempCachesText);
	}
	
	/**
	 * 获取某帮助提示已读次数
	 **/
	owner.setHelpRead = function(helpRead) {
		helpRead = helpRead || {};
		localStorage.setItem('$helpRead', JSON.stringify(helpRead));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getHelpRead = function() {
		var helpReadText = localStorage.getItem('$helpRead') || "{}";
		return JSON.parse(helpReadText);
	}
	
	/**
	 * 获取应用默认站点
	 **/
	owner.setDefaultSite = function(defaultSite) {
		defaultSite = defaultSite || {};
		localStorage.setItem('$defaultSite', JSON.stringify(defaultSite));
	}

	/**
	 * 设置应用默认站点
	 **/
	owner.getDefaultSite = function() {
		var defaultSiteText = localStorage.getItem('$defaultSite') || "{}";
		return JSON.parse(defaultSiteText);
	}

	owner.openFile = function(docid, address, docHash, newname) {	
		var DownloadUtil = require('scripts/Core/DownLoadUtil.js');
		//app.download_options();
		if(docHash != undefined && docHash[docid] != undefined) {
			plus.runtime.openFile(docHash[docid]);
		} else {
			if(address == undefined || address == "") {
				plus.nativeUI.toast("文件路径不存在!");
				return;
			}
			plus.nativeUI.showWaiting("正在下载文件请等待...");
			var savename = newname || "_downloads/imgs/" + address.substr(address.lastIndexOf("/") + 1).toLowerCase();
			var param = {
				method: "GET",
				filename: savename
			};

			var callback = function(d, status) {
				plus.nativeUI.closeWaiting();
				if(status == 200) {
					plus.runtime.openFile(d);
					if(docHash != undefined)
						docHash[docid] = d;
				} else {
					alert("下载文件失败: " + status);
				}
			};
			//下载并缓存
			var showProgressbar = null;
			var isCompleted = false;
			var fileUrl = address;
			var IsWithCache = true;
			DownloadUtil.downloadFileWidthLocalCache(fileUrl, {
				beforeDownload: function() {
					showProgressbar = plus.nativeUI.showWaiting('准备开始下载', {
						back: "close",
						padlock: true
					});
					showProgressbar.onclose = function() {
						//console.log('关闭下载...IsAbortDownload:'+IsAbortDownload);
						if (isCompleted == false) {
							DownloadUtil.abortTaskByUrl(fileUrl);
							//DownloadUtil.abortAllTask();
						}
					};
				},
				//下载成功
				successDownload: function(relativePath) {
					isCompleted = true;
					if (showProgressbar) {
						showProgressbar.close();
					}
					callback(relativePath, 200);
				},
				errorDownload: function(msg) {
					isCompleted = true;
					if (showProgressbar) {
						showProgressbar.close();
					}
					plus.nativeUI.toast("下载文件失败: " + msg);
				}
//				,
//				downloading: function(progress, tips) {
//					console.log('下载进度为:' + progress + '%,' + tips);
//					if (showProgressbar) {
//						showProgressbar.setTitle(parseInt(progress) + "%," + tips);
//					}
//				}
			}, IsWithCache);
		}
	}
//	//
//	owner.downloadFileWidthLocalCache_image = function(address){
//		var DownloadUtil = require('scripts/Core/DownLoadUtil.js');
//		var showProgressbar = null;
//		var isCompleted = false;
//		var fileUrl = address;
//		var IsWithCache = true;
//		DownloadUtil.downloadFileWidthLocalCache(fileUrl, {
//			beforeDownload: function() {
//				//console.log('准备开始上传');
//				showProgressbar = plus.nativeUI.showWaiting('准备开始下载', {
//					back: "close",
//					padlock: true
//				});
//				showProgressbar.onclose = function() {
//					//console.log('关闭下载...IsAbortDownload:'+IsAbortDownload);
//					if (isCompleted == false) {
//						DownloadUtil.abortTaskByUrl(fileUrl);
//						//DownloadUtil.abortAllTask();
//					}
//				};
//			},
//			successDownload: function(relativePath) {
//				isCompleted = true;
//				if (showProgressbar) {
//					showProgressbar.close();
//				}
//			},
//			errorDownload: function(msg) {
//				isCompleted = true;
//				if (showProgressbar) {
//					showProgressbar.close();
//				}
//				plus.nativeUI.toast("下载文件失败: " + msg);
//			},
//			downloading: function(progress, tips) {
//				//console.log('下载进度为:' + progress + '%,' + tips);
//				if (showProgressbar) {
//					showProgressbar.setTitle(parseInt(progress) + "%," + tips);
//				}
//			}
//		}, IsWithCache);
//	}
	
//	//下载设置
//	owner.download_options = function(){			
//		//console.log('down-'+ DownloadUtil);
//		var DownloadUtil = require('scripts/Core/DownLoadUtil.js');
//		//通过工具类下载文件,这里进行设置
//		DownloadUtil.setOptions({
//			//默认的下载缓存目录-存到应用的downloads/downloadFiles下
//			'downloadStoragePath': "_downloads/downloadFiles/",
//			//本地缓存的时间戳,毫秒单位,默认为1天
//			'fileCacheTimeStamp': 1000000000 * 60 * 60 * 24 * 10000,
//			//同时最多的downloader 并发下载数目,默认为3个
//			'concurrentDownloadCount': 1,
//			//超时请求时间
//			'timeout': 3,
//			//超时请求后的重试次数
//			'retryInterval': 3,
//			//单个下载任务最大的请求时间,防止一些机型上无法触发错误回调,单位毫秒,默认10秒
//			'maxTimeSingleDownloadTaskSpend': 1000 * 10,
//			//获取相对路径的函数,如果不传,则用默认的路径处理方法
//			'getRelativePathFromLoadUrlCallback': function(loadUrl) {
//				//获取图片后缀,如果没有获取到后缀,默认是jpg
////				var imgSuffix = loadUrl.substring(loadUrl.lastIndexOf(".") + 1, loadUrl.length);
////				if (
////					imgSuffix.toLocaleLowerCase() != ("jpg") &&
////					imgSuffix.toLocaleLowerCase() != ("jpeg") &&
////					imgSuffix.toLocaleLowerCase() != ("png") &&
////					imgSuffix.toLocaleLowerCase() != ("bmp") &&
////					imgSuffix.toLocaleLowerCase() != ("svg") &&					
////					imgSuffix.toLocaleLowerCase() != ("xls") &&
////					imgSuffix.toLocaleLowerCase() != ("doc") &&
////					imgSuffix.toLocaleLowerCase() != ("dwg") &&
////					imgSuffix.toLocaleLowerCase() != ("svl") &&
////					imgSuffix.toLocaleLowerCase() != ("mp4") &&
////					imgSuffix.toLocaleLowerCase() != ("3gp") &&
////					imgSuffix.toLocaleLowerCase() != ("avi") &&				
////					imgSuffix.toLocaleLowerCase() != ("gif")
////				) {
////					//如果后缀没有包含以上后缀,将后缀改为jpg
////					imgSuffix = 'jpg';
////				}
//              var fileSuffix = loadUrl.substring(loadUrl.lastIndexOf(".") + 1, loadUrl.length);
//				fileSuffix = fileSuffix || 'file';
//				//更换存储方式,变为将整个路径存储下来,然后去除非法字符
//				var regIllegal = /[&\|\\\*^%$#@\-:.?\/=!]/g;
//				//获取文件名字
//				var imgName = loadUrl.replace(regIllegal, '');
//				//最终的名字
//				var filename = imgName + '.' + fileSuffix;
//				//console.log('loadurl:'+loadUrl+',fileName:'+filename);
//				var relativePath = '_downloads/downloadFiles/' + filename;
//				return relativePath;
//			}
//		});
//	}

	//获取系统字典
	owner.getSysDic = function(action, callback, filter) {
		callback = callback || $.noop;
		var state = app.getState();
		var settings = app.getSettings();
		filter = filter || {};
		filter.userid = state.userid;
		//filter.roleid = state.roleid;
		if(state.group){
			if(state.group.id){
				filter.groupid = state.group.id;
			}
		}		
		filter.sessionid = state.sessionid;
		filter.companyid = state.companyid;
		//filter:type,name
		app.ajax(action, filter, function(data) {
			return callback(data);
		});
//		if(settings.offline) {
//			offlinedic.getdic(action, filter, function(data) {
//				return callback(data);
//			});
//		} else {}
	}

	//下载文件
	owner.downloadFile = function(address, callback) {
		//plus.nativeUI.showWaiting("正在下载文件请等待...");
		var DownloadUtil = require('scripts/Core/DownLoadUtil.js');		
		//app.download_options();
		var savename = "_downloads/" + address.substr(address.lastIndexOf("/") + 1).toLowerCase();
		if(mui.os.ios){
			var param = {
				method: "GET",
				filename: savename
			};
		}else{
			var param = {
				method: "post",
				filename: savename
			};
		}
		
		var tempcallback = function(d, status) {
			plus.nativeUI.closeWaiting();
			if(status == 200) {
				callback(d);
			} else {
				plus.nativeUI.toast("下载文件失败: " + status);
			}
		};

		var showProgressbar = null;
		var isCompleted = false;
		var fileUrl = address;
		var IsWithCache = true;
		DownloadUtil.downloadFileWidthLocalCache(fileUrl, {
			beforeDownload: function() {
				showProgressbar = plus.nativeUI.showWaiting('准备开始下载', {
					back: "close",
					padlock: true
				});
				showProgressbar.onclose = function() {
					//console.log('关闭下载...IsAbortDownload:'+IsAbortDownload);
					if (isCompleted == false) {
						DownloadUtil.abortTaskByUrl(fileUrl);
					}
				};
			},
			successDownload: function(relativePath) {
				isCompleted = true;
				if (showProgressbar) {
					showProgressbar.close();
				}
				tempcallback(relativePath, 200);
				//console.log('下载成功:' + relativePath);
			},
			errorDownload: function(msg) {
				isCompleted = true;
				if (showProgressbar) {
					showProgressbar.close();
				}
				plus.nativeUI.toast("下载文件失败: " + msg);
			},
			downloading: function(progress, tips) {
				//console.log('下载进度为:' + progress + '%,' + tips);
				if (showProgressbar) {
					showProgressbar.setTitle(parseInt(progress) + "%," + tips);
				}
			}
		}, IsWithCache);
	}
	
	//下载文件
	owner.downloadFile1 = function(address, callback) {
		plus.nativeUI.showWaiting("正在下载文件请等待...");
		var savename = "_downloads/" + address.substr(address.lastIndexOf("/") + 1).toLowerCase();
		var param = {
			method: "post",
			filename: savename
		};
		var tempcallback = function(d, status) {
			plus.nativeUI.closeWaiting();
			if(status == 200) {
				callback(savename);
			} else {
				plus.nativeUI.toast("下载文件失败: " + status);
			}
		};
		var dtask = plus.downloader.createDownload(address, param, tempcallback);
		dtask.start();
	}

    // 上传文件
    // callback 上传成功回掉函数
    // 上传失败回掉函数 added by liuj 20180817
	owner.uploadFile = function(file, callback, errorcallback) {		
		var setting = app.getSettings();
		var state = owner.getState();
		var timeout = 200;

		var wt = plus.nativeUI.showWaiting("文件开始上传...");
		var task = plus.uploader.createUpload(owner.root + "/api.php?s=" + "/Feedback/Upload", {
				method: "POST",
				timeout: timeout,
				retry:1
			},
			function(t, status) {
				wt.close();
				if(status == 200) {
					if(t.responseText != "upload failed.") {
						//plus.nativeUI.toast("上传成功");
						//console.log("上传成功1：" + t.responseText);
						callback && callback(t);
					} else {
						console.log("上传失败1：" + t.responseText);
						plus.nativeUI.toast("上传失败：" );
						errorcallback && errorcallback(t);
						plus.nativeUI.closeWaiting();
					}
				} else {
					plus.nativeUI.closeWaiting();
					console.log("上传失败2：" + status);
					errorcallback && errorcallback(t);					
					plus.nativeUI.toast("上传失败");
				}
			}
		);
		task.addData("userid", state.userid);
		task.addData("sessionid", state.sessionid);
		var longt = file.longt == null ? '' : file.longt;
		task.addData("longt", longt.toString());
		var lat = file.lat == null ? '' : file.lat;
		task.addData("lat", lat.toString());
		var pcoords_type = file.pcoords_type == null ? '' : file.pcoords_type;
		task.addData("pcoords_type", pcoords_type.toString());
		var accuracy = file.accuracy == null ? '' : file.accuracy;
		task.addData("accuracy", accuracy.toString());
		task.addFile(file.path, {
			key: file.name
		});
		task.start();
		// 节约内存，正式运行 不执行监听，以下代码可保留测试使用
//		task.addEventListener("statechanged", function(task1, status) {
//			if(status == 404) return;
//			switch(task1.state) {
//				case 3: 
//				    var current = parseInt(100 * task1.uploadedSize / task1.totalSize);
//				    if(current != 0 && current%20 == 0){
//				    	console.log("文件上传" + current + "%");
//				        plus.nativeUI.showWaiting("文件上传" + current + "%");
//				    }				    
//				break;				
//				case 4:
//				    console.log(file.name + "上传完成");
//				break;
//				default:
//				    console.log(file.name + " default shi sha :" + task1.state);
//				break;
//			}			
//		});
	}

	// files 文件
	// callback 上传成功回掉函数
	// errorcallback 上传失败回掉函数 added by liuj 20180817
	owner.uploadFiles = function(files, callback, errorcallback) {
		//判断网络状态
		if(plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
			plus && plus.nativeUI && plus.nativeUI.closeWaiting();
			plus && plus.nativeUI && plus.nativeUI.toast("未连接到网络！");
			return;
		}
		var wt = plus.nativeUI.showWaiting("文件开始上传...");
		var fileindex = 0;
		var length = files.length;

		function tempcallback() {
			app.uploadFile(files[fileindex], function(t) {
				//files[fileindex].path = t.responseText;
				var obj = eval("(" + t.responseText + ")");
				files[fileindex].name = obj.id;
				files[fileindex].id = obj.id;
				fileindex += 1;
				if(fileindex == length) {
					console.log('fileindex == length');
					plus.nativeUI.closeWaiting();
					callback();
				} else
					tempcallback();
			}, errorcallback);
		}
		if(length > 0) tempcallback();
		else {
			plus.nativeUI.closeWaiting();
			callback();
		}
	}
	
	// files 文件2
	// callback 上传成功回掉函数
	// errorcallback 上传失败回掉函数 added by liuj 20180817
	owner.uploadFiles2 = function(files, callback, errorcallback) {
		//判断网络状态
		if(plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE) {
			plus && plus.nativeUI && plus.nativeUI.closeWaiting();
			plus && plus.nativeUI && plus.nativeUI.toast("未连接到网络！");
			return;
		}
		var fileindex = 0;
		var length = files.length;
		function tempcallback() {
			// id 非空的即为已在服务器上存在的
			if(files[fileindex].id != '' && files[fileindex].id != undefined && files[fileindex].id != null){
				files[fileindex].name = files[fileindex].id;
				fileindex += 1;
				if(fileindex == length) {
					console.log('fileindex == length  2');
					plus.nativeUI.closeWaiting();
					callback();
				} else{
					console.log('fileindex != length  2');
					tempcallback();
				}				
			}else{
				// 上传图片
				app.uploadFile(files[fileindex], function(t) {
					var obj = eval("(" + t.responseText + ")");
					files[fileindex].name = obj.id;
					files[fileindex].id = obj.id;// 上传成功回写id 
					fileindex += 1;
					if(fileindex == length) {
						//console.log('fileindex == length');
						plus.nativeUI.closeWaiting();
						callback();
					} else{
						console.log('fileindex != length');
						tempcallback();
					}					
				}, function(error){
					console.log(error);
					console.log(JSON.stringify(error));
					errorcallback && errorcallback();
				});
			}			
		}
		if(length > 0) tempcallback();
		else {
			plus.nativeUI.closeWaiting();
			callback();
		}
	}
	
	owner.uploadMesFile = function(file, callback) {
		var setting = app.getSettings();
		var state = owner.getState();
		var task = plus.uploader.createUpload(owner.root + "/api.php?s=" + "/project/Upload", {
				method: "POST"
			},
			function(t, status) {
				if(status == 200) {
					if(t.responseText != "upload failed.") {
						callback && callback(t);
					} else {
						plus.nativeUI.toast("图片传送失败：" + t.responseText);
					}
				} else {
					plus.nativeUI.toast("图片传送失败：" + status);
				}
			}
		);
		task.addData("userid", state.userid);
		task.addData("sessionid", state.sessionid);
		task.addFile(file.path, {
			key: file.name
		});
		task.start();
	}
	owner.displayFile = function(fileObj) {
		var name = fileObj.getAttribute("src");
		var suffix = name.substr(name.lastIndexOf('.'));
		var url = "";
		if(suffix == ".mov" || suffix == ".3gp" || suffix == ".mp4" || suffix == ".avi") {
			url = "../common/display_video.html";
		} else {
			url = "../common/display_image.html";
		}
		w = plus.webview.create(url, "displayFile", {
			hardwareAccelerated: true,
			scrollIndicator: 'none',
			scalable: true,
			bounce: "all"
		});
		w.addEventListener("loaded", function() {
			w.evalJS("loadMedia('" + name + "')");
		}, false);
		w.addEventListener("close", function() {
			w = null;
		}, false);
		w.show("pop-in");
	};

	/*
	 * 预加载窗口
	 */
	owner.preloadWindow = function(id, url, extras, styles) {
		owner.show && console.log("预加载窗口:" + url);
		var param = {
			'id': id,
			'url': url,
			'extras': extras,
			'styles': styles
		};
		return $.preload(param);
	};

	owner.curentWindow = function() {
		return plus.webview.currentWebview();
	};
	/*
	* 获取随机颜色值
	*/
	owner.mycolor = function() {
		return "#" + ("00000" + ((Math.random() * 16777215 + 0.5) >> 0).toString(16)).slice(-6);
	};
	//绑定双击退出仅支持安卓
	owner.bindQuit = function() {
		var backButtonPress = 0;
		$.back = function(event) {
			backButtonPress++;
			if(backButtonPress > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast('再按一次退出应用');
			}
			setTimeout(function() {
				backButtonPress = 0;
			}, 1000);
			return false;
		};
	};

	//绑定单击返回仅支持安卓
	owner.bindBack = function(close) {
		$.back = function(event) {
			if(close)
				plus && plus.webview.currentWebview().close();
			else
				plus && plus.webview.currentWebview().hide();
			return false;
		};
	};

	/*
	 * 禁用回退
	 */
	owner.stopBack = function() {
		$.back = function(event) {
			return false;
		};
	};
	/*
	 * 预加载窗口
	 */
	owner.preloadWindow = function(id, url, extras, styles) {
		owner.show && console.log("预加载窗口:" + url);
		var param = {
			'id': id,
			'url': url,
			'extras': extras,
			'styles': styles
		};
		return $.preload(param);
	};

	/*
	 * 显示窗口 针对预加载或已经隐藏的未关闭窗口
	 */
	owner.showWindow = function(id, aniShow, styles) {
		owner.show && console.log("显示窗口:" + id);
		var param = {
			'id': id,
			'show': {
				'aniShow': aniShow || 'slide-in-right'
			},
			'styles': styles
		};
		return $.openWindow(param);
	};
	/**
	 * 关闭当前窗口，一般界面自带按钮已经实现调用，该方法为手动触发调用
	 * 可以执行界面初始化的beforeback事件
	 */
	owner.back = function() {
		$.back();
	}

	/*
	 * 隐藏窗口,非MUI提供,非正常操作流程情况下使用
	 */
	owner.hideWindow = function(id_wvobj, aniHide, duration, extras) {
		owner.show && console.log("隐藏窗口:" + id);
		plus.webview.hide(id_wvobj, aniHide || "auto", duration, extras);
	};

	/*
	 * 关闭窗口,非MUI提供,非正常操作流程情况下使用
	 */
	owner.closeWindow = function(id_wvobj, aniClose, duration, extras) {
		owner.show && console.log("关闭窗口:" + id_wvobj);
		plus.webview.close(id_wvobj, aniClose || "auto", duration, extras);
	};

	/*
	 * 关闭以前窗口
	 */
	owner.closePreviewWindow = function(curwebview) {
		if(curwebview)
			return;
		var opener = curwebview.opener();
		if(opener)
			return;
		owner.closePreviewWindow(opener);
		opener.close();
	};

	/*
	 * 关闭其他窗口
	 */
	owner.closeOtherWindow = function(curwebview) {
		var allwebview = plus.webview.all();
		for(var i = 0; i < allwebview.length; i++) {
			if(allwebview[i].id == curwebview.id) {
				//console.log(allwebview[i].id);
				continue;
			} else {
				//console.log(allwebview[i].id);
				allwebview[i].close();
			}
		}
	};

	/*
	 * 显示等待
	 */
	owner.showWaiting = function(title) {
		plus.nativeUI.showWaiting(title);
	};

	/*
	 * 关闭等待
	 */
	owner.closeWaiting = function() {
		plus.nativeUI.closeWaiting();
	};

	/*
	 * 在现有元素后添加一个新元素 
	 */
	owner.insertAfter = function(newElement, targetElement) {
		var parent = targetElement.parentNode;
		if(parent.lastChild == targetElement) {
			parent.appendChild(newElement);
		} else {
			parent.insertBefore(newElement, targetElement.nextSibling);
		}
	}
	
	// 获取文件后缀
	owner.getExt = function(fileStr) {
		return fileStr.substring(fileStr.lastIndexOf('.') + 1);
	}
	
	// 判断是否为url
	owner.isUrl = function(str) { 
		var RegUrl = new RegExp(); 
		RegUrl.compile("^[A-Za-z]+://[A-Za-z0-9-_]+\\.[A-Za-z0-9-_%&\?\/.=]+$");
		if (!RegUrl.test(str)) { 
		    return false; 
		}
		return true; 
	}

	//清除图片和文件缓存
	owner.clearImageAndFiles = function(){
		var DownloadUtil = require('scripts/Core/DownLoadUtil.js');
		DownloadUtil.clearAllLocalFileCache(function(msg) {
			console.log('清除缓存成功:' + msg);
		}, function(e) {
			console.log('清除缓存失败:' + e);
		});
	}

	//打开视频
	owner.displayVideo = function(src) {
		var suffix = src.substr(src.lastIndexOf('.'));
		var url = '';
		if(suffix == '.mov' || suffix == '.3gp' || suffix == '.mp4' || suffix == '.avi') {
			url = '../../../page/common/video.html';
		} else {
			mui.toast('视频格式有误！');
			return;
		}
		w = plus.webview.create(url, url, {
			hardwareAccelerated: true,
			scrollIndicator: 'none',
			scalable: true,
			bounce: 'all'
		});
		w.addEventListener('loaded', function() {
			w.evalJS('loadMedia("' + src + '")');
		}, false);
		w.addEventListener('close', function() {
			w = null;
		}, false);
		w.show('pop-in');
	}
	
	// 获取网速
	owner.getNetSpeed = function(total_data){
		TrafficStats = plus.android.importClass("android.net.TrafficStats");
		traffic_data = TrafficStats.getTotalRxBytes() - total_data;
        total_data = TrafficStats.getTotalRxBytes();
        document.getElementById("net").value = bytesToSize(traffic_data);
        console.log(bytesToSize(traffic_data));
	}
	
	//将byte自动转换为其他单位
    owner.bytesToSize = function(bytes) {
        if (bytes === 0) return '0 B/s';
        var k = 1000, // or 1024
            sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s', 'EB/s', 'ZB/s', 'YB/s'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
       return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
    }

    /*
     * @description 公用的刷新消息的方法
     * @param CurrentWebview 当前webview
     * @param offline 是否离线
     * @param closeWebview 是否关闭当前webview
     * @param minfoid 消息id
     * @param refreshIndexMesSum 是否刷新消息数量 -角标
     */
    owner.pageBack4refreshMsg = function(CurrentWebview, offline, closeWebview, messageId, refreshIndexMesSum, refreshKanban){
        if(offline == true){
			app.closeWaiting();
			if(closeWebview) CurrentWebview.close();
		}else{
			// 先处理父页面
			var opener = CurrentWebview.opener();
			if(opener){
				if(CurrentWebview.closeparent) {
					// 关闭父页面
					opener.close();
				}
			}
			
			// 消息数量-角标
			if(refreshIndexMesSum){
				var indexPage = plus.webview.getWebviewById("index");
			    //indexPage.evalJS("mes_sum()");
			}			
			
			// 刷新消息页面
			var chatlistPage = plus.webview.getWebviewById("home-message");
			if(chatlistPage && ((opener && opener.id != 'home-message') || !opener)){
				chatlistPage.evalJS("torefresh(true)");
			}

			app.closeWaiting();
			if(closeWebview) CurrentWebview.close();
			
		}	
   }
    // 模拟访问国家物联网
    // author liuj
    owner.vVisitCniotroot = function(unicode){
    	var param = {};
		param.unicode = unicode;		
		app.ajax('/Concretecoupon/info/vVisitCniotroot', param, function(data) {
			// 没有 任何 返回 - 不管任何异常
		});
    }
    // help 提示初始化 - 以menupopover 为 基础的
    // authour liuj
    owner.helpPopverInit = function(){
    	document.querySelector('.mui-backdrop').addEventListener('tap', function(e) {
    		return false;
    	});
    }
    // help 提示知道按钮  自定义的 
    // author liuj
    owner.helpKnown = function(strHelpKnown, strPopover, strInput, callback){
    	if(strInput)
    		document.getElementById(strInput).classList.add('clh-in');
        document.getElementById(strPopover).style.display = '';
    	//clh-help-known
    	document.getElementById(strHelpKnown).addEventListener('tap', function(){
    		// 关闭遮盖层
    		//document.getElementById('divCover').style.width = 0;
    		if(strInput)
    		    document.getElementById(strInput).classList.remove('clh-in');
			document.getElementById(strPopover).style.display = 'none';
			
			callback && callback();
    	});    	
    }

}(mui, window.app = {}));
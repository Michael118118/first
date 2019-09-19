(function($, owner) {
	owner.binder = {};
	//输出变量调试
	owner.print = function(obj) {
		obj && console.log(JSON.stringify(obj));
	};
	owner.isEmpty = function(val) {
		return val == undefined || val == null || val == '' || val == 'null' || val == 'undefined';
	};
	owner.notEmpty = function(val) {
		return val != undefined && val != null && val != '' && val != 'null' && val != 'undefined';
	};
	owner.isNull = function(val) {
		return val == undefined || val == null;
	};
	owner.notNull = function(val) {
		return val != undefined && val != null;
	};
	owner.objempty = function(obj) {
		for(var n in obj) {
			return false;
		}
		return true;
	};
	owner.objlength = function(obj) {
		var num = 0;
		for(var n in obj) {
			num++;
		}
		return num;
	};
	//聊天框时间装换
	owner.add0 = function(m) {
		return m < 10 ? '0' + m : m;
	};
	owner.UnixDateToStr_year = function(unixdate) {
		if(!unixdate) {
			return null;
		}
		var nowtime = new Date().getTime();
		nowtime = nowtime / 1000;
		var give_time = new Date(unixdate * 1000);
		var dtime = nowtime - unixdate;

		var year = give_time.getFullYear();
		var month = give_time.getMonth() + 1;
		var day = give_time.getDate();
		var hours = give_time.getHours();
		var minutes = give_time.getMinutes();
		var seconds = give_time.getSeconds();

		var year1 = new Date().getFullYear();
		var month1 = new Date().getMonth() + 1;
		var day1 = new Date().getDate();
		var hours1 = new Date().getHours();
		var minutes1 = new Date().getMinutes();
		var seconds1 = new Date().getSeconds();

		var beginToday = owner.StringToDate(year1 + '-' + month1 + '-' + day1 + ' 00:00:00');
		beginToday = beginToday.getTime() / 1000;
		var endMonth = owner.StringToDate(year + '-' + (month + 1) + '-' + day + ' 00:00:00');
		endMonth = endMonth.getTime() / 1000;
		var endYear = owner.StringToDate((year + 1) + '-' + month + '-' + day + ' 00:00:00');
		endYear = endYear.getTime() / 1000;
		
		return owner.add0(year) + '-' + owner.add0(month) + '-' + owner.add0(day) + ' ' + owner.add0(hours) + ':' + owner.add0(minutes);

		/*
		if(unixdate>beginToday && dtime/3600 < 24){
			return owner.add0(hours)+':'+owner.add0(minutes);
		}else if(unixdate<=beginToday &&  endMonth> nowtime){
			if(unixdate<=beginToday && dtime/3600<24){
				return '1天前';
			}else{
				return Math.floor(dtime/(3600*24)) + '天前';
			}
			
		}//还有月前
		else if( endMonth <= nowtime && endYear > nowtime){
			return Math.floor(dtime/(3600*24*30))  + '月前';
		}else{
			return Math.floor(dtime/(3600*24*365))  + '年前';
		}
		*/
	};
	owner.UnixDateToStr = function(unixdate) {
		if(!unixdate) {
			return null;
		}
		var nowtime = new Date().getTime();
		nowtime = nowtime / 1000;
		var give_time = new Date(unixdate * 1000);
		var dtime = nowtime - unixdate;

		var year = give_time.getFullYear();
		var month = give_time.getMonth() + 1;
		var day = give_time.getDate();
		var hours = give_time.getHours();
		var minutes = give_time.getMinutes();
		var seconds = give_time.getSeconds();

		var year1 = new Date().getFullYear();
		var month1 = new Date().getMonth() + 1;
		var day1 = new Date().getDate();
		var hours1 = new Date().getHours();
		var minutes1 = new Date().getMinutes();
		var seconds1 = new Date().getSeconds();

		var beginToday = owner.StringToDate(year1 + '-' + month1 + '-' + day1 + ' 00:00:00');
		beginToday = beginToday.getTime() / 1000;
		var endMonth = owner.StringToDate(year + '-' + (month + 1) + '-' + day + ' 00:00:00');
		endMonth = endMonth.getTime() / 1000;
		var endYear = owner.StringToDate((year + 1) + '-' + month + '-' + day + ' 00:00:00');
		endYear = endYear.getTime() / 1000;
		if(unixdate > beginToday && dtime / 3600 < 24) {
			return owner.add0(hours) + ':' + owner.add0(minutes) + ':' + owner.add0(seconds);
		} else {
			return owner.add0(year) + '-' + owner.add0(month) + '-' + owner.add0(day) + ' ' + owner.add0(hours) + ':' + owner.add0(minutes);
		}
		/*
		if(unixdate>beginToday && dtime/3600 < 24){
			return owner.add0(hours)+':'+owner.add0(minutes);
		}else if(unixdate<=beginToday &&  endMonth> nowtime){
			if(unixdate<=beginToday && dtime/3600<24){
				return '1天前';
			}else{
				return Math.floor(dtime/(3600*24)) + '天前';
			}
			
		}//还有月前
		else if( endMonth <= nowtime && endYear > nowtime){
			return Math.floor(dtime/(3600*24*30))  + '月前';
		}else{
			return Math.floor(dtime/(3600*24*365))  + '年前';
		}
		*/
	};
	//时间戳转日期
	owner.UnixDateToJsDate = function(unixdate) {
		return new Date(unixdate * 1000);
	};
	//日期转字符串
	owner.DateToString = function(val, fmt) {
		//"yyyy-MM-dd hh:mm:ss.S
		var o = {
			"M+": val.getMonth() + 1, //月份 
			"d+": val.getDate(), //日  
			"h+": val.getHours(), //小时 
			"m+": val.getMinutes(), //分 
			"s+": val.getSeconds(), //秒 
			"q+": Math.floor((val.getMonth() + 3) / 3), //季度 
			"S": val.getMilliseconds() //毫秒 
		};
		if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (val.getFullYear() + "").substr(4 - RegExp.$1.length));
		for(var k in o)
			if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	};
	//字符串转日期
	owner.StringToDate = function(val) {
		val = val.replace(/-/g, "/");
		var date = new Date(val);
		return date;
	};
	// 获取时间戳 13位 毫秒
	owner.timeStamp = function(){
		var timestamp = (new Date()).valueOf();
		return timestamp;
	}
	owner.bindSelectIndex = function(selIndexArr, selIndexPage, onChange) {
		var selIndexHash = {};
		window.addEventListener("dicSelected", function(e) {
			var type = e.detail.type;
			var objId = e.detail.objId;
			var doChange = e.detail.doChange;   // 是否强制执行change
			var dom = document.getElementById(objId);
			if((onChange && dom.value != e.detail.name) || doChange) {
				if(onChange(objId, e.detail.id, e.detail.name)) {
					dom.setAttribute("selid", e.detail.id);
					dom.value = e.detail.name;
				}
			} else {
				dom.setAttribute("selid", e.detail.id);
				dom.value = e.detail.name;
			}
		});
		if(owner.notNull(selIndexArr)) {
			for(var i = 0; i < selIndexArr.length; i++) {
				var sia = selIndexArr[i];
				var obj = document.getElementById(sia.id);
				if(obj == undefined) return;
				selIndexHash[sia.id] = sia;
				if(sia.defaults) {
					obj.setAttribute("selid", sia.defaults.selId);
					obj.value = sia.defaults.selValue;
				}
				obj.addEventListener("tap", function() {
					var clickSi = selIndexHash[this.id];

					// 打开选择页面
					window.openSelPage = function(){
						var filter = {};
						if(clickSi.filter) {
							for(var k in clickSi.filter) {
								if(typeof clickSi.filter[k] == "function")
									filter[k] = clickSi.filter[k]();
								else
									filter[k] = clickSi.filter[k];
							}
						}
						mui.fire(selIndexPage, 'fresh', {
							"objId": clickSi.id,
							"type": clickSi.type,
							"doChange": clickSi.doChange,
							"idfield": clickSi.idfield || "",
							"title": clickSi.title || "请选择",
							"filter": filter,
							"values": clickSi.values
						});
					};
					
					// confirm
					if(clickSi.confirm) {						
						if(typeof clickSi.confirm == "function")
							clickSi.confirm(openSelPage);
					}else{
						openSelPage();
					}

				});
			}
		}
	};
	//是否在数组中
	owner.in_array = function(stringToSearch, arrayToSearch) {
		for(s = 0; s < arrayToSearch.length; s++) {
			thisEntry = arrayToSearch[s].toString();
			if(thisEntry == stringToSearch) {
				return true;
			}
		}
		return false;
	};
	//获取文件后缀
	owner.fileExt = function(path) {
		var extStart = path.lastIndexOf(".");
		var ext = path.substring(extStart + 1, path.length).toLowerCase();
		return ext;
	};
	//计算地址
	owner.calAddress = function(path) {
		var matarr = ['省', '市', '区', '自治区'];
		var offsuffix = new RegExp(matarr.join('|'), 'ig');
		var res = {};
		//空判断
		if(path == "")
			return res;
		var resArr = [],
			provinceSval, citySval, areaSval;
		var cloneobj = function(obj) {
			var res = {};
			for(var k in obj) {
				res[k] = obj[k];
			}
			return res;
		}
		for(var i = 0; i < cityData3.length; i++) {
			//计算省
			var tempRes = {};
			var pro = cityData3[i]['text'];
			var prolike = pro.replace(offsuffix, '');
			if(path.indexOf(prolike) >= 0) {
				tempRes['province'] = pro;
			}
			var procitys = cityData3[i].children;
			if(procitys && procitys.length > 0) {
				for(var j = 0; j < procitys.length; j++) {
					//计算地市
					var city = procitys[j]['text'];
					var citylike = city.replace(offsuffix, '');
					if(path.indexOf(citylike) >= 0) {
						tempRes['city'] = city;
						if(tempRes && tempRes['province'] && tempRes['city'] && tempRes['area']) {
							resArr.push(cloneobj(tempRes));
							tempRes['city'] = undefined;
							tempRes['area'] = undefined;
						}
					}
					var cityareas = procitys[j].children;
					if(cityareas && cityareas.length > 0) {
						for(var k = 0; k < cityareas.length; k++) {
							//计算区县
							var areas = cityareas[k]['text'];
							var areaslike = areas.replace(offsuffix, '');
							if(path.indexOf(areaslike) >= 0) {
								tempRes['area'] = areas;
								if(tempRes && tempRes['province'] && tempRes['city'] && tempRes['area']) {
									resArr.push(cloneobj(tempRes));
									tempRes['area'] = undefined;
								}
							}
							if(tempRes['area'] != undefined) {
								citySval = tempRes['city'];
								//反推市
								if(citySval == undefined) {
									tempRes['city'] = city;
								}
								//反推省
								provinceSval = tempRes['province'];
								if(provinceSval == undefined) {
									tempRes['province'] = pro;
								}
								if(tempRes && tempRes['province'] && tempRes['city'] && tempRes['area']) {
									resArr.push(cloneobj(tempRes));
									tempRes['province'] = provinceSval;
									tempRes['city'] = citySval;
									tempRes['area'] = undefined;
								}
							}
						}
					}
					if(tempRes['city'] != undefined) {
						//反推省
						provinceSval = tempRes['province'];
						if(provinceSval == undefined) {
							tempRes['province'] = pro;
						}
						//反推区县
						areaSval = tempRes['area'];
						if(areaSval == undefined && cityareas && cityareas.length > 0) {
							tempRes['area'] = cityareas[0]['text'];
						}
						if(tempRes && tempRes['province'] && tempRes['city'] && tempRes['area']) {
							resArr.push(cloneobj(tempRes));
							tempRes['province'] = undefined;
							tempRes['city'] = undefined;
							tempRes['area'] = undefined;
						}
					}
				}
			}
			//找到就不继续查找
			if(tempRes['province'] != undefined) {
				//反推省
				if(tempRes['city'] == undefined && procitys && procitys.length > 0) {
					tempRes['city'] = procitys[0]['text'];
				}
				//反推区县
				if(tempRes['area'] == undefined && procitys && procitys.length > 0 && procitys[0] && procitys[0]['children'] && procitys[0]['children'].length > 0) {
					tempRes['area'] = procitys[0]['children'][0]['text'];
				}
			}
			if(tempRes && tempRes['province'] && tempRes['city'] && tempRes['area'])
				resArr.push(cloneobj(tempRes));
		}
		//计算详细地址	
		var getMatchReg = function(filter) {
			filter = filter.replace(offsuffix, '');
			return new RegExp(filter, 'ig');
		}
		if(resArr.length > 0) {
			var matchindex = 0,
				prematchlevel = 0,
				matchlevel = 0;
			for(var n = 0; n < resArr.length; n++) {
				matchlevel = 0;
				var prolike = resArr[n]['province'].replace(offsuffix, '');
				if(path.indexOf(prolike) >= 0) {
					matchlevel += prolike.length;
				}
				var citylike = resArr[n]['city'].replace(offsuffix, '');
				if(citylike != prolike && path.indexOf(citylike) >= 0) {
					matchlevel += citylike.length;
				}
				var arealike = resArr[n]['area'].replace(offsuffix, '');
				if(arealike != citylike && arealike != prolike && path.indexOf(arealike) >= 0) {
					matchlevel += arealike.length;
				}
				if(prematchlevel < matchlevel) {
					prematchlevel = matchlevel;
					matchindex = n;
				}
			}
			res = resArr[matchindex];
		}
		var detail = path;
		var mobilereg = /1[3|4|5|7|8]\d{9}/;
		if(mobilereg.test(detail)) {
			res['mobile'] = detail.match(mobilereg);
			detail = detail.replace(mobilereg, '');
		}

		if(res['province'] != undefined)
			detail = detail.replace(getMatchReg(res['province']), '');
		if(res['city'] != undefined)
			detail = detail.replace(getMatchReg(res['city']), '');
		if(res['area'] != undefined)
			detail = detail.replace(getMatchReg(res['area']), '');
		detail = detail.replace(offsuffix, '');
		res['detail'] = detail;
		return res;
	};
	owner.getFormValues = function(formId) {
		var form = document.getElementById(formId);
		var inputs = form.getElementsByTagName("input");
		var textareas = form.getElementsByTagName("textarea");
		var obj = {};
		for(var i = 0; i < inputs.length; i++) {
			var ele = inputs[i];
			var type = ele.getAttribute("type");
			switch(type) {
				case "radio":
					var name = ele.getAttribute("name");
					var checked = ele.getAttribute("checked");
					if(checked === "")
						obj[name] = ele.value;
					break;
				case "text":
				default:
					if(ele.getAttribute('name')) {
						var name = ele.getAttribute("name");
						obj[name] = obj[name] ? obj[name] + "," + ele.value : ele.value;
					} else {
						var id = ele.getAttribute("id");
						if(ele.getAttribute("readonly") == "readonly"){
							if(this.notEmpty(ele.getAttribute("selid")) ){// 如无有效值不反悔null
								obj[id] = ele.getAttribute("selid");
							}
						}							
						else
							obj[id] = ele.value;
					}
					break;
			}
		}
		for(var i = 0; i < textareas.length; i++) {
			var ele = textareas[i];
			var id = ele.getAttribute("id");
			if(ele.getAttribute("readonly") == "readonly")
				obj[id] = ele.getAttribute("selid");
			else
				obj[id] = ele.value;
		}
		return obj;
	};
	owner.checkEmpty = function(obj, keys) {
		var res = "";
		if(this.notNull(keys)) {
			for(var i = 0; i < keys.length; i++) {
				var key = keys[i];
				var val = obj[key.id];
				if(!this.notempty(val))
					res += key.toast + "; ";
			}
		}
		return res;
	};
	owner.clearEmpty = function(formId, excludes, includes) {
		var exStr = this.notNull(excludes) ? excludes.join(",") : "";
		var form = document.getElementById(formId);
		var inputs = form.getElementsByTagName("input");
		for(var i = 0; i < inputs.length; i++) {
			var ele = inputs[i];
			var id = ele.getAttribute("id");
			var selid = ele.getAttribute("selid");
			if(exStr.indexOf(id) == -1) {
				ele.value = "";
				if(selid) {
					ele.setAttribute("selid", '');
				}
			}

		}
		if(this.notNull(includes)) {
			for(var i = 0; i < includes.length; i++) {
				var val = includes[i];
				var ele = document.getElementById(val);
				var tagName = ele.tagName.toLowerCase();
				if(tagName == "input" || tagName == "select")
					document.getElementById(val).value = '';
				else document.getElementById(val).innerHTML = '';
			}
		}
	};
	owner.getFormToast = function(formId, excludes) {
		var form = document.getElementById(formId);
		var inputs = form.getElementsByTagName("input");
		var exStr = this.notNull(excludes) ? excludes.join(',') : "";
		var resHash = {};
		var res = [];
		for(var i = 0; i < inputs.length; i++) {
			var ele = inputs[i];
			var type = ele.getAttribute("type");
			if(type == "radio")
				continue;
			var id = ele.getAttribute("id");
			var name = ele.getAttribute('name');
			if(exStr == "" && resHash[name || id] == undefined) {
				res.push({
					id: name || id,
					toast: ele.getAttribute("placeholder")
				});
				resHash[name || id] = true;
			} else
			if(exStr.indexOf(id) == -1 && resHash[name || id] == undefined) {
				res.push({
					id: name || id,
					toast: ele.getAttribute("placeholder")
				});
				resHash[name || id] = true;
			}

		}
		return res;
	};
	owner.notempty = function(val) {
		return val != undefined && val != null && val != "";
	};
	owner.createDateBtn1 = function(obj, minDate, maxDate, now) {
		var dom = document.getElementById(obj);
		dom.addEventListener('tap', function() {
			var min = null;
			var max = null;
			if(minDate != undefined && minDate != "") {
				if(typeof minDate == "function") {
					min = new Date(minDate().replace(/-/, "/"));
				} else
					min = new Date(minDate.replace(/-/, "/"));
			}
			if(maxDate != undefined && maxDate != "") {
				if(typeof minDate == "function") {
					max = new Date(maxDate().replace(/-/, "/"));
				} else
					max = new Date(maxDate.replace(/-/, "/"));
			}
			if(now) {
				var dDate = now;
			} else {
				var dDate = new Date();
			}

			var selparam = {
				title: "请选择日期",
				date: dDate
			};
			if(utils.notNull(minDate)) selparam.minDate = minDate;
			if(utils.notNull(maxDate)) selparam.maxDate = maxDate;
			plus.nativeUI.pickDate(function(e) {
				var val = utils.DateToString(e.date, "yyyy-MM-dd");
				if(obj=="end_time"){
					document.getElementById(obj).children[3].value = val;
					document.getElementById(obj).children[3].setAttribute("selid", val);
				}else{
					dom.value = val;
					dom.setAttribute("selid", val);
				}
				
			}, function(e) {}, selparam);
		});
	};
	owner.createDateBtn = function(obj, minDate, maxDate, now, callback) {
		var dom = document.getElementById(obj);
		dom.addEventListener('tap', function() {
			var min = null;
			var max = null;
			if(minDate != undefined && minDate != "") {
				if(typeof minDate == "function") {
					min = new Date(minDate().replace(/-/, "/"));
				} else
					min = new Date(minDate.replace(/-/, "/"));
			}
			if(maxDate != undefined && maxDate != "") {
				if(typeof minDate == "function") {
					max = new Date(maxDate().replace(/-/, "/"));
				} else
					max = new Date(maxDate.replace(/-/, "/"));
			}
			if(now) {
				var dDate = now;
			} else {
				var dDate = new Date();
			}

			var selparam = {
				title: "请选择日期",
				date: dDate
			};
			if(utils.notNull(minDate)) selparam.minDate = minDate;
			if(utils.notNull(maxDate)) selparam.maxDate = maxDate;
			plus.nativeUI.pickDate(function(e) {
				var val = utils.DateToString(e.date, "yyyy-MM-dd");
				dom.value = val;
				dom.setAttribute("selid", val);
				callback && callback(obj, val);
			}, function(e) {}, selparam);
		});
	};
	
	owner.createTimeBtn = function(obj, minDate, maxDate, now, callback) {
		var dom = document.getElementById(obj);
		dom.addEventListener('tap', function() {
			var min = null;
			var max = null;
			if(minDate != undefined && minDate != "") {
				if(typeof minDate == "function") {
					min = new Date(minDate().replace(/-/, "/"));
				} else
					min = new Date(minDate.replace(/-/, "/"));
			}
			if(maxDate != undefined && maxDate != "") {
				if(typeof minDate == "function") {
					max = new Date(maxDate().replace(/-/, "/"));
				} else
					max = new Date(maxDate.replace(/-/, "/"));
			}
			var dDate = new Date();
			var selparam = {
				title: "请选择时间",
				date: dDate
			};
			if(this.notNull(minDate)) selparam.minDate = minDate;
			if(this.notNull(maxDate)) selparam.maxDate = maxDate;
			plus.nativeUI.pickTime(function(e) {
				var d = e.date;
				dom.value = utils.DateToString(e.date, "hh:mm:ss");
				dom.setAttribute("selid", val);
				callback && callback(obj, val);
			}, function(e) {}, selparam);
		});
	};
	owner.createH5DateBtn = function(obj) {
		var dom = document.getElementById(obj);
		var picter = new mui.DtPicker({
			"type": "date"
		});
		dom.addEventListener('tap', function() {
			picter.show(function(e) {
				dom.value = e.text;
				dom.setAttribute("selid", e.text);
			});
		}, false);
	};
	owner.createH5TimeBtn = function(obj) {
		var dom = document.getElementById(obj);
		var picter = new mui.DtPicker({
			"type": "time"
		});
		dom.addEventListener('tap', function() {
			picter.show(function(e) {
				dom.value = e.text + ":00";
				dom.setAttribute("selid", e.text + ":00");
			});
		}, false);
	};
	owner.createH5DateTimeBtn = function(obj, minDate, maxDate) {
		var dom = document.getElementById(obj);
		var picter = new mui.DtPicker({});
		dom.addEventListener('tap', function() {
			picter.show(function(e) {
				dom.value = e.text + ":00";
				dom.setAttribute("selid", e.text + ":00");
			});
		}, false);
	};
	owner.selectProject = function(param, callback) {
		var d = new Date().getTime();
		var funname = d + Math.random();
		var domid = this.notempty(param.containerId) ? param.containerId : param.id;
		document.getElementById(domid).addEventListener('tap', function() {
			var r_projectid = '';
			var r_buildingid = '';
			var r_floorid = '';
			var r_roomid = '';
			if(param.projectid) r_projectid = document.getElementById(param.projectid).value || '';
			if(param.buildingid) r_buildingid = document.getElementById(param.buildingid).value || '';
			if(param.floorid) r_floorid = document.getElementById(param.floorid).value || '';
			if(param.roomid) r_roomid = document.getElementById(param.roomid).value || '';

			app.openWindow('mesproject', '_www/page/common/project.html', {
				projectid: r_projectid,
				buildingid: r_buildingid,
				floorid: r_floorid,
				roomid: r_roomid,
				is_roomcheck: param.is_roomcheck,
				is_floorcheck: param.is_floorcheck,
				showfloor: param.showfloor,
				showroom: param.showroom,
				funname: funname,				
			});
		});

		window.addEventListener(funname || 'changeProjectname', function(event) {
			callback(event.detail);
		});
	};
	owner.chooseTask = function(param) {
		var d = new Date().getTime();
		var funname = d + Math.random();
		var domid = this.notempty(param.containerId) ? param.containerId : param.id;		
		document.getElementById(domid).addEventListener('tap', function() {
			var proid = document.getElementById(param.projectid).value;
			if(!proid) {
				plus.nativeUI.toast("请先选择位置");
				return false;
			}
			var taskid = document.getElementById(param.id).getAttribute("selid") || '';
			app.openWindow('tasklist', '_www/page/more/check/tasklist.html', {
				projectid: proid,
				taskid: taskid,
				funname: funname
			});
		})
		window.addEventListener(funname || 'chooseTask', function(event) {
			document.getElementById(param.id).value = event.detail.sel_tname;
			document.getElementById(param.id).setAttribute("selid", event.detail.sel_tid);
		});
	};
	owner.chooseStep = function(param, callback) {
		var d = new Date().getTime();
		var funname = d + Math.random();
		var domid = this.notempty(param.containerId) ? param.containerId : param.id;
		document.getElementById(domid).addEventListener('tap', function() {
			var proid = document.getElementById(param.projectid).value;
			if(!proid) {
				plus.nativeUI.toast("请先选择位置");
				return false;
			}
			app.openWindow('choosestep', '_www/page/more/check/step.html', {
				projectid: proid,
				funname: funname
			});
		});
		window.addEventListener(funname || 'changeStepName', function(event) {
			document.getElementById(param.id).value = event.detail.stepname;
			document.getElementById(param.id).setAttribute("selid", event.detail.stepid);
			param.checkdetail && param.checkdetail.checkdetail.clearForm();
			callback && callback(event.detail);
		});
	};
	owner.chooseImg = function(param, callback) {
		var d = new Date().getTime();
		var funname = d + Math.random();
		var domid = this.notempty(param.containerId) ? param.containerId : param.id;		
		if(this.notempty(domid)) {
			document.getElementById(domid).addEventListener('tap', function() {
				var proid = document.getElementById(param.projectid).value;
				if(!proid) {
					plus.nativeUI.toast("请先选择位置");
					return false;
				}
				if(!drawpath) {
					plus.nativeUI.toast("该位置未上传图纸");
					return false;
				}
				app.openWindow('svg_mark', '_www/page/common/svg_mark.html', {
					choosepid: proid,
					imagepath: drawpath,
					info: drawinfo,
					funname: funname
				});
			});
			window.addEventListener(funname || 'imageMarked', function(event) {
				callback(event.detail);
				document.getElementById(param.id).value = '已选择图纸';
			})
		}
	};
	owner.chooseSafety = function(param, callback) {
		var d = new Date().getTime();
		var funname = d + Math.random();
		var domid = this.notempty(param.containerId) ? param.containerId : param.id;
		document.getElementById(domid).addEventListener('tap', function() {
			var choosepid = document.getElementById(param.projectid).value;
			if(!choosepid) {
				plus.nativeUI.toast("请先选择位置");
				return false;
			}
			app.openWindow('choosecategory', '_www/page/more/safety/category.html', {
				projectid: choosepid,
				funname: funname
			});
		});
		window.addEventListener(funname || 'changecategoryName', function(event) {
			document.getElementById(param.id).value = event.detail.categoryname;
			document.getElementById(param.id).setAttribute("selid", event.detail.categoryid);
			document.getElementById(param.id).setAttribute("fullname", event.detail.categoryfullname);
			callback && callback(event.detail);
		});
	};
	owner.choosePosition1 = function(param, callback) {
		var d = new Date().getTime();
		var funname = d + Math.random();
		document.getElementById(param.id).addEventListener('tap', function() {
			var choosepid = document.getElementById(param.projectid).value;
			if(!choosepid) {
				plus.nativeUI.toast("请先选择位置");
				return false;
			}
			app.openWindow('choosecategory', '_www/page/common/position.html', {
				projectid: choosepid,
				funname: funname
			});
		});
		window.addEventListener(funname, function(event) {
			document.getElementById(param.id).children[0].value = event.detail.name;
			document.getElementById(param.id).children[0].setAttribute("selid", event.detail.id);
		});
	};
	owner.choosePosition = function(param, callback) {
		var d = new Date().getTime();
		var funname = d + Math.random();
		var domid = this.notempty(param.containerId) ? param.containerId : param.id;
		document.getElementById(domid).addEventListener('tap', function() {
			var choosepid = document.getElementById(param.projectid).value;
			if(!choosepid) {
				plus.nativeUI.toast("请先选择项目");
				return false;
			}
			app.openWindow('choosecategory', '_www/page/common/position.html', {
				projectid: choosepid,
				funname: funname
			});
		});
		window.addEventListener(funname, function(event) {
			document.getElementById(param.id).value = event.detail.name;
			document.getElementById(param.id).setAttribute("selid", event.detail.id);
			callback && callback(event.detail);
		});
	};
}(mui, window.utils = {}));
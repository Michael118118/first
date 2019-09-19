(function($, owner) {

	/*
	 * 文件系统对象
	 */
	owner.fileSystem = {};

	/*
	 * 路径类型转相对路径字符串
	 * type路径类型
	 */
	owner.iotype2String = function(type) {
		switch(type) {
			case plus.io.PRIVATE_WWW:
				return '_www';
			case plus.io.PRIVATE_DOC:
				return '_doc';
			case plus.io.PUBLIC_DOCUMENTS:
				return '_documents';
			case plus.io.PUBLIC_DOWNLOADS:
				return '_downloads';
		}
	}

	/*
	 * 通过相对路径转换为文件系统类型和相对文件系统根目录的路径
	 */
	owner.getTypePath = function(relativePath) {
		var reg = new RegExp('_www|_doc|_documents|_downloads');
		var result = reg.exec(relativePath);
		var path = '';
		switch(result+'') {
			case '_www':
				reg = new RegExp('_www/|_www');
				path = relativePath.replace(reg, '');
				return {
					type: plus.io.PRIVATE_WWW,
					path: path
				};
			case '_doc':
				reg = new RegExp('_doc/|_doc');
				path = relativePath.replace(reg, '');
				return {
					type: plus.io.PRIVATE_DOC,
					path: path
				};
			case '_documents':
				reg = new RegExp('_documents/|_documents');
				path = relativePath.replace(reg, '');
				return {
					type: plus.io.PUBLIC_DOCUMENTS,
					path: path
				};
			case '_downloads':
				reg = new RegExp('_downloads/|_downloads');
				path = relativePath.replace(reg, '');
				return {
					type: plus.io.PUBLIC_DOWNLOADS,
					path: path
				};
		}
	}

	/*
	 * 获取文件类型
	 */
	owner.getFileSystem = function(type, callback) {
		if(owner.fileSystem[type]){
			callback(owner.fileSystem[type]);	
		}else {
			plus.io.requestFileSystem(type || plus.io.PRIVATE_DOC, function(fs) {
				owner.fileSystem[type] = fs;
				callback(fs);
			}, function(e) {
				console.log(JSON.stringify(e));
				callback(false);
			});
		}
	}

	/*
	 * 上传文件
	 */
	owner.uploadFile = function(serverurl, type, srcpath, callback, data, waiting) {
		waiting && plus.nativeUI.showWaiting("文件开始上传...");
		var targetPath = owner.iotype2String(type) + '/' + srcpath;
		var task = plus.uploader.createUpload(serverurl, {
				method: "POST"
			},
			function(upload, status) {
				waiting && plus.nativeUI.closeWaiting();
				if(status == 200) {
					if(upload.responseText != "upload failed.") {
						waiting && plus.nativeUI.toast("上传成功");
						callback && callback(upload.responseText, upload);
					} else {
						waiting && plus.nativeUI.toast("上传失败：" + upload.responseText);
					}
				} else {
					waiting && plus.nativeUI.toast("上传失败：" + status);
				}
			}
		);
		for(var k in data) {
			task.addData(k, data[k]);
		}
		task.addFile(targetPath);
		task.start();
		return task;
	}

	/*
	 * 上传多个文件
	 * files文件名称数组
	 */
	owner.uploadFiles = function(serverurl, files, callback, waiting) {
		waiting && plus.nativeUI.showWaiting("开始上传...");
		var i = 0;
		var j = files.length;
		var res = new Array(j);
		var allfinish = function() {
			var f = true;
			for(i; i < j; i++) {
				f = f && (res[i] != undefined);
			}
			if(f) {
				plus.nativeUI.closeWaiting();
				callback(res);
			}
		}
		for(i; i < j; i++) {
			var upload = owner.uploadFile(serverurl, files[i].type, files[i].filepath, function(r, t) {
				res[t.index] = r;
				allfinish();
			}, files[i].data, false);
			upload.index = i;
		}
		//setTimeout(allfinish, 1000);
	}

	/*
	 * 用程序打开文件
	 */
	owner.appFile = function(type, filepath) {
		var targetPath = owner.iotype2String(type) + '/' + path;
		plus.runtime.openFile(targetPath);
	}

	/*
	 * 下载文件
	 */
	owner.downloadFile = function(href, type, savepath, callback, waiting) {
		var targetPath = owner.iotype2String(type) + '/' + path;
		waiting && plus.nativeUI.showWaiting("下载数据中...");
		var param = {
			method: "get",
			filename: targetPath
		};
		var ncallback = function(download, status) {
			waiting && plus.nativeUI.closeWaiting();
			callback(download.filename, download, status);
		};
		var dtask = plus.downloader.createDownload(href, param, ncallback);
		dtask.start();
	};

	/*
	 * 打开目录
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.openDir = function(type, path, callback) {
		//存在离线目录，解压数据
		owner.getFileSystem(type, function(fs) {
			if(fs) {
				fs.root.getDirectory(path, {
					create: false,
					exclusive: false
				}, function(dir) {
					callback(dir);
				}, function(e) {
					console.log(JSON.stringify(e));
					callback(false);
				});
			} else
				callback(false);
		})
	}

	/*
	 * 创建目录
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.createDir = function(type, path, callback) {
		owner.openDir(type, path, function(dir) {
			if(dir) {
				callback(dir);
			} else {
				owner.getFileSystem(type, function(fs) {
					if(fs) {
						fs.root.getDirectory(path, {
							create: true,
							exclusive: false
						}, function(dir) {
							callback(dir);
						}, function(e) {
							console.log(JSON.stringify(e));
							callback(false);
						});
					} else
						callback(false);
				});
			}
		})
	}

	/*
	 * 删除目录
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.deleteDir = function(type, path, callback) {
		owner.openDir(type, path, function(dir) {
			if(dir) {
				dir.removeRecursively(function() {
					callback(true);
				}, function(e) {
					console.log(JSON.stringify(e));
					callback(false);
				})
			} else {
				callback(true);
			}
		});
	}

	/*
	 * 复制目录
	 * srcdir 原目录
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.copyDir = function(srctype, srcpath, targettype, targetpath, callback) {
		owner.openDir(srctype, srcpath, function(dir) {
			if(dir) {
				owner.createDir(targettype, targetpath, function(ndir) {
					dir.copyTo(ndir, '', function(nndir) {
						callback(nndir);
					}, function(e) {
						console.log(JSON.stringify(e));
						callback(false);
					});
				})
			} else {
				callback(false);
			}
		});
	}

	/*
	 * 移动目录
	 * srcdir 原目录
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.moveDir = function(srctype, srcpath, targettype, targetpath, callback) {
		owner.openDir(srctype, srcpath, function(dir) {
			if(dir) {
				owner.createDir(targettype, targetpath, function(ndir) {
					dir.moveTo(ndir, '', function(nndir) {
						callback(nndir);
					}, function(e) {
						console.log(JSON.stringify(e));
						callback(false);
					});
				})
			} else {
				callback(false);
			}
		});
	}

	/*
	 * 打开文件
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.openFile = function(type, path, callback) {
		owner.getFileSystem(type, function(fs) {
			if(fs) {
				fs.root.getFile(path, {
					create: false,
					exclusive: false
				}, function(file) {
					callback(file);
				}, function(e) {
					console.log(JSON.stringify(e));
					callback(false);
				});
			} else
				callback(false);
		})
	}

	/*
	 * 创建文件
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.createFile = function(type, path, callback) {
		owner.openFile(type, path, function(file) {
			if(file) {
				callback(file);
			} else {
				owner.getFileSystem(type, function(fs) {
					if(fs) {
						fs.root.getFile(path, {
							create: true,
							exclusive: false
						}, function(file) {
							callback(file);
						}, function(e) {
							console.log(JSON.stringify(e));
							callback(false);
						});
					} else {
						callback(false);
					}
				});
			}
		});
	}

	/*
	 * 删除文件
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.deleteFile = function(type, path, callback) {
		owner.openFile(type, path, function(file) {
			if(file) {
				file.remove(function() {
					callback(true);
				}, function(e) {
					console.log(JSON.stringify(e));
					callback(false);
				})
			} else {
				callback(false);
			}
		});
	}

	/*
	 * 复制文件
	 * srcfile 原文件
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.copyFile = function(srctype, srcfile, targettype, targetpath, filename, callback) {
		owner.openFile(srctype, srcfile, function(file) {
			if(file) {
				owner.createDir(targettype, targetpath, function(dir) {
					file.copyTo(dir, filename, function(file) {
						callback(file);
					}, function(e) {
						console.log(JSON.stringify(e));
						callback(false);
					});
				})
			} else {
				callback(false);
			}
		});
	}
	
	/*
	 * 复制文件1
	 * 如果目标文件已存在则直接返回，如不存在则copy到目标文件夹
	 * srcfile 原文件
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.copyFile1 = function(orgfile, targettype, targetpath, srcfile, filename, callback) {
		// 取消存在验证
//		owner.openFile(targettype, srcfile, function(file) {
//			if(file) {
//				callback(file);
//			} else {
//				
//			}
//		});
		
		owner.createDir(targettype, targetpath, function(dir) {
			orgfile.copyTo(dir, filename, function(file) {
				callback(file);
			}, function(e) {
				console.log(JSON.stringify(e));
				callback(false);
			});
		})
		
	}

	/*
	 * 移动文件
	 * srcfile 原文件
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.moveFile = function(srctype, srcfile, targettype, targetpath, filename, callback) {
		owner.openFile(srctype, srcfile, function(file) {
			if(file) {
				owner.createDir(targettype, targetpath, function(dir) {
					fs.moveTo(dir, filename, function(file) {
						callback(file);
					}, function(e) {
						console.log(JSON.stringify(e));
						callback(false);
					});
				})
			} else {
				callback(false);
			}
		});
	}

	/*
	 * 移动文件
	 * srcfile 原文件
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.moveFiles = function(srcfiles, targettype, targetpath, callback) {
		owner.createDir(targettype, targetpath, function(dir) {
			var l = srcfiles.length,
				c = 0;
			for(var i = 0; i < l; i++) {
				plus.io.resolveLocalFileSystemURL(srcfile[i], function(fs) {
					fs.moveTo(dir, '', function(file) {
						c += 1;
						if(c == l)
							callback(true);
					}, function(e) {
						console.log(JSON.stringify(e));
						callback(false);
					});
				}, function(e) {
					callback(false);
				});
			}
		});
	}

	/*
	 * 解压缩分类压缩包
	 * zipfile压缩包名称
	 * type路径类型
	 * path相对路径
	 * 回调
	 */
	owner.decompress = function(zipfile, type, path, callback) {
		//解压数据
		var targetPath = owner.iotype2String(type) + '/' + path;
		plus.zip.decompress(zipfile, targetPath,
			function() {
				//直接解压到目录下
				callback(true);
			},
			function(e) {
				console.log(JSON.stringify(e));
				callback(false);
			});
	};

	/*
	 * 解压缩分类压缩包
	 * srcpath：相对路径或绝对路径
	 * type 路径类型
	 * path 相对路径
	 * name 压缩包名称
	 */
	owner.compress = function(srctype, srcpath, targettype, targetpath, filename, callback) {
		//判断离线临时目录是否存在
		owner.createDir(targettype, targetpath, function(dir) {
			if(dir) {
				//存在离线目录，解压数据
				var srcfile = owner.iotype2String(srctype) + '/' + srcpath;
				var zipfile = owner.iotype2String(targettype) + '/' + targetpath + '/' + filename;
				plus.zip.compress(srcfile, zipfile,
					function() {
						//直接解压到目录下
						callback(true);
					},
					function(e) {
						console.log(JSON.stringify(e));
						callback(false);
					});
			} else {
				callback(false);
			}
		});
	};

	/*
	 * 读取文件
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.readFile = function(type, path, callback) {
		owner.openFile(type, path, function(file) {
			if(file) {
				var fileReader = new plus.io.FileReader();
				fileReader.onloadend = function(evt) {
					callback(evt.target.result);
				}
				fileReader.readAsText(file, 'utf-8');
			} else {
				callback(false);
			}
		});
	}

	/*
	 * 写文件
	 * type 文档存储的类型plus.io.PRIVATE_DOC,PUBLIC_DOCUMENTS,PUBLIC_DOWNLOADS
	 * path 创建路径,相对于当前类型根目录的位置
	 * 创建回调
	 */
	owner.writeFile = function(type, path, content, callback) {
		owner.createFile(type, path, function(file) {
			if(file) {
				file.createWriter(function(writer) {
					writer.onwriteend = function(e) {
						callback(true);
					};
					writer.seek(writer.length);
					writer.write(content);
				}, function(e) {
					console.log(JSON.stringify(e));
					callback(false);
				});
			} else {
				callback(false);
			}
		});
	}

}(mui, window.file = {}));
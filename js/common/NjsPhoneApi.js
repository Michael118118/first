/**
 * @description njs实现android原生功能 
 * 1.通知栏消息
 * @see http://ask.dcloud.net.cn/article/503
 * 
 * @author dailc
 * @version 1.0
 * @time 2016-01-08 08:38:20
 */
(function(obj) {
    var defaultTitle = '通知栏标题';
    var defaultContent = '通知内容';
    var defaultTicker = '通知提示';
    var defaultNotifyId = 1000;
    var defaultNumber = 1;
    /**
     * plusReady
     * @param {type} callback
     * @returns {Window}
     */
    obj.plusReady = function(callback) {
        if (window.plus) {
            setTimeout(function() { //解决callback与plusready事件的执行时机问题(典型案例:showWaiting,closeWaiting)
                callback();
            }, 0);
        } else {
            document.addEventListener("plusready", function() {
                callback();
            }, false);
        }
        return this;
    };
    /**
     * @description 比较两个版本大小
     * 比较版本大小，如果新版本nowVersion大于旧版本OldResourceVersion则返回true，否则返回false
     */
    function compareVersion(OldVersion, nowVersion) {
        if (!OldVersion || !nowVersion || OldVersion == '' || nowVersion == '') {

            return false;
        }
        //第二份参数 是 数组的最大长度
        var OldVersionA = OldVersion.split(".", 4);
        var nowVersionA = nowVersion.split(".", 4);
        for (var i = 0; i < OldVersionA.length && i < nowVersionA.length; i++) {
            var strOld = OldVersionA[i];
            var numOld = parseInt(strOld);
            var strNow = nowVersionA[i];
            var numNow = parseInt(strNow);
            //小版本到高版本
            if (numNow > numOld
                //||strNow.length>strOld.length
            ) {
                return true;
            } else if (numNow < numOld) {
                return false;
            }
        }
        //如果是版本  如 1.6 - 1.6.1
        if (nowVersionA.length > OldVersionA.length && 0 == nowVersion.indexOf(OldVersion)) {
            return true;
        }
    };
    /**
     * @description 通过push功能来推送消息
     */
    obj.sendNotificationByPush = function() {
        var options = {
            cover: false
        };
        var str = "";
        plus.push.createMessage(str, "LocalMSG", options);
    };
    (function() {
        /**
         * @constructor 创建通知栏进度条构造函数
         */
        function NotificationCustom() {
            if (plus.os.name != 'Android') {
                return;
            }
            //当前版本号
            var SystemVersion = plus.os.version;
            var Context = plus.android.importClass("android.content.Context");
            var main = plus.android.runtimeMainActivity();
            var NotificationManager = plus.android.importClass("android.app.NotificationManager");
            var nm = main.getSystemService(Context.NOTIFICATION_SERVICE)
            // Notification build 要android api16以上才能使用(4.1.2以上)
            var Notification = null;
            if (compareVersion('4.1.1', SystemVersion) == true) {
                Notification = plus.android.importClass("android.app.Notification");
            } else {
                Notification = plus.android.importClass("android.support.v4.app.NotificationCompat");
            }
            if (Notification) {
                this.notifyManager = nm;
                this.mNotificationBuild = new Notification.Builder(main);
                //设为true代表常驻状态栏
                this.mNotificationBuild.setOngoing(true);
                this.mNotificationBuild.setContentTitle(defaultTitle);
                this.mNotificationBuild.setContentText(defaultContent);
                this.mNotificationBuild.setTicker(defaultTicker);
                //默认的push图标
                this.mNotificationBuild.setSmallIcon(17301620);
                //设置默认声音
                //console.log('默认:'+plus.android.importClass("android.app.Notification").DEFAULT_SOUND);
                this.mNotificationBuild.setDefaults(plus.android.importClass("android.app.Notification").DEFAULT_SOUND);
                //this.mNotificationBuild.setNumber(defaultNumber)
            }
        };
        /**
         * @description 给android通知栏发送通知
         * @param {String} title 标题
         * @param {String} content  内容
         * @param {String} tickerTips  提示
         * @param {Number} notifyId id,默认为1000
         */
        NotificationCustom.prototype.setNotification = function(title, content, tickerTips, notifyId) {
            if (this.mNotificationBuild == null ||
                this.notifyManager == null) {
                return;
            }
            notifyId = (typeof(notifyId)=='number')?notifyId:defaultNotifyId;
            title = title || defaultTitle;
            content = content || defaultContent;
            tickerTips = tickerTips || defaultTicker;
            this.mNotificationBuild.setContentTitle(title);
            this.mNotificationBuild.setContentText(content);
            this.mNotificationBuild.setTicker(tickerTips);
            //默认有声音
            this.mNotificationBuild.setDefaults(plus.android.importClass("android.app.Notification").DEFAULT_SOUND);
            this.notifyManager.notify(notifyId, this.mNotificationBuild.build());
        };
        /**
         * @description 设置进度条
         * @param {Number} progress
         * @param {String} title 标题
         * @param {String} content  内容
         * @param {String} tickerTips  提示
         * @param {Number} notifyId id,默认为1000
         */
        NotificationCustom.prototype.setProgress = function(progress, title, content, tickerTips,notifyId) {
            if (this.mNotificationBuild == null ||
                this.notifyManager == null) {
                return;
            }
            notifyId = (typeof(notifyId)=='number')?notifyId:defaultNotifyId;
            title = title || '正在下载';
            content = content || '正在下载';
            tickerTips = tickerTips || '进度提示';
            //tickerTips = tickerTips || defaultTicker;
            this.mNotificationBuild.setContentTitle(title);
            this.mNotificationBuild.setContentText(content);
            this.mNotificationBuild.setTicker(tickerTips);
            //进度条显示时,默认无声音
            this.mNotificationBuild.setDefaults(0);
            this.mNotificationBuild.setProgress(100, progress, false);
            this.notifyManager.notify(notifyId, this.mNotificationBuild.build());
        };
        NotificationCustom.prototype.setProgress1 = function(progress) {
            if (this.mNotificationBuild == null ||
                this.notifyManager == null) {
                return;
            }
                notifyId = (typeof(notifyId)=='number')?notifyId:defaultNotifyId;
                this.mNotificationBuild.setDefaults(0);
                this.mNotificationBuild.setContentText('正在下载');
                this.mNotificationBuild.setProgress(100, progress, false);
                this.notifyManager.notify(notifyId, this.mNotificationBuild.build());   
        };
        /**
         * @description 完成进度条
         * @param {String} title 标题
         * @param {String} content  内容
         * @param {String} tickerTips  提示
         * @param {Number} notifyId id,默认为1000
         */
        NotificationCustom.prototype.compProgressNotification = function(title, content, tickerTips,notifyId) {
            if (this.mNotificationBuild == null ||
                this.notifyManager == null) {
                return;
            }
            notifyId = (typeof(notifyId)=='number')?notifyId:defaultNotifyId;
            title = title || '下载完成';
            content = content || '准备安装';
            tickerTips = tickerTips || '进度提示';
            this.mNotificationBuild.setContentTitle(title);
            this.mNotificationBuild.setContentText(content);
            this.mNotificationBuild.setTicker(tickerTips);
            this.mNotificationBuild.setProgress(0, 0, false);
            //默认有声音
            this.mNotificationBuild.setDefaults(plus.android.importClass("android.app.Notification").DEFAULT_SOUND);
            this.notifyManager.notify(notifyId, this.mNotificationBuild.build());
        };
        /**
         * @description 清除通知栏信息
         * @param {Number} notifyId id,默认为1000
         */
        NotificationCustom.prototype.clearNotification = function(notifyId) {
            notifyId = (typeof(notifyId)=='number')?notifyId:defaultNotifyId;
            if(this.notifyManager){
                this.notifyManager.cancel(notifyId);
            }       
        };
        /**
         * @description 清除所有通知栏信息
         */
        NotificationCustom.prototype.clearAllNotification = function() {
            if(this.notifyManager){
                this.notifyManager.cancelAll();
            }       
        };
        obj.plusReady(function() {
            obj.NotificationUtil = new NotificationCustom();
        });
    })();

})(window.NjsPhoneApi = {});
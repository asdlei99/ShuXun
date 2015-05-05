/**
 * Created by wuhaolin on 4/8/15.
 * AVOS 运代码
 */
"use strict";
var WechatAPI = require('cloud/wechatAPI.js');
var LBS = require('cloud/lbs.js');
var Info = require('cloud/info.js');
var BusinessSite = require('cloud/businessSite.js');
var DoubanBook = require('cloud/doubanBook.js');

/**
 * 去豆瓣抓取最新的图书,保存到AVOS LatestBook表
 */
AV.Cloud.define('spiderLatestBook', function (req, res) {
    DoubanBook.spiderLatestBook().done(function (bookIds) {
        res.success(bookIds.length);
        for (var i = 0; i < bookIds.length; i++) {
            DoubanBook.saveOneLatestBook_Id(bookIds[i], i * 1000).fail(function (err) {
                console.error(err);
            })
        }
    }).fail(function (err) {
        res.error(err);
    })
});

/**
 * 根据我的IP地址更新我经纬度
 * 如果有latitude和longitude参数就用这两个参数更新,否则调用根据IP地址获得地理位置更新
 * @param:latitude 纬度
 * @param:longitude 经度
 * 如果更新成功就返回success,否则返回error
 */
AV.Cloud.define('updateMyLocation', function (req, res) {
    var latitude;
    var longitude;
    if (req.params['latitude'] && req.params['longitude']) {//用户提交的GPS地位
        latitude = parseFloat(req.params['latitude']);
        longitude = parseFloat(req.params['longitude']);
        updateLocation();
    } else {//使用IP地址定位
        var ip = req.remoteAddress;
        LBS.getLocationByIP(ip).done(function (location) {
            latitude = parseFloat(location.lat);
            longitude = parseFloat(location.lng);
            updateLocation();
        }).fail(function (err) {
            res.error(err);
        })
    }
    function updateLocation() {
        var user = req.user;
        if (user) {
            LBS.updateUserLocation(user, latitude, longitude).done(function () {
                res.success();
            }).fail(function (err) {
                res.error(err);
            })
        } else {
            res.error('需要先登入');
        }
    }
});

////////////////////// Wechat /////////////////////////

/**
 * 获得微信JS-SDK配置
 * @param:url 当前微信浏览器的url
 */
AV.Cloud.define('getWechatJsConfig', function (req, res) {
    var url = req.params.url;
    WechatAPI.getJsConfig(url).done(function (config) {
        res.success(config);
    }).fail(function (err) {
        res.error(err);
    })
});

/**
 * 微信获取用户信息 OAuth step 2
 * @param:code 微信获取信息的凭证
 */
AV.Cloud.define('getWechatOAuthUserInfo', function (req, res) {
    var code = req.params.code;
    WechatAPI.getOAuthUserInfo(code).done(function (userInfo) {
        res.success(userInfo);
    }).fail(function (err) {
        res.error(err);
    })
});

////////////////////// Info /////////////////////////

/**
 * 用户注册时获得所有专业
 */
AV.Cloud.define('getAllMajor', function (req, res) {
    res.success(Info.Majors);
});

/**
 * 获得图书分类信息
 */
AV.Cloud.define('getAllBookTags', function (req, res) {
    res.success(Info.BookTags);
});

/**
 * 获得豆瓣书评列表
 * @param:id 豆瓣图书id
 * @param:start 开始的位置
 */
AV.Cloud.define('getDoubanBookReview', function (req, res) {
    var id = req.params.id;
    var start = req.params.start;
    DoubanBook.spiderDoubanBookReview(id, start).done(function (json) {
        res.success(json);
    }).fail(function (err) {
        res.error(err);
    })
});

/**
 * 获得豆瓣书评的完整内容
 * @param:id 豆瓣书评的id
 */
AV.Cloud.define('getOneFullDoubanBookReview', function (req, res) {
    var id = req.params.id;
    DoubanBook.spiderDoubanBookOneFullReview(id).done(function (re) {
        res.success(re);
    }).fail(function (err) {
        res.error(err);
    })
});

/**
 * 获得图书电商购买信息
 * @param:id 豆瓣图书id
 */
AV.Cloud.define('getBusinessInfo', function (req, res) {
    var id = req.params.id;
    BusinessSite.spider(id).done(function (json) {
        res.success(json);
    }).fail(function (err) {
        res.error(err);
    })
});
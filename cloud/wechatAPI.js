/**
 * Created by wuhaolin on 4/1/15.
 *
 */
"use strict";

exports.Config = {
    AppID: 'wx2940a8d3ddcad5e9',
    Secret: '109504a5c4cac98f12c024d724fd589f',
    Token: 'wonderful',
    EncodingAESKey: 'qiYrBOvI9Z6mhRUZ1LrztiHquQg9NAgQ4arSkgd1aH3',
    APIClient: require('wechat-api'),
    OAuthClient: require('wechat-oauth')
};
exports.APIClient = new exports.Config.APIClient(exports.Config.AppID, exports.Config.Secret);
exports.OAuthClient = new exports.Config.OAuthClient(exports.Config.AppID, exports.Config.Secret);

/**
 * 使用wechat js接口前必须获得这个
 * 返回 wechat js sdk所有需要的config
 * @param url 微信浏览器当前打开的网页的URL
 * @param callback 返回JSON格式的config
 */
exports.getJsConfig = function (url, callback) {
    //如果发布了就关闭微信调试
    var isDebug = true;
    if (__production) {
        isDebug = false;
    }
    exports.APIClient.getJsConfig({
        debug: isDebug,
        url: url,
        //需要使用的借口列表
        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'chooseImage', 'previewImage', 'uploadImage', 'openLocation', 'getLocation', 'scanQRCode']
    }, function (err, data) {
        if (err) {
            callback(err);
        } else {
            callback(data);
        }
    });
};

/**
 * 用户Web OAuth后
 * 获取Openid
 * @param code
 * @param callback
 * 返回 已经关注了用户的微信提供的所有信息
 */
exports.getOAuthUserInfo = function (code, callback) {
    exports.OAuthClient.getAccessToken(code, function (err, result) {
        if (err) {
            callback(err);
        } else {
            exports.OAuthClient.getUser(result.data.openid, function (err, userInfo) {
                if (err) {
                    callback(err);
                } else {
                    callback(userInfo);
                }
            })
        }
    });
};

/**
 * 用户之间相互发送消息
 * @param senderName 发送者的昵称
 * @param senderId 发送者的微信openID
 * @param receiverId 接收者的微信openID
 * @param msg 消息内容
 * @param usedBookAvosObjectId 当前咨询的二手书的objectId
 * @return AV.Promise
 */
exports.senderSendMsgToReceiver = function (senderName, senderId, receiverId, msg, usedBookAvosObjectId) {
    var TemplateId_ToBuyer = 'nYdPsuIRJl8RFgh1WBv28xfDGU_IcjQVz6AGFO6uVr8';//咨询回复消息提醒
    var TemplateId_ToSeller = 'Gguvq37B78_L8Uv9LZgp0gf8kQ5O8Xmthqttb7IrwVY';//用户咨询提醒
    var Color_Title = '#46bfb9';
    var Color_Context = '#30bf4c';
    var data = {
        first: {//标题
            value: '有同学发消息给你',
            color: Color_Title
        },
        keyword1: {//用户名称
            value: senderName,
            color: Color_Context
        },
        keyword2: {
            value: '',
            color: Color_Context
        },
        remark: {//咨询内容
            value: msg,
            color: Color_Context
        }
    };
    var templateId = TemplateId_ToSeller;
    var url = 'http://ishuxun.cn/wechat/#/tab/person/sendMsgToUser?openId=' + senderId + '&msg=' + msg;
    if (usedBookAvosObjectId) {
        url += '&usedBookAvosObjectId=' + usedBookAvosObjectId;
        var query = new AV.Query('UsedBook');
        query.select('title');
        query.get(usedBookAvosObjectId).done(function (usedBook) {
            var bookTitle = usedBook.get('title');
            if (usedBook.get('owner').id == senderId) {//图书主人在回应咨询者
                templateId = TemplateId_ToBuyer;
                data.first.value = bookTitle + '-主人回复你';
            } else {
                templateId = TemplateId_ToSeller;
                data.first.value = '有同学咨询你的旧书-' + bookTitle;
            }
        }).always(function () {
            return send();
        });
    } else {
        return send();
    }

    function send() {
        exports.APIClient.sendTemplate(receiverId, templateId, url, Color_Title, data, function (err, result) {
            var promise = new AV.Promise(null);
            if (err) {
                promise.reject(err);
            } else {
                promise.resolve(result);
            }
            return promise;
        })
    }

};

/**
 * Created by wuhaolin on 3/26/15.
 *
 */
"use strict";
angular.module('AppController', [], null)

    //图书搜索
    .controller('book_searchList', function ($scope, $timeout, $state, SearchBook$, WeChatJS$) {
        $scope.SearchBook$ = SearchBook$;
        $scope.searchBtnOnClick = function () {
            SearchBook$.loadMore();
            $timeout.cancel(timer);
        };

        var timer = null;
        $scope.searchInputOnChange = function () {
            SearchBook$.books = [];
            SearchBook$.totalNum = 0;
            $timeout.cancel(timer);
            timer = $timeout(function () {
                $scope.searchBtnOnClick();
            }, 2000);
        };

        $scope.scanQRBtnOnClick = function () {
            WeChatJS$.scanQRCode(function (code) {
                if (code && code.length >= 10 && code.length <= 13) {
                    $state.go('tab.book_oneBook', {isbn13: code});
                } else {
                    alert('不合法的ISBN号');
                }
            });
        }
    })

    //展示一本书详细信息
    .controller('book_oneBook', function ($scope, $stateParams, $ionicModal, DoubanBook$, WeChatJS$) {
        var isbn13 = $stateParams.isbn13;
        $scope.book = null;
        //目前是否正在加载数据
        $scope.isLoading = true;
        DoubanBook$.getBookByISBD(isbn13, function (json) {
            $scope.book = json;
            $scope.isLoading = false;
        });

        //注册modal视图
        $scope.modalViewData = {};
        $ionicModal.fromTemplateUrl('template/authorIntro.html', {
            scope: $scope
        }).then(function (modal) {
            $scope.modalView = modal;
        });

        //显示作者介绍
        $scope.showAuthorIntro = function () {
            $scope.modalViewData.title = $scope.book.author.toString();
            $scope.modalViewData.content = $scope.book.author_intro;
            $scope.modalView.show();
        };
        //显示出版信息
        $scope.showPubInfo = function () {
            $scope.modalViewData.title = '出版信息';
            var b = $scope.book;
            $scope.modalViewData.content = '作者:' + b.author.toString() +
            '\n出版社:' + b.publisher +
            '\n出版年:' + b.pubdate +
            '\n页数:' + b.pages +
            '\n定价:' + b.price +
            '\n装帧:' + b.binding +
            '\nISBN:' + b.isbn13 +
            '\n目录:\n' + b.catalog;
            $scope.modalView.show();
        };
        //显示图书简介
        $scope.showSummary = function () {
            $scope.modalViewData.title = '图书简介';
            $scope.modalViewData.content = $scope.book.summary;
            $scope.modalView.show();
        };

        //预览图书的封面
        $scope.previewBookImg = function () {
            WeChatJS$.previewOneImage($scope.book.image);
        }

    })

    .controller('person_uploadOneUsedBook', function ($scope, DoubanBook$, WeChatJS$) {

        $scope.isLoading = false;

        $scope.scanQRBtnOnClick = function () {
            $scope.isLoading = true;
            WeChatJS$.scanQRCode(function (code) {
                $scope.isbn13 = code;
                DoubanBook$.getBookByISBD_simple($scope.isbn13, function (json) {
                    $scope.book = json;
                    $scope.isLoading = false;
                    $scope.$apply();
                });
            });
        };

        $scope.uploadPicOnClick = function () {
            WeChatJS$.chooseImage(function (localSrc) {
                $scope.uploadPicSrc = localSrc;
                $scope.$apply();
            })
        };

        $scope.submitOnClick = function () {
            //TODO
            //$scope.price;
            //$scope.des;
        }

    })

    .controller('person_signUp', function ($scope, $timeout, $stateParams, $ionicModal, WeChatJS$, InfoService$, User$) {
        //调用微信接口获取用户信息
        var wechatAOuthCode = $stateParams['code'];
        WeChatJS$.getOAuthUserInfo(wechatAOuthCode, function (userInfo) {
            $scope.userInfo = userInfo;
        });

        InfoService$.registerChooseSchoolModalView($scope, function (school) {
            $scope.userInfo['school'] = school;
        });

        InfoService$.registerChooseMajorModalView($scope, function (major) {
            $scope.userInfo['major'] = major;
        });

        $scope.startSchoolYearOptions = InfoService$.startSchoolYearOptions;

        //点击注册时
        $scope.submitOnClick = function () {
            User$.signUp($scope.userInfo).then(function (user) {
                alert(JSON.stringify(User$.avosUserToJson(user)));
            }, function (error) {
                alert(error.message);
            });
        };

    })

    .controller('person_editPersonInfo', function ($scope, InfoService$, User$) {
        //是否对属性进行了修改
        $scope.attrHasChange = false;

        $scope.userInfo = User$.getCurrentJsonUser();

        InfoService$.registerChooseSchoolModalView($scope, function (school) {
            $scope.attrHasChange = true;
            $scope.userInfo['school'] = school;
        });
        InfoService$.registerChooseMajorModalView($scope, function (major) {
            $scope.attrHasChange = true;
            $scope.userInfo['major'] = major;
        });
        $scope.startSchoolYearOptions = InfoService$.startSchoolYearOptions;

        //点击提交修改时
        $scope.submitOnClick = function () {
            User$.alertUserLoginModalView(function (avosUser) {
                avosUser.save({
                    school: $scope.userInfo['school'],
                    major: $scope.userInfo['major'],
                    startSchoolYear: $scope.userInfo['startSchoolYear']
                }, function (user) {
                    alert('修改成功');
                }, function (error) {
                    alert('修改失败:' + error.message);
                })
            });
        }
    })

    .controller('person_hello', function ($scope, WeChatJS$) {
        $scope.WeChatJS$ = WeChatJS$;
    });

/**
 * Created by wuhaolin on 5/20/15.
 * 展示一本书详细信息
 */
"use strict";

APP.controller('book_oneBook', function ($scope, $state, $stateParams) {
    //////////// 豆瓣图书信息 /////////
    $scope.isbn13 = $stateParams.isbn13;
    $scope.book = null;
    //目前是否正在加载数据
    $scope.isLoading = true;
    //加载图书信息
    $scope.BookInfo$.getBookInfoByISBN($scope.isbn13).done(function (bookInfo) {
        $scope.bookInfo = bookInfo;
        //加载书评
        $scope.DoubanBook$.BookReview.clear();
        $scope.DoubanBook$.BookReview.nowBookId = $scope.bookInfo.attributes.doubanId;
        $scope.DoubanBook$.BookReview.loadMore();
    }).fail(function () {
        alert('没有找到图书信息,再去搜搜看~');
        $state.go('book.search-list');
    }).always(function () {
        $scope.isLoading = false;
        $scope.$digest();
    });
    //加载电商联盟信息
    $scope.BookInfo$.getBusinessInfoByISBN($scope.isbn13).done(function (infos) {
        $scope.businessInfos = infos;
        $scope.$digest();
    });

    //////////// 二手书信息 /////////
    $scope.UsedBook$.ISBN_sell.getUsedBookNumberEqualISBN($scope.isbn13).done(function (number) {
        //对应的图书有多少本二手书
        $scope.usedBookNumber = number;
    });
    $scope.UsedBook$.ISBN_sell.loadMoreUsedBookEqualISBN($scope.isbn13);//先加载5个

    //////////// 求书信息 /////////
    $scope.UsedBook$.ISBN_need.getNeedBookNumberEqualISBN($scope.isbn13).done(function (number) {
        //对应的图书有多少本二手书
        $scope.needBookNumber = number;
    });
    $scope.UsedBook$.ISBN_need.loadMoreNeedBookEqualISBN($scope.isbn13);//先加载5个
    //////////// 书漂流信息 /////////
    $scope.UsedBook$.ISBN_circle.getCircleBookNumberEqualISBN($scope.isbn13).done(function (number) {
        //对应的图书有多少本二手书
        $scope.circleBookNumber = number;
    });
    $scope.UsedBook$.ISBN_circle.loadMoreCircleBookEqualISBN($scope.isbn13);//先加载5个
});
/**
 * Created by wuhaolin on 5/20/15.
 * 二手书列表
 */
"use strict";

//二手书列表
APP.controller('book_usedBookList', function ($scope, $stateParams, UsedBook$, BookRecommend$, IonicModalView$) {
    $scope.cmd = $stateParams['cmd'];
    $scope.sortWay = '';
    if ($scope.cmd == 'nearUsed') {
        $scope.title = '你附近的二手书';
        $scope.jsonUsedBooks = BookRecommend$.NearUsedBook.jsonBooks;
        $scope.loadMore = BookRecommend$.NearUsedBook.loadMore;
        $scope.hasMore = BookRecommend$.NearUsedBook.hasMore;
        $scope.setMajorFilter = BookRecommend$.NearUsedBook.setMajorFilter;
        $scope.getMajorFilter = BookRecommend$.NearUsedBook.getMajorFilter;
    } else if ($scope.cmd == 'nearNeed') {
        $scope.title = '你附近的求书';
        $scope.jsonUsedBooks = BookRecommend$.NearNeedBook.jsonBooks;
        $scope.loadMore = BookRecommend$.NearNeedBook.loadMore;
        $scope.hasMore = BookRecommend$.NearNeedBook.hasMore;
        $scope.setMajorFilter = BookRecommend$.NearNeedBook.setMajorFilter;
        $scope.getMajorFilter = BookRecommend$.NearNeedBook.getMajorFilter;
    } else if ($scope.cmd == 'isbnUsed') {
        $scope.title = '对应要卖的旧书';
        $scope.isbn13 = $stateParams['isbn13'];
        $scope.jsonUsedBooks = UsedBook$.ISBN_sell.nowEqualISBNJsonUsedBookList;
        $scope.loadMore = UsedBook$.ISBN_sell.loadMoreUsedBookEqualISBN;
        $scope.hasMore = UsedBook$.ISBN_sell.hasMore;
    } else if ($scope.cmd == 'isbnNeed') {
        $scope.title = '需要这本书的同学';
        $scope.isbn13 = $stateParams['isbn13'];
        $scope.jsonUsedBooks = UsedBook$.ISBN_need.nowEqualISBNJsonNeedBookList;
        $scope.loadMore = UsedBook$.ISBN_need.loadMoreNeedBookEqualISBN;
        $scope.hasMore = UsedBook$.ISBN_need.hasMore;
    }

    //按照专业筛选
    IonicModalView$.registerChooseMajorModalView($scope, function (major) {
        $scope.setMajorFilter && $scope.setMajorFilter(major);
    });
});
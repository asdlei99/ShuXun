/**
 * Created by wuhaolin on 5/20/15.
 * 一个用户的主页
 */
"use strict";

APP.controller('userHome', function ($scope, $stateParams) {
    $scope.ownerId = $stateParams.ownerId;
    var hashId = $stateParams['hashId'];
    var query = new AV.Query(Model.User);
    query.get($scope.ownerId).done(function (owner) {
        $scope.owner = owner;
        $scope.UsedBook$.loadUsedBookListForOwner(owner).done(function (usedBooks) {
            $scope.usedBooks = usedBooks;
            $scope.$digest();
            hashId && $scope.scrollToHash(hashId);
        });
        $scope.UsedBook$.loadNeedBookListForOwner(owner).done(function (needBooks) {
            $scope.needBooks = needBooks;
            $scope.$digest();
            hashId && $scope.scrollToHash(hashId);
        });
        $scope.UsedBook$.loadCircleBookListForOwner(owner).done(function (circleBooks) {
            $scope.circleBooks = circleBooks;
            $scope.$digest();
            hashId && $scope.scrollToHash(hashId);
        });
    });
});

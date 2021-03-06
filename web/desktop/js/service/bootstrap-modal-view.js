/**
 * Created by wuhaolin on 7/27/15.
 */
"use strict";

APP.service('BootstrapModalView$', function ($rootScope, $controller, $modal) {

    /**
     * 打开选择专业modal view
     * @param majorOnChooseCallback 当选中了一个专业时调用 返回选中的专业
     */
    this.openChooseMajorModalView = function (majorOnChooseCallback) {
        var scope = $rootScope.$new(true);
        var modalInstance = $modal.open({
            templateUrl: 'html/directive/choose-major-modal-view.html',
            scope: scope
        });
        modalInstance.result.then(majorOnChooseCallback);
    };

    /**
     * 打开选择专业school view
     * @param schoolOnChooseCallback 当选中了一个专业时调用 返回选中的专业
     */
    this.openChooseSchoolModalView = function (schoolOnChooseCallback) {
        var scope = $rootScope.$new(true);
        var modalInstance = $modal.open({
            templateUrl: 'html/directive/choose-school-modal-view.html',
            scope: scope
        });
        modalInstance.result.then(schoolOnChooseCallback);
    };

    /**
     * 打开选择 book tag modal view
     * @param bookTagOnChooseCallback 当选中了一个专业时调用 返回选中的专业
     */
    this.openChooseBookTagModalView = function (bookTagOnChooseCallback) {
        var scope = $rootScope.$new(true);
        var modalInstance = $modal.open({
            templateUrl: 'html/directive/choose-book-tag-modal-view.html',
            scope: scope
        });
        modalInstance.result.then(bookTagOnChooseCallback);
    };

});
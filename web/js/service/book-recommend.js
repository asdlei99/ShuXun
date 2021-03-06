/**
 * Created by wuhaolin on 5/20/15.
 * 图书推荐
 */
"use strict";

APP.service('BookRecommend$', function ($rootScope) {
    var that = this;

    /**
     * 所有图书分类
     * @type {Array}
     */
    this.BookTag = {
        tag: null,
        load: function () {
            AV.Cloud.run('getAllBookTags', null, null).done(function (tag) {
                that.BookTag.tag = tag;
                $rootScope.$digest();
            });
        },
        getTagAttrNames: function () {
            if (that.BookTag.tag) {
                return Object.keys(that.BookTag.tag);
            }
            return [];
        }
    };
    that.BookTag.load();

    /**
     * 分类浏览
     * @type {{books: Array, loadMore: Function}}
     */
    this.TagBook = {
        /**
         * 当前搜索的图书分类
         */
        nowTag: '',
        setTag: function (tag) {
            if (tag != that.TagBook.nowTag) {
                that.TagBook.books.length = 0;
                that.TagBook.nowTag = tag;
                //来自BookInfo表里的tag相关的图书
                $rootScope.BookInfo$.searchBook(tag).done(function (bookInfos) {
                    that.TagBook.books.unshiftUniqueArray(bookInfos);
                    $rootScope.$digest();
                    $rootScope.$broadcast('scroll.infiniteScrollComplete');
                });
            }
        },
        books: [],
        hasMoreFlag: true,
        loadMore: function () {
            //来自 豆瓣图书 里的tag相关的图书
            $rootScope.DoubanBook$.getBooksByTag(that.TagBook.nowTag, that.TagBook.books.length, LoadCount).done(function (json) {
                var jsonBooks = json['books'];
                if (jsonBooks.length > 0) {
                    for (var i = 0; i < jsonBooks.length; i++) {
                        that.TagBook.books.push(Model.BookInfo.fromDouban(jsonBooks[i]));
                    }
                } else {
                    that.TagBook.hasMoreTag = false;
                }
                $rootScope.$digest();
                $rootScope.$broadcast('scroll.infiniteScrollComplete');
            });
        },
        hasMore: function () {
            return that.TagBook.hasMoreFlag;
        }
    };

    /**
     * 不是我自己上传的
     * @param role UserBook role属性, sell(要卖的)  need(求书) circle(书漂流)
     * @param tag
     * @returns {AV.Query}
     * @private
     */
    function _buildUsedBookQuery_matchBookTag(role, tag) {
        var query = new AV.Query(Model.UsedBook);
        query.equalTo('alive', true);
        role && query.equalTo('role', role);
        var me = AV.User.current();
        me && query.notEqualTo('owner', me);//不要显示自己的上传的
        if (tag) {
            var bookInfoQuery1 = new AV.Query(Model.BookInfo);
            bookInfoQuery1.contains('title', tag);
            var bookInfoQuery2 = new AV.Query(Model.BookInfo);
            bookInfoQuery2.contains('catalog', tag);
            var bookInfoQuery = AV.Query.or(bookInfoQuery1, bookInfoQuery2);
            query.matchesQuery('bookInfo', bookInfoQuery);
        }
        return query;
    }

    /**
     * 不是我自己上传的,按照距离我距离排序的,
     * @param role UserBook role属性, sell(要卖的)  need(求书) circle(书漂流)
     * @param major 附加的专业显示,只显示和我同一个专业的同学上传的书,==null时无限制
     * @returns {AV.Query}
     * @private
     */
    function _buildUsedBookQuery_EqualOwnerMajor(role, major) {
        var query = new AV.Query(Model.UsedBook);
        query.equalTo('alive', true);
        role && query.equalTo('role', role);
        var me = AV.User.current();
        me && query.notEqualTo('owner', me);//不要显示自己的上传的
        var location = me ? me.get('location') : null;
        if (location || major) {
            var ownerUserQuery = new AV.Query(Model.User);
            location && ownerUserQuery.near("location", location);
            major && ownerUserQuery.equalTo('major', major);
            query.matchesQuery('owner', ownerUserQuery);
        }
        return query;
    }

    /**
     * 附近同学发布的求书
     * @type {{circleBooks: Array, loadMore: Function}}
     */
    this.NearCircleBook = {
        circleBooks: [],
        _hasMoreFlag: true,
        loadMore: function () {
            var query = _buildUsedBookQuery_matchBookTag('circle', that.NearCircleBook._tagFilter);
            query.skip(that.NearCircleBook.circleBooks.length);
            query.limit(LoadCount);
            query.find().done(function (circleBooks) {
                if (circleBooks.length > 0) {
                    that.NearCircleBook.circleBooks.pushUniqueArray(circleBooks);
                } else {
                    that.NearCircleBook._hasMoreFlag = false;
                }
                $rootScope.$digest();
                $rootScope.$broadcast('scroll.infiniteScrollComplete');
            })
        },
        hasMore: function () {
            return that.NearCircleBook._hasMoreFlag;
        },
        _tagFilter: null,
        setTagFilter: function (major) {
            if (major != that.NearCircleBook._tagFilter) {
                that.NearCircleBook.circleBooks.length = 0;
                that.NearCircleBook._hasMoreFlag = true;
                that.NearCircleBook._tagFilter = major;
                that.NearCircleBook.loadMore();
            }
        },
        getTagFilter: function () {
            return that.NearCircleBook._tagFilter;
        },
        /**
         * 把主人同一个专业的同学上传的书插入到最开头
         */
        unshiftMajorBook: function () {
            var me = AV.User.current();
            var major = me ? me.get('major') : null;
            _buildUsedBookQuery_EqualOwnerMajor('circle', major).find().done(function (circleBooks) {
                that.NearCircleBook.circleBooks.unshiftUniqueArray(AV._.shuffle(circleBooks));
                $rootScope.$digest();
                $rootScope.$broadcast('scroll.infiniteScrollComplete');
            })
        }
    };

    /**
     * 附近同学发布的求书
     * @type {{needBooks: Array, loadMore: Function}}
     */
    this.NearNeedBook = {
        needBooks: [],
        _hasMoreFlag: true,
        loadMore: function () {
            var query = _buildUsedBookQuery_matchBookTag('need', that.NearNeedBook._tagFilter);
            query.skip(that.NearNeedBook.needBooks.length);
            query.limit(LoadCount);
            query.find().done(function (needBooks) {
                if (needBooks.length > 0) {
                    that.NearNeedBook.needBooks.pushUniqueArray(needBooks);
                } else {
                    that.NearNeedBook._hasMoreFlag = false;
                }
                $rootScope.$digest();
                $rootScope.$broadcast('scroll.infiniteScrollComplete');
            })
        },
        hasMore: function () {
            return that.NearNeedBook._hasMoreFlag;
        },
        _tagFilter: null,
        setTagFilter: function (major) {
            if (major != that.NearNeedBook._tagFilter) {
                that.NearNeedBook.needBooks.length = 0;
                that.NearNeedBook._hasMoreFlag = true;
                that.NearNeedBook._tagFilter = major;
                that.NearNeedBook.loadMore();
            }
        },
        getTagFilter: function () {
            return that.NearNeedBook._tagFilter;
        },
        /**
         * 把主人同一个专业的同学上传的书插入到最开头
         */
        unshiftMajorBook: function () {
            var me = AV.User.current();
            var major = me ? me.get('major') : null;
            _buildUsedBookQuery_EqualOwnerMajor('need', major).find().done(function (needBooks) {
                that.NearNeedBook.needBooks.unshiftUniqueArray(AV._.shuffle(needBooks));
                $rootScope.$digest();
                $rootScope.$broadcast('scroll.infiniteScrollComplete');
            })
        }
    };

    /**
     * 附近的二手图书
     * @type {{usedBooks: Array, loadMore: Function, hasMore: Function}}
     */
    this.NearUsedBook = {
        usedBooks: [],
        _hasMoreFlag: true,
        loadMore: function () {
            var query = _buildUsedBookQuery_matchBookTag('sell', that.NearUsedBook._tagFilter);
            query.skip(that.NearUsedBook.usedBooks.length);
            query.limit(LoadCount);
            query.find().done(function (usedBooks) {
                if (usedBooks.length > 0) {
                    that.NearUsedBook.usedBooks.pushUniqueArray(usedBooks);
                } else {
                    that.NearUsedBook._hasMoreFlag = false;
                }
                $rootScope.$digest();
                $rootScope.$broadcast('scroll.infiniteScrollComplete');
            });
        },
        hasMore: function () {
            return that.NearUsedBook._hasMoreFlag;
        },
        _tagFilter: null,
        setTagFilter: function (major) {
            if (major != that.NearUsedBook._tagFilter) {
                that.NearUsedBook.usedBooks.length = 0;
                that.NearUsedBook._hasMoreFlag = true;
                that.NearUsedBook._tagFilter = major;
                that.NearUsedBook.loadMore();
            }
        },
        getTagFilter: function () {
            return that.NearUsedBook._tagFilter;
        },
        /**
         * 把主人同一个专业的同学上传的书插入到最开头
         */
        unshiftMajorBook: function () {
            var me = AV.User.current();
            var major = me ? me.get('major') : null;
            _buildUsedBookQuery_EqualOwnerMajor('sell', major).find().done(function (needBooks) {
                that.NearUsedBook.usedBooks.unshiftUniqueArray(AV._.shuffle(needBooks));
                $rootScope.$digest();
                $rootScope.$broadcast('scroll.infiniteScrollComplete');
            })
        }
    };

    /**
     * 我附近的用户
     * @type {{users: Array, loadMore: Function, hasMore: Function}}
     */
    this.NearUser = {
        users: [],
        _hasMoreFlag: true,
        /**
         * 最新更新的,不是我自己,按照距离我距离排序的,
         * @param majorFilter 附加的专业显示,只显示和我同一个专业的同学上传的书,==null时无限制
         * @private
         */
        _buildQuery: function (majorFilter) {
            var query = new AV.Query(Model.User);
            query.descending("updatedAt");
            var me = AV.User.current();
            me && query.notEqualTo('objectId', me.id);//不要显示自己
            var avosGeo = me ? me.get('location') : null;
            avosGeo && query.near("location", avosGeo);
            majorFilter && query.equalTo('major', majorFilter);
            return query;
        },
        loadMore: function () {
            var query = that.NearUser._buildQuery(that.NearUser._majorFilter);
            query.skip(that.NearUser.users.length);
            query.limit(Math.floor(document.body.clientWidth / 50));//默认加载满屏幕
            query.find().done(function (users) {
                if (users.length > 0) {
                    that.NearUser.users.pushUniqueArray(users);
                } else {
                    that.NearUser._hasMoreFlag = false;
                }
                $rootScope.$digest();
                $rootScope.$broadcast('scroll.infiniteScrollComplete');
            })
        },
        hasMore: function () {
            return that.NearUser._hasMoreFlag;
        },
        _majorFilter: null,
        setMajorFilter: function (major) {
            if (major != that.NearUser._majorFilter) {
                that.NearUser.users.length = 0;
                that.NearUser._hasMoreFlag = true;
                that.NearUser._majorFilter = major;
                that.NearUser.loadMore();
            }
        },
        getMajorFilter: function () {
            return that.NearUser._majorFilter;
        },
        /**
         * 把主人同一个专业的同学插入到最开头
         */
        unshiftMajorUser: function () {
            var me = AV.User.current();
            var major = me ? me.get('major') : null;
            var query = that.NearUser._buildQuery(major);
            query.find().done(function (users) {
                that.NearUser.users.unshiftUniqueArray(AV._.shuffle(users));
            });
        }
    };
});
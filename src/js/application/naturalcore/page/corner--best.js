/**
 * 코너 - 베스트
 * @Object params
 * @constructor
 */
var Best = function(params){
        this.init(params);
};

Best.prototype = {
    init: function(params){
        this.cacheDom();
        this.initView();
        this.setEvent();
    },

    cacheDom: function(){
        this.$dom = {
            window: $(window),
            body: $('body'),
            boxCategory: $('.box--category'),
            boxCategoryList: $('.box--category_list'),
            boxCategoryItem: $('.box--category_list .hide_area'),
            categoryList: $('.box--category_list .hide_area .list'),
            categoryItem: $('.box--category_list .hide_area .list .item')
        }
    },

    /**
     * View 초기화
     */
    initView: function(){
        this.setCategoryListPosition();
        this.categoryUiActiveAsPosition();
    },

    setEvent: function(){
        this.$dom.boxCategoryItem.on('scroll', $.proxy(this.categoryUiActiveAsPosition, this));
    },

    categoryUiActiveAsPosition: function(){
        var horizenCurrentPosition = this.$dom.boxCategoryItem.scrollLeft(),
            horizenLastPosition = this.$dom.boxCategoryItem.find('.list').width() - this.$dom.boxCategoryItem.width();

        horizenCurrentPosition > 5 ? this.$dom.boxCategory.addClass('left') : this.$dom.boxCategory.removeClass('left');
        horizenCurrentPosition < horizenLastPosition ? this.$dom.boxCategory.addClass('right') : this.$dom.boxCategory.removeClass('right');
    },

    /**
     * 활성화된 카테고리 가로 위치값 처리
     */
    setCategoryListPosition: function(){
        var categoryListWidth = 0,
            activeItemOffset;

        _.each(this.$dom.categoryItem, function(val, idx){
            categoryListWidth += $(val).outerWidth();
        });

        this.$dom.categoryList.width(categoryListWidth);
        this.$dom.boxCategoryList.addClass('on');
        activeItemOffset = this.$dom.boxCategoryItem.find('.item.on').offset().left + (this.$dom.boxCategoryItem.find('.item.on').width()/2) - this.$dom.boxCategoryItem.width()/2;
        this.$dom.boxCategoryItem.animate({scrollLeft:activeItemOffset}, 500);
    }
};
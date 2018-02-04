/**
 * 코너 - 공통
 * @Object params
 * @constructor
 */
var CornerCommon = function(){
    this.init();
};

CornerCommon.prototype = {
    /**
     * 생성자
     * @param params
     */
    init: function(){
        this.cacheDom();
        this.initView();
    },

    /**
     * Element Cache
     */
    cacheDom: function(){
        this.$dom = {
            window: $(window),
            body: $('body'),
            boxSimpleCornerNavigation: $('.box--corner_navigation'),
            simpleCornerNavigation: $('.box--navigation_simple')
        };
    },

    /**
     * View 초기화
     */
    initView: function(){
        this.setCornerHeader();
    },

    /**
     * 코너 헤더 UI Fixed 처리
     */
    setCornerHeader: function(){
        var currentScrollTop = window.pageYOffset,
            cornerTab = $('.box--corner_navigation'),
            cornerTabOffsetTop;

        requestAnimationFrame(arguments.callee);

        // Webview UI 처리 로직 분기
        cornerTabOffsetTop = GMARKET.UI.COMMON.UTIL.getUaFromClassName().platform === 'app' ? cornerTab.find('.box--navigation_simple').height() : cornerTab.offset().top;
        currentScrollTop <= cornerTabOffsetTop ? cornerTab.removeClass('on') : cornerTab.addClass('on');
    }
};
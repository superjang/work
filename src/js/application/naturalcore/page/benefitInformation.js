/**
 * 홈쇼핑 혜택 안내
 * @Object params
 * @constructor
 */
var BenefitInformation = function(params){
    this.init(params);
};

BenefitInformation.prototype = {
    init: function(params){
        this.cacheDom();
        this.initView();
    },

    cacheDom: function(){
        this.$dom = {
            window: $(window),
            body: $('body')
        }
    },

    /**
     * View 초기화
     */
    initView: function(){
        this.initBenefitMainSlider();
    },

    initBenefitMainSlider: function(){
        var slider = {
            target: '.box--module.box--main_slider',
            config: {
                wrapperClass: 'list',
                slideClass: 'item',
                centeredSlides: false,
                pagination: {
                    el: '.list--navigator',
                    bulletClass: 'item--navigator',
                    bulletActiveClass: 'on'
                }
            }
        };

        new Swiper(slider.target, slider.config);
    }
};
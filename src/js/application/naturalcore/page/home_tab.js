/**
 * 홈탭
 * @Object params
 * @class
 */
var HomeTab = function(params){
    this.init(params);
};

HomeTab.prototype = {
    init: function(params){
        this.initModule(params);
        this.cacheDom();
        this.setTemplate();
        this.setEvent();
        this.initView();
    },

    initModule: function(params){
        this.module = {
            Common: params.Common,
            LiveScheduleTimer: params.LiveScheduleTimer
        };
    },

    cacheDom: function(){
        this.$dom = {
            window: $(window),
            body: $('body'),
            header: $('#head.new'), // header UI
            bxoBannerPromotion: $('.box--banner_promotion'), // 프로모션배너 모듈
            boxBroadcastVendorsList: $('.box--broadcast_vendors_list.type-b'), // 방송업체 리스트
            bannerPromotion: $('._banner_promotion'), // 프로모션 배너 컨텐츠
            liveBoxListItem: $('.box--list_vendor_deal.type-a .list .item'), // 라이브박스 리스트
            listPopularity: $('.box--list_popularity') // 인기프로그램
        }
    },

    setEvent: function(){
        this.$dom.window
            .on('scroll', $.proxy(this.checkBannerPromotionAction, this))
            .on('focus', $.proxy(function(){
                this.module.Common.forceBroadcastTimeSync('iOS');
            }, this))

        this.$dom.body
            .on('callTimer', $.proxy(function(e, liveBoxItem){
                this.setLiveDealTimeCounter(this.getLiveBoxDataList(liveBoxItem));
            }, this));
    },

    setTemplate: function(){
        // 비디오 플레이어 생방송 없을 경우(다음 방송시간 알림)
        $.template(
            'template_liveBoxNotificationEmptyLiveSchedule',
            '<span class="box--empty_broadcast">'+
                '<span class="empty_broadcast">'+
                    '<span class="content--empty_broadcast">'+
                        '<p class="text--title">다음 생방송이 없습니다.</p>'+
                        '<p class="text--sub_title">' +
                        '다른 채널의 방송을 시청하시거나 편성표를 확인해주세요.' +
                        '{{if hasNextBroadcastInToday}}<br/>(다음 생방송 시작시간 : ${nextBroadcastOnAirSchedule}){{/if}}'+
                        '</p>'+
                    '</span>'+
                '</span>'+
            '</span>'
        );
    },

    /**
     * View 초기화
     */
    initView: function(){
        this.setVendorHorizenList(); // 벤더 리스트 가로값 동적 처리
        // 슬라이더 플러그인 사용 UI 초기화
        this.setParamLiveBox(); // 라이브박스 영역
        this.setParamVendorPromotion(); // 업체별 프로모션 영역
        this.setParamPickBest(); // 최고의 1분 PIC 영역
        this.setListPopularity(); // 인기프로그램
        this.setLiveDealTimeCounter(this.getLiveBoxDataList(this.$dom.liveBoxListItem)); // 라이브 박스 딜카드 UI 초기화
    },

    forceBroadcastTimeSync: function(){
        if( GMARKET.UI.COMMON.UTIL.getUa().os.name === 'iOS' ){
            location.reload();
        }
    },

    setListPopularity: function(){
        var item = this.$dom.listPopularity.find('.item'),
            eachItemWidth = item.outerWidth(true),
            totalItem = item.length,
            totalWidth = (totalItem * eachItemWidth) - (eachItemWidth - item.outerWidth());

        this.$dom.listPopularity
            .find('.list')
            .width(totalWidth);
    },

    setLiveDealTimeCounter: function(liveBoxDataList){
        $.each(liveBoxDataList, $.proxy(function(idx, item){
            if( item.videoType === 1 || item.videoType === 2 ){
                this.liveBoxItem = new this.module.LiveScheduleTimer({
                    timeInformation: item,
                    dealCardIndex: item.dealCardIndex
                });

                this.liveBoxItem.startBroadCastTimer();
            }
        }, this));
    },

    getLiveBoxDataList: function(targetLiveBox){
        if( !targetLiveBox ){
            return;
        }

        var liveBoxDataList = [];

        $.each(targetLiveBox, $.proxy(function(idx, item){
            if(!$(item).hasClass('link')){
                var store = $(item).find('.box--item_image');

                liveBoxDataList.push({
                    dealCardIndex: $(item).index(),
                    sellerId: store.data('seller-id'),
                    videoType: store.data('video-type'),
                    currentTime: store.data('current-time'),
                    BroadcastStartTime: store.data('start-time'),
                    BroadcastEndTime: store.data('end-time'),
                    NextTimeBroadcastInfo: store.data('next-schedule'),
                    NextBroadcastTimeInformation: store.data('next-schedule-time'),
                    currentBroadcastSeq: store.data('broadcast-seq')
                });
            }
        }, this));

        return liveBoxDataList;
    },

    setVendorHorizenList: function(){
        var item = this.$dom.boxBroadcastVendorsList.find('.item'),
            eachItemWidth = item.outerWidth(),
            totalItem = item.length,
            totalWidth = totalItem * eachItemWidth;

        this.$dom.boxBroadcastVendorsList
            .find('.list--broadcast_vendors')
            .width(totalWidth)
            .addClass('on');
    },

    /**
     * 프로모션배너 노출 동작 구간 확인
     */
    checkBannerPromotionAction: function(){
        var viewPortHeight = this.$dom.window.height(), // device viewport 높이값
            headerHeight = this.$dom.header.height(), // ui 헤더 높이값
            currentScrollTop = this.$dom.window.scrollTop(), // 현재 스크롤 위치 값
            moduleOffsetTop = this.$dom.bxoBannerPromotion.offset().top, // 배너 모듈의 top offset 값
            viewportBaseOffsetTop = Math.floor((viewPortHeight - headerHeight) / 2), // 모듈 노출로직 동작 영역 시작값 설정을 위한값
            scrollInfo = GMARKET.UI.COMMON.UTIL.getScrollDirection(), // 스크롤 데이터 객체
            param = { show : null }; // 배너 노출 메소드 파라미터

        /**
         * 배너노출 동작구간 확인
         * 배너 UI가 화면의 중간 <-> 상단(header UI 아래) 사이에 위치할 경우에만 배너 노출 메소드를 호출합니다.
         */

        var // 배너 모듈의 top offset 값에서 header UI를 제외한 view 영역 높이값의 반을 뺀 값
            // * 아래로 슬라이드 되며 열리는 배너 UX를 고려하여 절반 위치를 동작 구간 진입 위치값으로 설정 합니다.
            startPos = moduleOffsetTop - viewportBaseOffsetTop,
            // 배너 모듈의 top offset 값에서 header UI 높이값을 뺀 값
            endPos = moduleOffsetTop - headerHeight;

        if( !(startPos < currentScrollTop && currentScrollTop < endPos) ) {
            return;
        }

        if( scrollInfo.direction === 'down' && !this.$dom.bannerPromotion.hasClass('on')){
            // 스크롤 방향이 아래이며 배너가 열리지 않은 경우 배너를 열기위한 파라미터 'show' true 값 할당.
            param.show = true;
        } else if( scrollInfo.direction === 'up' && this.$dom.bannerPromotion.hasClass('on') ){
            // 스크롤 방향이 위이며 배너가 열린 경우, 배너를 닫기위한 파라미터 값 'show' false 값 할당.
            param.show = false;
        }

        // 배너 활성화 / 비활성화 처리 메소드 호출
        this.toggleBannerPromotion(param);
    },

    /**
     * 프로모션 배너 활성화 / 비활성화 처리
     * @Object params
     */
    toggleBannerPromotion: function(params){
        // 노출 처리 값 벨리데이션, boolean 타입 아닌 경우 종료
        if( typeof params.show !== 'boolean' ){
            return;
        }

        var promotionBanner = this.$dom.bannerPromotion,
            ANIMATION_DURATION = 300, // 애니메이션 진행 시간
            BANNER_HEIGHT_OFF = 118, // 배너 비활성화시 배너 높이값 (비활성화 높이는 viewport 가로 사이즈에 관계없이 고정)
            EASING = 'swing', // transition 값
            bannerHeightOn = promotionBanner.find('.image--banner').height(), // 배너 활성화시 viewport 가로 사이즈에 따른 노출 높이값
            bannerHeight = null, // 배너 활성화 / 비활성화에 따른 높이값을 담을 변수
            callback = null; // 애니메이션 완료 후 호출될 콜백 함수

        if( params.show ){
            promotionBanner.addClass('on');
            bannerHeight = bannerHeightOn;
            callback = function(){
                // 배너 활성화 후 viewport 리사이징시 배너 사이즈 비율 처리를 위한 콜백,
                // img 태그의 이미지 높이값 auto 로 리사이징 대응
                promotionBanner.css({'height':'auto'});
            };
        } else {
            promotionBanner.removeClass('on');
            bannerHeight = BANNER_HEIGHT_OFF;
        }

        promotionBanner
            .stop()
            .animate({'height':bannerHeight}, ANIMATION_DURATION, EASING, callback);
    },

    /**
     * Swiper 사용하는 UI 인스턴스 생성
     * @Object params
     */
    initSlider: function(params){
        if( !params.target ){
            return;
        }

        this[params.name] = new Swiper(params.target, params.config);

        if( params.name === 'liveBox' ){
            this.sendLiveBoxAreaCode(this[params.name]);
        }
    },

    /**
     * Swiper 슬라이더 UI 파라미터 객체 설정 - 라이브박스 UI
     */
    setParamLiveBox: function(){
        var slider = {
            name: 'liveBox',
            target: '.box--list_vendor_deal .box--module_body',
            config: {
                init: false,
                wrapperClass: 'list',
                slideClass: 'item',
                slidesPerView: 'auto',
                spaceBetween: 10,
                pagination: {
                    el: '.list--navigator',
                    bulletClass: 'item--navigator',
                    bulletActiveClass: 'on'
                }
            }
        };

        this.initSlider.call(this, slider);
    },

    /**
     * Swiper 슬라이더 UI 파라미터 객체 설정 - 업체별 프로모션 UI
     */
    setParamVendorPromotion: function(){
        var slider = {
            name: 'vendorPromotion',
            target: '.box--banner_vendor .box--module_body',
            config: {
                wrapperClass: 'list',
                slideClass: 'item',
                slidesPerView: 'auto',
                centeredSlides:true,
                loop: true,
                pagination: {
                    el: '.list--navigator',
                    bulletClass: 'item--navigator',
                    bulletActiveClass: 'on'
                }
            }
        };

        this.initSlider.call(this, slider);
    },

    /**
     * Swiper 슬라이더 UI 파라미터 객체 설정 - 최고의 1분 PICK UI
     */
    setParamPickBest: function(){
        var slider = {
            name: 'pickBest',
            target: '.box--pick_best .box--module_body',
            config: {
                wrapperClass: 'list',
                slideClass: 'item',
                pagination: {
                    el: '.list--navigator',
                    bulletClass: 'item--navigator',
                    bulletActiveClass: 'on'
                }
            }
        };

        this.initSlider.call(this, slider);
    },

    /**
     * 라이브박스 연속된 다음 생방송 없을 경우 UI 렌더링
     * @param responseData
     * @param {Number} targetIndex
     */
    notLiveTime: function(targetIndex, nextTimeInformation, currentTimeInformation){
        var nextBroadcastTime,
            data,
            today = null,
            nextBroadcast = null,
            renderData = {
                hasNextBroadcastInToday: false,
                nextBroadcastOnAirSchedule: false
            };

        if( nextTimeInformation ){
            today = this.module.Common.getTimeInformation(currentTimeInformation);
            nextBroadcast = this.module.Common.getTimeInformation(nextTimeInformation);

            renderData.hasNextBroadcastInToday = today.originDateObject.toLocaleDateString() === nextBroadcast.originDateObject.toLocaleDateString() ? true : false;

            if( renderData.hasNextBroadcastInToday ){
                renderData.nextBroadcastOnAirSchedule = nextBroadcast.timeDivision + ' ';
                renderData.nextBroadcastOnAirSchedule += nextBroadcast.time.hours > 12 ? nextBroadcast.time.hours - 12 + '시' : nextBroadcast.time.hours + '시';
                if( nextBroadcast.time.minute > 0 ){
                    renderData.nextBroadcastOnAirSchedule += ' ' + nextBroadcast.time.minute + '분';
                }
            }
        }

        data = {
            isClear: true,
            templateId: 'template_liveBoxNotificationEmptyLiveSchedule',
            appendTarget: this.$dom.liveBoxListItem.eq(targetIndex).find('.template--live_box_empty'),
            renderData: renderData
        };

        GMARKET.UI.COMMON.UTIL.renderTemplate(data);
    },

    /**
     * 라이브박스 아이템 재생 시간 업데이트
     * @param {Number} targetIndex
     * @param {String} data
     */
    setTimeInformation: function(targetIndex, data){
        this.$dom.liveBoxListItem
            .eq(targetIndex)
            .find('.text--data_play_time')
            .text(data);
    },

    /**
     * 라이브박스 아이템 재생 프로그레스바 업데이트
     * @param {Number} targetIndex
     * @param {String} data
     */
    setProgressRate: function(targetIndex, data){
        this.$dom.liveBoxListItem
            .eq(targetIndex)
            .find('.progressing_time')
            .css({'width': data + '%'});
    },

    sendLiveBoxAreaCode: function(liveBoxInstance){
        var liveBox = liveBoxInstance,
            initActiveItemIndex = liveBox.activeIndex + 1,
            itemTotalLength = liveBox.slides.length;

        liveBox.on('init', $.proxy(function(){
            var areaCodeParam = this.getLiveBoxAreaParam(liveBox.slides[initActiveItemIndex], initActiveItemIndex);
            this.sendAreaCode({data: areaCodeParam});
        }, this));

        liveBox.init();

        liveBox.on('transitionEnd', $.proxy(function(){
            var currentActiveItemIndex = liveBox.activeIndex + 1,
                areaCodeParam;

            if( currentActiveItemIndex < itemTotalLength ){
                areaCodeParam = this.getLiveBoxAreaParam(liveBox.slides[currentActiveItemIndex], currentActiveItemIndex);
                this.sendAreaCode({data: areaCodeParam});
            } else if( currentActiveItemIndex === itemTotalLength ){
                // 편성표 더보기 버튼
                this.sendAreaCode({data: areaCodeParam});
            }
        }, this));
    },

    sendAreaCode: function(params){
        // var areaData = {
        //     areaCode: null,
        //     actionType: 'Utility',
        //     param: {
        //         view_mode: this.getViewOrientation(),
        //         broadcastgoodsno: null,
        //         seller_id: null
        //     }
        // };
        //
        // if( params.target ){
        //     areaData.areaCode = params.target.data('area-code-areacode');
        //     areaData.param.broadcastgoodsno = params.target.data('area-code-broadcastgoodsno');
        //     areaData.param.seller_id = params.target.data('area-code-seller-id');
        // }
        //
        // if( params.data ){
        //     areaData.areaCode = params.data.code;
        //     areaData.param.broadcastgoodsno = params.data.broadcastgoodsno;
        //     areaData.param.seller_id = params.data.seller_id;
        // }
        //
        // console.log('[pdsClickLog Param] =>', areaData);
        // pdsClickLog(areaData.areaCode, areaData.actionType, areaData.param);
    },

    getLiveBoxAreaParam: function(targetItem, index){
        // var target = $(targetItem),
        //     store = target.find('.box--item_image'),
        //     data = {
        //         areaCode: store.areaCode,
        //         actionType: 'Utility',
        //         param: {
        //             view_mode: this.getViewOrientation(),
        //             broadcastgoodsno: null,
        //             seller_id: null,
        //             itemIndex: index
        //         }
        //     };
        //
        // return data;
    }
};
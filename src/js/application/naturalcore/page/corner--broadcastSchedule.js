/**
 * 코너 - 편성표
 * @Object params
 * @constructor
 */
var BroadcastSchedule = function(params){
    this.init(params);
};

BroadcastSchedule.prototype = {
    isActivePrevBroadCastLoadButton: false,
    // touchStartPageY: 0,
    // touchEndPageY: 0,
    // touchDirection: null,

    init: function(params){
        this.initModule(params);
        this.cacheDom();
        this.setEvent();
        this.initView();
    },

    cacheDom: function(){
        this.$dom = {
            window: $(window),
            body: $('body'),
            content: $('#content'),
            emptyBroadcastSchedule: $('.box--broadcast_schedule_list_empty'),
            boxBroadcastSchedule: $('.box--broadcast_schedule_date'),
            boxBoradcastScheduleItem: $('.box--broadcast_schedule_date .box--date_list .hide_area'),
            boxBroadcastVendorsList: $('.list--broadcast_vendors.type-b'), // 방송업체 리스트
            boxVendorList: $('.button--toggle_vendor_list'),
            liveDealCardList: $('.box-broadcast.now--schedule .list .item--detail'), // 지금 방송중 딜카드
            vendorOtherDealList: $('.box--vendor_other_deal_list') // 연관상품
        }
    },

    setEvent: function(){
        this.$dom.boxVendorList.on('click', $.proxy(this.toggleVendorList, this));
        this.$dom.window
            .on('focus', $.proxy(function(){
                this.module.Common.forceBroadcastTimeSync('iOS');
            }, this))
    },

    initModule: function(params){
        this.module = {
            Common: params.Common,
            LiveScheduleTimer: params.LiveScheduleTimer
        };
    },

    /**
     * View 초기화
     */
    initView: function(){
        this.setBroadcastDateListPosition();
        this.setVendorOtherDealList();
        this.setVendorHorizenList(); // 벤더 리스트 가로값 동적 처리
        if( !this.$dom.content.hasClass('status--empty_broadcast_schedule') ){
            // 편성표가 있을 경우 UI 초기화
            this.setLiveDealTimeCounter(this.getLiveBoxDataList(this.$dom.liveDealCardList));
        } else {
            // 편성표가 없을 경우 UI 초기화
            this.setEmptyBroadcastScheduleUi()
        }
    },

    setVendorOtherDealList: function(){
        var otherDealList = this.$dom.vendorOtherDealList;

        if(!otherDealList.length){
            return;
        }

        _.each(otherDealList, $.proxy(function(item, idx){
            var otherDealItemList = $(item).find('.item'),
                tempWidth = 0;

            _.each(otherDealItemList, $.proxy(function(item, idx){
                tempWidth += $(item).outerWidth(true);
            }, this));

            $(item).find('.list').width(tempWidth);
        }, this));
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
            var store = $(item);

            liveBoxDataList.push({
                dealCardIndex: $(item).index(),
                sellerId: store.data('seller-id'),
                videoType: store.data('video-type'),
                currentTime: store.data('current-time'),
                BroadcastStartTime: store.data('start-time'),
                BroadcastEndTime: store.data('end-time'),
                NextTimeBroadcastInfo: store.data('next-schedule'),
                NextBroadcastTimeInformation: store.data('next-schedule-time')
            });

        }, this));

        return liveBoxDataList;
    },

    setVendorHorizenList: function(){
        var item = this.$dom.boxBroadcastVendorsList.find('.item'),
            eachItemWidth = item.outerWidth(),
            totalItem = item.length,
            totalWidth = totalItem * eachItemWidth;

        this.$dom.boxBroadcastVendorsList
            .find('.list')
            .width(totalWidth);
    },

    /**
     * 활성화된 편성표 날짜 가로 위치값 처리
     */
    setBroadcastDateListPosition: function(){
        var dateList = $('.box--corner_navigation .box--vendor .box--broadcast_schedule_date .box--date_list .item'),
            itemWidth = 0;

        _.each(dateList, function(el){
            itemWidth += el.getBoundingClientRect().width;
        });

        $('.box--corner_navigation .box--vendor .box--broadcast_schedule_date .box--date_list .list').width(itemWidth);

        var activeDateIndex = this.$dom.boxBoradcastScheduleItem.find('.item.on').index(),
            activeItemOffset = activeDateIndex > 2 ? this.$dom.window.width() : 0;

        this.$dom.boxBoradcastScheduleItem
            .animate({scrollLeft:activeItemOffset}, 0, $.proxy(function(){
                this.$dom.boxBoradcastScheduleItem.addClass('on');
            }, this));
    },

    /**
     * 채널선택 레이어 토글
     */
    toggleVendorList: function(){
        this.$dom.boxBroadcastSchedule.toggleClass('on');
    },

    /**
     * 편성표가 없을 경우 UI 표시를 위한 높이값 계산
     * @param occupiedElements
     * @returns {number}
     */
    getUnoccupiedContentHeight: function(occupiedElements){
        if( !occupiedElements.length ){
            return;
        }

        var occupiedHeightElements = occupiedElements,
            viewportHeight = $(window).height(),
            occupiedHeight = 0,
            unoccupiedContentHeight = 0;

        _.each(occupiedHeightElements, function(el){
            occupiedHeight += $(el).outerHeight();
        });

        unoccupiedContentHeight = viewportHeight - occupiedHeight;

        return unoccupiedContentHeight;
    },

    /**
     * 편성표가 없을 경우 UI 처리
     */
    setEmptyBroadcastScheduleUi: function(){
        this.$dom.emptyBroadcastSchedule
            .height(this.getUnoccupiedContentHeight(['#head', '#foot', '.box--corner_navigation']))
            .addClass('on');
    }
};
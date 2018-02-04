/**
 * 라이브 방송 타이머
 * @param params
 * @constructor
 */
var LiveScheduleTimer = function(params){
    this.init(params);
};

LiveScheduleTimer.prototype = {
    /**
     * 생성자
     * @param params
     */
    init: function(params){
        this.setModel(params);
        this.domCache();
        this.initLiveBoxItemView(params);
    },

    /**
     * 타이머 모델 초기화
     * @param params
     */
    setModel: function(params){
        this.dealCardIndex = params.dealCardIndex;
        this.currentBroadcastSeq = params.timeInformation.currentBroadcastSeq;
        this.currentTimeInformation = params.timeInformation.currentTime;
        this.NextBroadcastTimeInformation = params.timeInformation.NextBroadcastTimeInformation;
        this.NextTimeBroadcastInfo = params.timeInformation.NextTimeBroadcastInfo;
        this.videoTime = {
            current: new Date(params.timeInformation.currentTime),
            start: new Date(params.timeInformation.BroadcastStartTime),
            end: new Date(params.timeInformation.BroadcastEndTime),
            leftTime: new Date(params.timeInformation.BroadcastEndTime)
        };
    },

    /**
     * DOM 캐시
     */
    domCache: function(){
        this.$dom = {
            liveBox: $('.box-broadcast.now--schedule'),
            item: $('.box-broadcast.now--schedule .item--detail').eq(this.dealCardIndex), // 편성표 라이브 딜카드
            timeField: $('.box-broadcast.now--schedule .item--detail').eq(this.dealCardIndex).find('.text--data_play_time'), // 편성표 시간필드

            homeTabLiveBox: $('.box--list_vendor_deal .list .item'),
            homTabTimeField: $('.box--list_vendor_deal .list .item').eq(this.dealCardIndex).find('.text--data_play_time'), // 홈탭 시간필드
            homTabProgressBar: $('.box--list_vendor_deal .list .item').eq(this.dealCardIndex).find('.progressing_time') // 홈탭 프로그레스바
        }
    },

    /**
     * 타이머 시작
     */
    startBroadCastTimer: function(){
        var that = this,
            time = this.videoTime,
            progressRate = 0;

        // 현재 시간이 편성표 방송 시작시간 보다 이전이면 타이머 시작하지 않음
        if(time.current.getTime() < time.start.getTime()){
            console.error('invalid broadcast schedule, current time is faster than broadcast time.');
            return;
        }

        // 남은 시간 설정, (방송 종료 시간 - 현재 시간) + 남은 시간(방송 종료 시간) 값으로 남은 시간 설정
        // 방송 종료 시간에 남은 시간을 더해 시간을 줄여 종료 시간과 일치시 방송 종료함
        time.leftTime.setTime(time.leftTime.getTime() + (time.end.getTime() - time.current.getTime()));
        this.playTimer = setInterval(function(){
            // 남은 시간이 방송 종료 시간보다 같거나 작을 경우 방송종료
            if( time.leftTime.getTime() <= time.end.getTime() ){
                // 홈탭 UI용
                if(GMARKET.UI.MODEL_AND_VIEW.CURRENT_PAGE === '/homeTab'){
                    that.$dom.homTabTimeField.text('방송종료');
                    that.$dom.homTabProgressBar.css({'width':'100%'});

                    // 연속된 다음 방송 없을 경우 해당 딜카드에 방송없음 안내 UI 노출
                    if( !that.NextTimeBroadcastInfo ){
                        GMARKET.UI.APP.HOMESHOPPING.PAGE.homeTab.notLiveTime.call(GMARKET.UI.APP.HOMESHOPPING.PAGE.homeTab, that.dealCardIndex, that.NextBroadcastTimeInformation, that.currentTimeInformation);
                    } else {
                        // 연속된 방송 있을 경우 API 호출하는 메소드 호출
                        setTimeout(function(){
                            // API호출 메소드 (딜카드 시퀀스, 셀러 아이디 파라미터로 전달)
                            // 200 떨어지면 개발에서 updateLiveBoxItem 메소드 사용하여 UI 업데이트 처리함
                            getNextBroadcastInfo(
                                that.dealCardIndex,
                                that.$dom.homeTabLiveBox.eq(that.dealCardIndex).find('.box--item_image').data('seller-id'),
                                that.currentBroadcastSeq
                            );
                        }, 3000);
                    }
                }

                // 편성표 UI 용
                if(GMARKET.UI.MODEL_AND_VIEW.CURRENT_PAGE === '/corner/broadcastSchedule'){
                    that.$dom.timeField.text('방송종료');
                }

                clearInterval(that.playTimer);
            } else {
                // 방송 종료까지 시간이 남은경우

                // 현재 시간 1초씩 증가
                time.current.setSeconds( time.current.getSeconds() + 1 );
                // 방송 종료시간 1초씩 감소
                time.leftTime.setSeconds( time.leftTime.getSeconds() - 1 );

                // 홈탭 딜카드 UI 업데이트
                if(GMARKET.UI.MODEL_AND_VIEW.CURRENT_PAGE === '/homeTab'){
                    // 재생 % = 100 - (재생시간 / 방송전체 시간 * 100)
                    progressRate = 100 - (((time.end.getTime() - time.current.getTime()) / (time.end.getTime() - time.start.getTime())).toFixed(2) * 100);
                    that.$dom.homTabProgressBar.css({'width': progressRate + '%'});
                    that.$dom.homTabTimeField.text(that.getDurationObject(that.videoTime.current, that.videoTime.end).durationFormatted);
                }

                // 편성표 딜카드 UI 업데이트
                if(GMARKET.UI.MODEL_AND_VIEW.CURRENT_PAGE === '/corner/broadcastSchedule'){
                    that.$dom.timeField.text(that.getDurationObject(that.videoTime.current, that.videoTime.end).durationFormatted);
                }
            }
        }, 1000);
    },

    /**
     * 2자리 시간 표기 처리
     * @param time
     * @returns {string}
     */
    convertTimeFormat: function(time){
        return time < 10 ? '0' + time : time;
    },

    /**
     * 방송시간 객체 생성
     * @param fasterTime
     * @param laterTime
     * @returns {{durationMilliseconds: number, durationFormatted: string}}
     */
    getDurationObject: function(fasterTime, laterTime){
        var fast = fasterTime,
            late = laterTime,
            durationMilliseconds  = late.getTime() - fast.getTime(),
            durationFormatted = '',
            second = 1000,
            minute = second * 60,
            hour = minute * 60;

            durationFormatted += this.convertTimeFormat(Math.floor(durationMilliseconds/hour)) + ':';
            durationFormatted += this.convertTimeFormat(Math.floor((durationMilliseconds/minute)%60)) + ':',
            durationFormatted += this.convertTimeFormat(Math.floor((durationMilliseconds/second)%(60)));

        return {
            durationMilliseconds: durationMilliseconds,
            durationFormatted: durationFormatted
        }
    },

    /**
     * 라이브 박스 UI 시간 초기화
     */
    initLiveBoxItemView: function(){
        this.$dom.timeField.text(this.getDurationObject(this.videoTime.current, this.videoTime.end).durationFormatted);
    },

    /**
     * 라이브 박스 UI 시간 업데이트
     * @param responseData
     */
    updateLiveBoxItem: function(responseData){
        var targetItemIndex = responseData.ItemSequence,
            renderItem = responseData.RenderedItem;

        // this.$dom.homeTabLiveBox
        $('.box--list_vendor_deal .list .item').eq(targetItemIndex).find('.template--live_box').html(renderItem);
        $('body').trigger('callTimer', [$('.box--list_vendor_deal .list').find('.item').eq(targetItemIndex)]);
    }
};
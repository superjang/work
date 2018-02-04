/**
 * 홈쇼핑 공통 메소드
 * @param params
 * @constructor
 */
var HomeshoppingCommon = function(params){
    this.init(params);
};

HomeshoppingCommon.prototype = {
    init: function(params){
        this.initModule(params);
        this.cacheDom();
        this.setTemplate();
    },

    /**
     * 외부 의존모듈 선언
     * @param params
     */
    initModule: function(params){
        this.module = {
            Util: params.Util,
            VideoLayer: params.VideoLayer
        };
    },

    cacheDom: function(){
        this.$dom = {
            window: $(window),
            body: $('body'),
            buttonLike: $('[data-button-type=like]'),
            buttonCallVideoLayer: $('[data-content-type=video]')
        }
    },

    setTemplate: function(){
        // 관심상품 추가 피드백 UI
        $.template(
            'template_addLikeItemComplete',
            '<div class="box--like__complete">'+
                '<img class="icon--like__complete" src="//pics.gmkt.kr/mobile/single/common/img_inter_chk.png" alt="관심상품 추가 완료">'+
            '</div>'
        );
    },

    /**
     * 관심상품 추가 UI 토글
     * @param {object} params - 관심상품 추가 성공
     */
    toggleLike: function(params){
        if(!params.target){
            console.error('Require target element');
            return;
        }

        if( params.status ){
            params.target.addClass('on');

            var data = {
                templateId: 'template_addLikeItemComplete',
                appendTarget: params.target,
                appendType: 'after'
            };

            GMARKET.UI.COMMON.UTIL.renderTemplate(data);
            params.target.parent().find('.box--like__complete')
                .fadeIn(300)
                .delay(1000)
                .fadeOut(300);
        } else {
            params.target.parent().find('.box--like__complete').remove();
            params.target.removeClass('on');
        }
    },

    /**
     * 시간정보를 객체로 변환
     * @param timeInformation - '2017-12-14T01:09:59+09:00'
     * @returns {{isAfternoon: boolean, timeDivision: string, date: {year: number, month: number, date: number, full: string}, time: {hours: number, minute: number, second: number, full: string}}}
     */
    getTimeInformation: function(timeInformation){
        if( !timeInformation ){
            console.error('time information reference error');
            return;
        }

        var time = new Date(timeInformation),
            timeData = {
                originDateObject: time,
                isAfternoon: time.getHours() >= 12 ? true : false,
                timeDivision: time.getHours() >= 12 ? '오후' : '오전',
                date:{
                    year: time.getFullYear(),
                    month: time.getMonth()+1,
                    date: time.getDate(),
                    full: time.getFullYear() + '-' + (time.getMonth() + 1) + '-' + time.getDate()
                },
                time:{
                    hours: time.getHours(),
                    minute: time.getMinutes(),
                    second: time.getSeconds(),
                    full: '' //time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds()
                }
            };

        timeData.time.full += (time.getHours() < 10 ? '0' + time.getHours() : time.getHours()) + ':'
        timeData.time.full += (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes()) + ':'
        timeData.time.full += time.getSeconds() < 10 ? '0' + time.getSeconds() : time.getSeconds()

        return timeData;
    },

    forceBroadcastTimeSync: function(condition){
        if( GMARKET.UI.COMMON.UTIL.getUa().os.name === condition ){
            location.reload();
        }
    }
};
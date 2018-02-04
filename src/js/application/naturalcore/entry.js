(function(){
    /**
     * 라우터
     * @Object app [어플리케이션 네임스페이스 객체]
     */
    var router = function(app){
        if(!app.UI.MODEL_AND_VIEW.CURRENT_PAGE){
            console.error('No matching pages found.');
            return;
        }

        app.UI.APP = app.UI.APP || {};
        app.UI.APP.HOMESHOPPING = {
            COMMON: {},
            PAGE: {},
            CURRENT_PAGE: app.UI.MODEL_AND_VIEW.CURRENT_PAGE
        };

        // 홈쇼핑 공통
        app.UI.APP.HOMESHOPPING.COMMON = new HomeshoppingCommon({
            Util: GMARKET.UI.COMMON.UTIL,
            VideoLayer: GMARKET.UI.APP.COMMON.COMPONENT.VideoLayer
        });

        switch(app.UI.APP.HOMESHOPPING.CURRENT_PAGE){
            case '/homeTab' :
                // 홈탭
                app.UI.APP.HOMESHOPPING.PAGE.homeTab = new HomeTab({
                    Common: app.UI.APP.HOMESHOPPING.COMMON,
                    LiveScheduleTimer: LiveScheduleTimer
                });
                break;

            case '/corner/best' :
                // 코너 - 베스트
                app.UI.APP.HOMESHOPPING.PAGE.best = new Best({
                    CornerCommon: new CornerCommon({
                        Common: app.UI.APP.HOMESHOPPING.COMMON,
                        CornerCommon: new CornerCommon()
                    })
                });
                break;

            case '/corner/broadcastSchedule' :
                // 코너 - 편성표
                app.UI.APP.HOMESHOPPING.PAGE.broadcastSchedule = new BroadcastSchedule({
                    Common: app.UI.APP.HOMESHOPPING.COMMON,
                    CornerCommon: new CornerCommon(),
                    LiveScheduleTimer: LiveScheduleTimer
                });
                break;

            case '/benefitInformation' :
                // 홈쇼핑 혜택 안내
                app.UI.APP.HOMESHOPPING.PAGE.BenefitInformation = new BenefitInformation({
                    Common: app.UI.APP.HOMESHOPPING.COMMON
                });
                break;
        }
    };

    router(GMARKET);
})();
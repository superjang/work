GMARKET.UI.COMMON = {
    UTIL: (function () {
        var config = {},
            util = {
                $dom: {
                    win: $(window),
                    body: $('body'),
                    header: $('#simple_header')
                },
                cachedWindowOffsetTop: 0,
                prevScrollTop: $(window).scrollTop(),
                currentScrollTop: $(window).scrollTop(),

                fixedViewPort: function (fixedView) {
                    if (fixedView) {
                        this.cachedWindowOffsetTop = this.$dom.win.scrollTop();

                        $('body').css({
                            'position': 'fixed',
                            'top': this.cachedWindowOffsetTop * -1,
                            'left': '0',
                            'right': '0'
                        });
                    } else {
                        $('body').css({
                            'position': 'static'
                        });

                        this.$dom.win.scrollTop(this.cachedWindowOffsetTop);
                    }
                },

                /**
                 * 템플릿 랜더링 메소드
                 * @param {object} 파리미터 객체
                 * 파라미터 객체 키
                 * @param {boolean} isClear[options] appendTarget을 비우고 새로 그릴지 여부
                 * @param {string} templateId[require] 템플릿 식별자
                 * @param {string} appendTarget[require] jquery 객체로 랩핑될 css 선택자 ex) '#filter-wrap', '.filter-list', 'span'
                 * @param {string} appendTarget[option] prepend, append로 붙일 곳 위치 선택 default = append
                 * @param {object} renderData[options] 템플릿 랜더링에 필요한 json타입 객체
                 * @param {function} callBack[options] 콜백
                 */
                renderTemplate: function (option) {
                    var renderData = option.renderData || {},
                        templateFragment = $.tmpl(option.templateId, renderData),
                        isClear = option.isClear || false,
                        useFragment = option.useFragment || false,
                        appendType = option.appendType || 'append';

                    if( useFragment ){
                        return templateFragment;
                    }

                    isClear ? $(option.appendTarget).empty() : null;

                    switch ( appendType ) {
                        case 'prepend':
                            $(option.appendTarget).prepend(templateFragment);
                            break;
                        case 'append' :
                            $(option.appendTarget).append(templateFragment);
                            break;
                        case 'after' :
                            $(option.appendTarget).after(templateFragment);
                            break;
                        case 'before' :
                            $(option.appendTarget).before(templateFragment);
                            break;
                    }

                    option.callBack ? option.callBack() : null;
                },

                numberWithCommas: function (number) {
                    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                },

                getScrollDirection: function () {
                    var scrollInfo = {};

                    this.currentScrollTop = $(window).scrollTop();

                    if (this.currentScrollTop > this.prevScrollTop) {
                        this.currentDirection = 'down';
                    } else if (this.currentScrollTop < this.prevScrollTop) {
                        this.currentDirection = 'up';
                    }

                    scrollInfo.direction = this.currentDirection;
                    scrollInfo.currentTop = this.currentScrollTop;
                    scrollInfo.prevTop = this.prevScrollTop;
                    this.prevScrollTop = this.currentScrollTop;

                    return scrollInfo;
                },

                getQueryParam: function(queryKeyword){
                    var searchKeyword = queryKeyword.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]'),
                        queryParam = '[\\?&]' + searchKeyword + '=([^&#]*)',
                        regParam = new RegExp( queryParam ),
                        searchValue = regParam.exec( location.href );

                    return searchValue !== null ? searchValue[1] : null;
                },

                getUa: function(){
                    var userAgent = new UAParser(navigator.userAgent),
                        uaParserData = userAgent.getResult();

                    return uaParserData;
                },

                getUaFromClassName: function(){
                    var elBody = document.getElementsByTagName('body'),
                        classList = elBody[0].getAttribute('class'),
                        viewSelectorList = classList.split(' '),
                        split = '--',
                        platform = 'platform',
                        os = 'os',
                        uaData = { os: '', platform: '' };

                    for( var i=0, len=viewSelectorList.length; i<len; i++ ){
                        if( viewSelectorList[i].indexOf(os + split) !== -1 ){
                            uaData.os = viewSelectorList[i].split(split)[1]
                        }

                        if( viewSelectorList[i].indexOf(platform + split) !== -1 ){
                            uaData.platform = viewSelectorList[i].split(split)[1]
                        }
                    }

                    return uaData;
                },

                // TODO:: 범용적으로 사용할 수 있도록 리팩토링 필요
                printLog: function(data){
                    var message = JSON.stringify(data);
                    var logTemplate = '<div class="_customLog" style="position:fixed;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);z-index:9999;color:#fff;padding:10px">' + message + '</div>';
                    $('body').find('._customLog').remove();
                    $('body').prepend(logTemplate);
                }
            };

        return util;
    })()
};
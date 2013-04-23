/*
* jQuery.zyngaScroller for Meteor, v. 0.0.1
* Created by Tim Heckel, 2012 
* Licensed under the MIT.
*/

(function ($) {

    var locals = {
        resizeScrollingCanvas: function(_self) {
            var opts = _self.data("zyngaScroller").options;

            if (opts.scrollingX) {
                var _innerWidth = (opts.totalPages) * $(opts.es.container).width();
                if (_innerWidth < $(window).width()) {
                    _innerWidth = $(window).width();
                }
                //console.log("setting inner width " + _innerWidth);

                _self.css({ width: _innerWidth + "px" });
            }
            if (opts.scrollingY) {
                var _innerHeight = (opts.totalPages) * ($(opts.es.container).height() + _self.height());
                 console.log("setting inner height " + _innerHeight);
                _self.css({ height: _innerHeight + "px" });
            }

            opts.es.reflow();
        }
        , resizeAndPositionContents: function(_self) {
            if (_self.data("zyngaScroller")) {

                var opts = _self.data("zyngaScroller").options, _left = 0
                    , _transform = $(opts.es.content).css("transform");

                if (_transform.split(' ').length > 3) {
                    var _getTransform = _transform.split(' ')[4];
                    _left = _getTransform ? parseInt(_getTransform.replace(',', '')) * -1 : 0;
                }

                opts.containers.contents.scrollerChild.css({ left: _left + "px" });
                opts.containers.contents.scrollerParent.css({ height: opts.containers.contents.scrollerChild.height() + "px" });
            }
        }
        , resizer: null
    };

    var methods = {
        init: function (options) {
            options = options || {};

            return this.each(function () {
                var _self = $(this);
                if (!_self.data('zyngaScroller')) {
                    //window.setTimeout(function() {
                        //set up kinetic scrolling
                        options.es = new EasyScroller(this, {
                            scrollingX: options.scrollingX !== undefined ? options.scrollingX : true
                            , scrollingY: options.scrollingY !== undefined ? options.scrollingY : true
                            , paging: options.paging
                            , totalRecords: 0
                            , snapping: options.snapping || { enabled: false }
                            , enabled: true
                            , callbacks: {
                                onStart: function () {
                                    //onStart
                                    options.onStart && options.onStart();
                                }
                                , onMove: function () {
                                    //onMove
                                }
                                , onEnd: function () {
                                    //onEnd
                                    options.onEnd && options.onEnd();
                                }
                                , onZoom: function () {
                                    //onZoom
                                }
                                , onPaging: function(page) {
                                    //onPaging
                                    options.onPaging && options.onPaging(page);
                                }
                                , onPagingComplete: function(page) {
                                    options.currentPage = page;
                                    options.onPagingComplete && options.onPagingComplete(page);
                                }
                                , onWindowResized: function() {
                                    //window.clearTimeout(locals.resizer);
                                    //locals.resizer = window.setTimeout(function() {

                                        //set appropriate size of scroller
                                        locals.resizeScrollingCanvas(_self);

                                        //resize viewport on init -- give a delay
                                        //so the above reflow call (in the resizeSCrollingCanvas)
                                        //finishes its animation
                                        setTimeout(function() {
                                            locals.resizeAndPositionContents(_self);

                                            //callback
                                            options.onWindowResized && options.onWindowResized();
                                        }, 250);

                                    //}, 250);
                                }
                            }
                        });

                        var ff = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                        var ie = navigator.userAgent.toLowerCase().indexOf('msie') > -1;

                        //set up cursor
                        var cursCoords = ie ? "" : " 4 4";
                        var dragCursor = ff ? "-moz-grab" : "url('/packages/datascroll/lib/images/openhand.cur')" + cursCoords + ", move";
                        _self.css({ cursor: dragCursor });
                        _self.mousedown(function (e) {
                            dragCursor = ff ? "-moz-grabbing" : "url('/packages/datascroll/lib/images/closedhand.cur')" + cursCoords + ", move";
                            _self.css({ cursor: dragCursor });
                        });
                        _self.mouseup(function (e) {
                            dragCursor = ff ? "-moz-grab" : "url('/packages/datascroll/lib/images/openhand.cur')" + cursCoords + ", move";
                            _self.css({ cursor: dragCursor });
                        });

                        //set options into data
                        _self.data({ zyngaScroller: { options: options || {} } });

                        //resize viewport on init
                        locals.resizeAndPositionContents(_self);

                        //set appropriate size of scroller
                        locals.resizeScrollingCanvas(_self);

                    //}.bind(this), 100);
                }
            });
        },
        scroller: function () {
            return $(this).data("zyngaScroller").options.es.scroller;
        },
        enableScroll: function () {
            return this.each(function () {
                var _self = $(this);
                if (_self.data("zyngaScroller")) {
                   _self.data("zyngaScroller").options.es.options.enabled = true;
                }
            });
        },
        disableScroll: function () {
            return this.each(function () {
                var _self = $(this);
                if (_self.data("zyngaScroller")) {
                   _self.data("zyngaScroller").options.es.options.enabled = false;
                }
            });
        },
        destroy: function () {
            return this.each(function () {
                var _self = $(this);
                _self.removeData("zyngaScroller");
            });
        },
        repaginate: function(rpp) {
            return this.each(function () {
                $(this).data("zyngaScroller").options.totalPages = rpp;
                locals.resizeScrollingCanvas($(this));
            });
        },
        resize: function() {
            return this.each(function () {
                locals.resizeAndPositionContents($(this));
            });
        }
    };


    $.fn.zyngaScroller = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.zyngaScroller');
        }
    };

})(jQuery);
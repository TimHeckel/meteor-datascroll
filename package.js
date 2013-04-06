Package.describe({
    summary: "Meteor kinetic canvas for dynamic data pagination"
});

Package.on_use(function (api) {
    api.use('jquery', 'client');
    api.use('underscore', 'client');
    api.add_files([
          'lib/client/meteor.dataScroll.js'
        , 'lib/client/scroller/jquery.zyngaScroller.js'
        , 'lib/client/scroller/base/raf.js'
        , 'lib/client/scroller/base/Animate.js'
        , 'lib/client/scroller/base/Scroller.js'
        , 'lib/client/scroller/base/EasyScroller.js'
        , 'lib/images/closedhand.cur'
        , 'lib/images/openhand.cur'
    ], 'client');
});
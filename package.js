Package.describe({
    summary: "Meteor kinetic canvas for dynamic data pagination"
});

Package.on_use(function (api) {
    api.use(['jquery', 'underscore', 'templating'], 'client');
    api.add_files([
         'lib/client/meteor.dataScroll.js'
        , 'lib/client/scroller/jquery.zyngaScroller.js'
        , 'lib/client/scroller/base/raf.js'
        , 'lib/client/scroller/base/Animate.js'
        , 'lib/client/scroller/base/Scroller.js'
        , 'lib/client/scroller/base/EasyScroller.js'
        , 'lib/client/datascrollTemplates.html'
        , 'lib/client/css/datascroll.css'
        , 'lib/images/bg_scroller.png'
        , 'lib/images/closedhand.cur'
        , 'lib/images/openhand.cur'
    ], 'client');
});
Meteor.DataScroll = function(_opts) {
	var _self = this, _sessionMultiplePages = '__hasMultiplePages__', _sessionButtons = "__sessionButtons__", _sessionRPP = "resultsPerPage"

	var opts = {
		templates: {
	          pager: "pagination_buttons"
	        , rpp: "select_per_page"
	        , content: null
		}
		, pagination: {
			currentPage: 0
			, resultsPerPage: 5
			, totalRecords: 0
			, totalPages: 0
			, scrollMode: 'horizontal' //vertical
		}
		, callbacks: {
			onPagingCompleted: null
			, getDependentSubscriptionsHandles: null
			, getTotalRecords: null
			, onTemplateRendered: null
			, onTemplateCreated: null
			, onTemplateDestroyed: null
			, onResultsPerPageChanged: null
		}
		, elements: {
			scroller: null //"#oneClickScroller"
			, scrollerParent: null //"#oneClickTableParent"
			, scrollerChild: null //"#oneClickTable"
			, loader: ".scroller-loading"
		}
		, isActive: false
	};

	var _tops = opts.templates, _eles = opts.elements;
	_.extend(opts, _opts);

	//reset missing defaults if overwritten with nulls
	if (!opts.templates.pager) opts.templates.pager = _tops.pager;
	if (!opts.templates.rpp) opts.templates.rpp = _tops.rpp;
	if (!opts.elements.loader) opts.elements.loader = _eles.loader;

	var _setPaging = function(ele) {
		var _move = false, _scheduledPage = opts.pagination.currentPage, ele = ele || $(".pageButton[data-page='" + opts.pagination.currentPage + "']");
		$(".pageButton").each(function() { $(this).parent().removeClass("active").removeClass("disabled"); });
		switch (ele.attr("data-page")) {
			case "next":
				_scheduledPage++;
				break;
			case "back":
				_scheduledPage--;
				break;
			default:
				_scheduledPage = parseInt(ele.attr("data-page")) || 0; //zero if pagination is missing
				break;
		}

		if (opts.pagination.currentPage !== _scheduledPage) {
			_move = true;
		}

		if (_scheduledPage === (opts.pagination.totalPages - 1)) {
			$(".pageButton[data-page='next']").parent().addClass("disabled");
		} else if (_scheduledPage === 0) {
			$(".pageButton[data-page='back']").parent().addClass("disabled");
		}
		$(".pageButton[data-page='" + _scheduledPage + "']").parent().addClass("active");

		if (_move) {
			opts.elements.loader && $(opts.elements.loader).show();
			$(opts.elements.scroller).zyngaScroller("scroller").doPaging(_scheduledPage);
		}
	};

	var _setPagination = function() {
		opts.pagination.totalPages = Math.ceil(opts.pagination.totalRecords/opts.pagination.resultsPerPage), _btns = [];
    	for(p = 1; p < opts.pagination.totalPages; p++) {
    		_btns.push({r: p, p: p + 1});
    	}
    	Session.set(_sessionMultiplePages, opts.pagination.totalPages);
    	Session.set(_sessionButtons, _btns);
	};

	var _resizer;
	var _init = function() {
		opts.callbacks.getTotalRecords(function(tot) {
			opts.pagination.totalRecords = tot;
			_setPagination();

	    	var _scrollX = true, _scrollY = false;
	    	if (opts.scrollMode === "vertical") {
	    		_scrollX = false; _scrollY = true;
    		}

			$(opts.elements.scroller).zyngaScroller({
		        paging: true
		        , scrollingY: _scrollY
		        , scrollingX: _scrollX
		        , totalPages: opts.pagination.totalPages
		        , containers: {
		        	contents: { scrollerChild: $(opts.elements.scrollerChild), scrollerParent: $(opts.elements.scrollerParent) }
	        	}
		        , onStart: function() {
					opts.elements.loader && $(opts.elements.loader).hide();
		        }
		        , onEnd: function() {

		        }
		        , onPaging: function(page) {
		        	opts.isActive && opts.elements.loader && $(opts.elements.loader).show();
		        }
		        , onPagingComplete: function(page) {
		        	if (opts.isActive) {
			        	$(opts.elements.loader).hide();
			        	if (page !== opts.pagination.currentPage) {
			        		opts.pagination.currentPage = page;
			        		_setPaging();
			        		var skip = page * opts.pagination.resultsPerPage, limit = opts.pagination.resultsPerPage;
			        		opts.callbacks.onPagingCompleted && opts.callbacks.onPagingCompleted(skip, limit);
		        		}
		        	}
		        }
		        , onWindowResized: function() {
		        	//window.clearTimeout(_resizer);
		        	//_resizer = window.setTimeout(function() {
	        		//	console.log("going to " + opts.pagination.currentPage);
					if (opts.isActive) $(opts.elements.scroller).zyngaScroller("scroller").doPaging(opts.pagination.currentPage);
		        	//	//$(opts.elements.scroller).zyngaScroller("resize");
		        	//}, 250);
		        }
		    });

			_self.enableScroll();
			opts.callbacks.onPagingCompleted && opts.callbacks.onPagingCompleted(0, opts.pagination.resultsPerPage);
		});
	};

	_self.disableScroll = function() {
		$(opts.elements.scroller).zyngaScroller("disableScroll");
	};

	_self.enableScroll = function() {
		$(opts.elements.scroller).zyngaScroller("enableScroll");
	};

	_self.refreshPagination = function(rpp) {
		opts.pagination.currentPage = 0;
		if (rpp) opts.pagination.resultsPerPage = rpp;
		opts.callbacks.getTotalRecords(function(tot) {
			opts.pagination.totalRecords = tot;
			_setPagination();
			$(opts.elements.scroller).zyngaScroller("repaginate", opts.pagination.totalPages);
			if (opts.pagination.currentPage > 0) {
				$(opts.elements.scroller).zyngaScroller("scroller").doPaging(opts.pagination.currentPage);
			} else {
				opts.callbacks.onPagingCompleted && opts.callbacks.onPagingCompleted(0, opts.pagination.resultsPerPage);
			}
		});
	};

	if (Template[opts.templates.rpp]) {
		Template[opts.templates.rpp].events({
			"change select": function(e, template) {
				if (opts.isActive) {
					var _rpp = parseInt($(e.target).val());
					console.log("refrshing with " + _rpp);
					opts.callbacks.onResultsPerPageChanged && opts.callbacks.onResultsPerPageChanged(_rpp);
					_self.refreshPagination(_rpp);
				}
			}
		});

		Template[opts.templates.rpp].rendered = function() {
			opts.isActive && $(this.find("select")).val(opts.pagination.resultsPerPage);
		}
	}

	Template[opts.templates.content].created = function() {
		opts.isActive = true;
    	var _autorun = window.setInterval(function() {
			var _dependentSubscriptions = opts.callbacks.getDependentSubscriptionsHandles();
    		var _allReady = _.every(_dependentSubscriptions, function(s) { return s.ready(); });
	    	if (_allReady) {
    			window.clearInterval(_autorun);
				opts.callbacks.onTemplateCreated && opts.callbacks.onTemplateCreated();
	    		_init();
	    	}
	    }, 250);
	};

	Template[opts.templates.content].destroyed = function() {
		opts.isActive = false;
		_self.disableScroll();
		opts.callbacks.onTemplateDestroyed && opts.callbacks.onTemplateDestroyed();
	};

	var _doneRendering;
	Template[opts.templates.content].rendered = function() {
		window.clearTimeout(_doneRendering);
		opts.callbacks.onTemplateRendered && opts.callbacks.onTemplateRendered();
		_doneRendering = window.setTimeout(function() {
			$(opts.elements.scroller).zyngaScroller && $(opts.elements.scroller).zyngaScroller("resize");
		}, 200);
	};

	Template[opts.templates.pager].events({
		"click .pageButton": function(e, template) {
			if (opts.isActive && !$(e.target).parent().hasClass("disabled") && !$(e.target).parent().hasClass("active")) {
				_setPaging($(e.target));
			}
		}
	});

	Template[opts.templates.pager].hasMultiplePages = function() {
		return Session.get(_sessionMultiplePages) > 1;
	};

	Template[opts.templates.pager].pageButton = function() {
		return Session.get(_sessionButtons);
	};

};
(function($m) {

	var _dataScroll = function(_opts) {
		
		var opts = {
			templates: {
				content: null
				, pager: null
			}
			, serverMethods: {
				getTotal: ''
			}
			, pagination: {
				sessionName: "paginationOptions"
				, currentPage: 0
				, resultsPerPage: 4
				, totalRecords: 0
				, totalPages: 0
			}
			, callbacks: {
				onPagingCompleted: null
				, getDependentSubscriptionsHandles: null
			}
			, elements: {
				scroller: '' //"#oneClickScroller"
				, scrollerParent: '' //"#oneClickTableParent"
				, scrollerChild: '' //"#oneClickTable"
				, loader: '' //"#loadingPage"
			}
		};

		_.extend(opts, _opts);

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
					_scheduledPage = parseInt(ele.attr("data-page"));
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
				$(opts.elements.loader).show();
				$(opts.elements.scroller).zyngaScroller("scroller").doPaging(_scheduledPage);
			}
		};

		var _init = function() {
		    $(opts.elements.scroller).zyngaScroller({
		        paging: true
		        , scrollingY: false
		        , scrollingX: true
		        , totalPages: opts.pagination.totalPages
		        , containers: {
		        	contents: { scrollerChild: $(opts.elements.scrollerChild), scrollerParent: $(opts.elements.scrollerParent) }
	        	}
		        , onStart: function() {
					$(opts.elements.loader).hide();
		        }
		        , onEnd: function() {

		        }
		        , onPaging: function(page) {
		        	$(opts.elements.loader).show();
		        }
		        , onPagingComplete: function(page) {
		        	$(opts.elements.loader).hide();
		        	if (page !== opts.pagination.currentPage) {
		        		opts.pagination.currentPage = page;
		        		_setPaging();
		        		var skip = page * opts.pagination.resultsPerPage, limit = opts.pagination.resultsPerPage;
		        		opts.callbacks.onPagingCompleted && opts.callbacks.onPagingCompleted(skip, limit);
	        		}
		        }
		        , onWindowResized: function() {
		        	//window.clearTimeout(_resizer);
		        	//_resizer = window.setTimeout(function() {
	        		//console.log("going to " + _currentPage);
					$(opts.elements.scroller).zyngaScroller("scroller").doPaging(opts.pagination.currentPage);
		        	$(opts.elements.scroller).zyngaScroller("resize");
		        	//}, 250);
		        }
		    });

			opts.callbacks.onPagingCompleted && opts.callbacks.onPagingCompleted(0, opts.pagination.resultsPerPage);
		};

		Template[opts.templates.content].created = function() {
		    Meteor.call(opts.serverMethods.getTotal, function(error, results) {
		    	opts.pagination.totalRecords = results;
		    	opts.pagination.totalPages = Math.ceil(opts.pagination.totalRecords/opts.pagination.resultsPerPage), _btns = [];
		    	for(p = 1; p < opts.pagination.totalPages; p++) {
		    		_btns.push({r: p, p: p + 1});
		    	}
		    	Session.set(opts.pagination.sessionName, _btns);

		    	var _dependentSubscriptions = opts.callbacks.getDependentSubscriptionsHandles();
		    	var _autorun = window.setInterval(function() {
			    	if (_.all(_.invoke(_dependentSubscriptions, 'ready'))) {
		    			window.clearInterval(_autorun);
			    		_init();
			    	}
			    }, 250);
		    });
		};

		var _doneRendering;
		Template[opts.templates.content].rendered = function() {
			window.clearTimeout(_doneRendering);
			_doneRendering = window.setTimeout(function() {
				$(opts.elements.scroller).zyngaScroller && $(opts.elements.scroller).zyngaScroller("resize");
			}, 200);
		};

		Template[opts.templates.pager].events({
			"click .pageButton": function(e, template) {
				if (!$(e.target).parent().hasClass("disabled")) {
					_setPaging($(e.target));
				}
			}
		});

		Template[opts.templates.pager].pageButton = function() {
			return Session.get(opts.pagination.sessionName);
		};

	};

	$m.DataScroll = _dataScroll;

})(Meteor);
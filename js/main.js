$(window).on('load', function(){
	var $document = $(document);
	var $left = $('#left');
	var $right = $('#right');
	var $rightInner = $('#rightInner');
	var $splitter = $('#splitter');
	var $groups = $('#groups');
	var $content = $('#content');

	// Menu

	// Hide deep packages and namespaces
	$('ul span', $groups).click(function(event) {
		event.preventDefault();
		event.stopPropagation();
		$(this)
			.toggleClass('collapsed')
			.parent()
				.next('ul')
					.toggleClass('collapsed');
	}).click();

	$active = $('ul li.active', $groups);
	if ($active.length > 0) {
		// Open active
		$('> a > span', $active).click();
	} else {
		$main = $('> ul > li.main', $groups);
		if ($main.length > 0) {
			// Open first level of the main project
			$('> a > span', $main).click();
		} else {
			// Open first level of all
			$('> ul > li > a > span', $groups).click();
		}
	}

	// Splitter
	var splitterWidth = $splitter.width();
	var splitterPosition = Cookies.get('splitter') ? parseInt(Cookies.get('splitter')) : null;
	var splitterPositionBackup = Cookies.get('splitterBackup') ? parseInt(Cookies.get('splitterBackup')) : null;
	function setSplitterPosition(position)
	{
		splitterPosition = position;

		$left.width(position);
		$right.css('margin-left', position + splitterWidth);
		$splitter.css('left', position);
	}
	function setContentWidth()
	{
		var width = $rightInner.width();
		$rightInner
			.toggleClass('medium', width <= 960)
			.toggleClass('small', width <= 650);
	}
	$splitter.mousedown(function() {
			$splitter.addClass('active');

			$document.mousemove(function(event) {
				if (event.pageX >= 230 && $document.width() - event.pageX >= 600 + splitterWidth) {
					setSplitterPosition(event.pageX);
					setContentWidth();
				}
			});

			$()
				.add($splitter)
				.add($document)
					.mouseup(function() {
						$splitter
							.removeClass('active')
							.unbind('mouseup');
						$document
							.unbind('mousemove')
							.unbind('mouseup');

						Cookies.set('splitter', splitterPosition, {expires: 365});
					});

			return false;
		});
	$splitter.dblclick(function() {
		if (splitterPosition) {
			splitterPositionBackup = $left.width();
			setSplitterPosition(0);
		} else {
			setSplitterPosition(splitterPositionBackup);
			splitterPositionBackup = null;
		}

		setContentWidth();

		Cookies.set('splitter', splitterPosition, {expires: 365});
		Cookies.set('splitterBackup', splitterPositionBackup, {expires: 365});
	});
	if (null !== splitterPosition) {
		setSplitterPosition(splitterPosition);
	}
	setContentWidth();
	$(window).resize(setContentWidth);

	// Select selected lines
	var matches = window.location.hash.substr(1).match(/^\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*$/);
	if (null !== matches) {
		var lists = matches[0].split(',');
		for (var i = 0; i < lists.length; i++) {
			var lines = lists[i].split('-');
			lines[0] = parseInt(lines[0]);
			lines[1] = parseInt(lines[1] || lines[0]);
			for (var j = lines[0]; j <= lines[1]; j++) {
				$('#' + j).addClass('selected');
			}
		}

		var $firstLine = $('#' + parseInt(matches[0]));
		if ($firstLine.length > 0) {
			$document.scrollTop($firstLine.offset().top);
		}
	}

	// Save selected lines
	var lastLine;
	$('.l a').click(function(event) {
		event.preventDefault();

		var selectedLine = $(this).parent().index() + 1;
		var $selectedLine = $('pre.code .l').eq(selectedLine - 1);

		if (event.shiftKey) {
			if (lastLine) {
				for (var i = Math.min(selectedLine, lastLine); i <= Math.max(selectedLine, lastLine); i++) {
					$('#' + i).addClass('selected');
				}
			} else {
				$selectedLine.addClass('selected');
			}
		} else if (event.ctrlKey) {
			$selectedLine.toggleClass('selected');
		} else {
			var $selected = $('.l.selected')
				.not($selectedLine)
				.removeClass('selected');
			if ($selected.length > 0) {
				$selectedLine.addClass('selected');
			} else {
				$selectedLine.toggleClass('selected');
			}
		}

		lastLine = $selectedLine.hasClass('selected') ? selectedLine : null;

		// Update hash
		var lines = $('.l.selected')
			.map(function() {
				return parseInt($(this).attr('id'));
			})
			.get()
			.sort(function(a, b) {
				return a - b;
			});

		var hash = [];
		var list = [];
		for (var j = 0; j < lines.length; j++) {
			if (0 === j && j + 1 === lines.length) {
				hash.push(lines[j]);
			} else if (0 === j) {
				list[0] = lines[j];
			} else if (lines[j - 1] + 1 !== lines[j] && j + 1 === lines.length) {
				hash.push(list.join('-'));
				hash.push(lines[j]);
			} else if (lines[j - 1] + 1 !== lines[j]) {
				hash.push(list.join('-'));
				list = [lines[j]];
			} else if (j + 1 === lines.length) {
				list[1] = lines[j];
				hash.push(list.join('-'));
			} else {
				list[1] = lines[j];
			}
		}

		hash = hash.join(',');
		$backup = $('#' + hash).removeAttr('id');
		window.location.hash = hash;
		$backup.attr('id', hash);
	});
});

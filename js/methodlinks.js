/* Workaround for @see tags not resoving correctly to local member names anchors
 * I'm sorry for this
 */
$(window).on('load', function(){
	document.querySelectorAll("article :not(a) >abbr").forEach(p => {
		// class methods
		var methodAnchor = 'method_' + p.innerText.replace(/\(\)/g, '');
		if(document.querySelector('a[name="' + methodAnchor + '"]') !== null)
		{
			var a = document.createElement('a');
			a.href = window.location + '#' + methodAnchor;
			a.innerText = p.innerText;
			p.replaceWith(a);
		}
		// inherited methods
		var extAnchor = document.querySelector('a[href$="' + methodAnchor + '"]');
		if(extAnchor !== null)
		{
			var a = document.createElement('a');
			a.href = extAnchor.href;
			a.innerText = p.innerText;
			p.replaceWith(a);
		}
	});
});
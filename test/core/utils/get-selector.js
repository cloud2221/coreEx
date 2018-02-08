function createContentGetSelector() {
	'use strict';
	var group = document.createElement('div');
	group.innerHTML = '<label id="mylabel">Label</label><input id="myinput" aria-labelledby="mylabel" type="text" />';
	return group;
}

function makeShadowTreeGetSelector(node) {
	'use strict';
	var root = node.attachShadow({mode: 'open'});
	var div = document.createElement('div');
	div.className = 'parent';
	root.appendChild(div);
	div.appendChild(createContentGetSelector());
}

describe('axe.utils.getSelector', function () {
	'use strict';

	var fixture = document.getElementById('fixture');
	var shadowSupported = axe.testUtils.shadowSupport.v1;

	afterEach(function () {
		fixture.innerHTML = '';
		axe._tree = undefined;
		axe._selectorData = undefined;
	});

	it('should be a function', function () {
		assert.isFunction(axe.utils.getSelector);
	});

	it('should generate a unique CSS selector', function () {
		var node = document.createElement('div');
		fixture.appendChild(node);
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);

		var sel = axe.utils.getSelector(node);

		assert.equal(sel, '#fixture > div');

		var result = document.querySelectorAll(sel);
		assert.lengthOf(result, 1);
		assert.equal(result[0], node);
	});

	it('should still work if an element has nothing but whitespace as a className', function () {
		var node = document.createElement('div');
		node.className = '    ';
		fixture.appendChild(node);
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);

		var sel = axe.utils.getSelector(node);

		assert.equal(sel, '#fixture > div');

		var result = document.querySelectorAll(sel);
		assert.lengthOf(result, 1);
		assert.equal(result[0], node);
	});

	it('should handle special characters', function () {
		var node = document.createElement('div');
		node.id = 'monkeys#are.animals\\ok';
		fixture.appendChild(node);
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);

		var result = document.querySelectorAll(axe.utils.getSelector(node));
		assert.lengthOf(result, 1);
		assert.equal(result[0], node);
	});

	it('should handle special characters in className', function () {
		var node = document.createElement('div');
		node.className = '.  bb-required';
		fixture.appendChild(node);
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);

		var result = document.querySelectorAll(axe.utils.getSelector(node));
		assert.lengthOf(result, 1);
		assert.equal(result[0], node);
	});

	it('should be able to fall back to positional selectors', function () {
		var node, expected;
		for (var i = 0; i < 10; i++) {
			node = document.createElement('div');
			fixture.appendChild(node);
			if (i === 5) {
				expected = node;
			}
		}
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);

		var result = document.querySelectorAll(axe.utils.getSelector(expected));
		assert.lengthOf(result, 1);
		assert.equal(result[0], expected);
	});

	it('should stop on unique ID', function () {
		var node = document.createElement('div');
		node.id = 'monkeys';
		fixture.appendChild(node);
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);

		var sel = axe.utils.getSelector(node);

		assert.equal(sel, '#monkeys');

		var result = document.querySelectorAll(sel);
		assert.lengthOf(result, 1);
		assert.equal(result[0], node);

	});

	it('should use classes if available and unique', function () {
		var node = document.createElement('div');
		node.className = 'monkeys simian';
		fixture.appendChild(node);

		node = document.createElement('div');
		node.className = 'dogs cats';
		fixture.appendChild(node);
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);

		var sel = axe.utils.getSelector(node);

		assert.equal(sel, '#fixture > div.cats');

		var result = document.querySelectorAll(sel);
		assert.lengthOf(result, 1);
		assert.equal(result[0], node);

	});

	it('should default to tagName and position if classes are not unique', function () {
		fixture.innerHTML = '<div class="simian"></div><div class="simian"></div><div class="simian"></div>' +
			'<div class="simian"></div><div class="simian"></div><div class="simian"></div>' +
			'<div class="simian"></div><div class="simian"></div><div class="simian"></div>' +
			'<div class="simian"></div><div class="simian"></div><div class="simian"></div>' +
			'<div class="simian"></div><div class="simian"></div><div class="simian"></div>';
		var node = document.createElement('div');
		node.className = 'simian';
		fixture.appendChild(node);

		node = document.createElement('div');
		node.className = 'simian';
		fixture.appendChild(node);
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);

		var sel = axe.utils.getSelector(node);

		assert.equal(sel, '#fixture > div.simian:nth-of-type(17)');

		var result = document.querySelectorAll(sel);
		assert.lengthOf(result, 1);
		assert.equal(result[0], node);

	});

	it('should work on the documentElement', function () {
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);
		var sel = axe.utils.getSelector(document.documentElement);
		var result = document.querySelectorAll(sel);
		assert.lengthOf(result, 1);
		assert.equal(result[0], document.documentElement);
	});

	it('should work on the documentElement with classes', function () {
		var orig = document.documentElement.className;
		document.documentElement.className = 'stuff and other things';
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);

		var sel = axe.utils.getSelector(document.documentElement);
		var result = document.querySelectorAll(sel);
		assert.lengthOf(result, 1);
		assert.equal(result[0], document.documentElement);
		document.documentElement.className = orig;
	});

	it('should work on the body', function () {
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);
		var sel = axe.utils.getSelector(document.body);
		var result = document.querySelectorAll(sel);
		assert.lengthOf(result, 1);
		assert.equal(result[0], document.body);
	});

	it('should work on namespaced elements', function () {
		fixture.innerHTML = '<hx:include>Hello</hx:include>';
		var node = fixture.firstChild;
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);
		var sel = axe.utils.getSelector(node);
		var result = document.querySelectorAll(sel);
		assert.lengthOf(result, 1);
		assert.equal(result[0], node);
	});

	it('should work on complex namespaced elements', function () {
		fixture.innerHTML = '<m:math xmlns:m="http://www.w3.org/1998/Math/MathML">' +
		  '<m:mi>x</m:mi>' +
		  '<m:annotation-xml encoding="MathML-Content">' +
		    '<m:ci>x</m:ci>' +
		  '</m:annotation-xml>' +
		'</m:math>';
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);
		var node = fixture.querySelector('m\\:ci');
		var sel = axe.utils.getSelector(node);
		var result = document.querySelectorAll(sel);
		assert.lengthOf(result, 1);
		assert.equal(result[0], node);
	});

	it('should use role attributes', function () {
		fixture.innerHTML = '<div></div><div></div><div></div><div></div><div></div>' +
			'<div></div><div></div><div></div><div></div><div></div>' +
			'<div></div><div></div><div></div><div></div><div></div>';
		var node = document.createElement('div');
		node.setAttribute('role', 'menuitem');
		fixture.appendChild(node);
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);

		assert.equal(
			axe.utils.getSelector(node),
			'#fixture > div[role="menuitem"]'
		);
	});

	it('should use href and src attributes', function () {
		fixture.innerHTML = '<a></a><a></a><a></a><a></a><a></a>' +
			'<a></a><a></a><a></a><a></a><a></a>' +
			'<img /><img /><img /><img /><img />' +
			'<img /><img /><img /><img /><img />' +
			'<img /><img /><img /><img /><img />' +
			'<a></a><a></a><a></a><a></a><a></a>';
		var link = document.createElement('a');
		link.setAttribute('href', '//deque.com/about/');
		fixture.appendChild(link);

		var img = document.createElement('img');
		img.setAttribute('src', '//deque.com/logo.png');
		fixture.appendChild(img);
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);

		assert.equal(
			axe.utils.getSelector(link),
			'#fixture > a[href="\\/\\/deque\\.com\\/about\\/"]'
		);
		assert.equal(
			axe.utils.getSelector(img),
			'#fixture > img[src="\\/\\/deque\\.com\\/logo\\.png"]'
		);
	});

	it('should use class before attribute', function () {
		fixture.innerHTML = '<div></div><div></div><div></div><div></div><div></div>' +
			'<div></div><div></div><div></div><div></div><div></div>' +
			'<div></div><div></div><div></div><div></div><div></div>';
		var node = document.createElement('div');
		node.setAttribute('role', 'menuitem');
		fixture.appendChild(node);
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);

		assert.equal(
			axe.utils.getSelector(node),
			'#fixture > div[role="menuitem"]'
		);
		
		axe._selectorData = undefined;
		node.className = 'dqpl-btn-primary';
		assert.equal(
			axe.utils.getSelector(node),
			'#fixture > div.dqpl-btn-primary'
		);
	});

	it('should add [type] to input elements', function () {
		fixture.innerHTML = '<input class="dqpl-textfield" /><input class="dqpl-textfield" />' +
			'<input class="dqpl-textfield" /><input class="dqpl-textfield" /><input class="dqpl-textfield" />' +
			'<input class="dqpl-textfield" /><input class="dqpl-textfield" /><input class="dqpl-textfield" />' +
			'<input class="dqpl-textfield" /><input class="dqpl-textfield" /><input class="dqpl-textfield" />' +
			'<input class="dqpl-textfield" /><input class="dqpl-textfield" /><input class="dqpl-textfield" />';
		var node = document.createElement('input');
		node.type = 'password';
		node.className = 'dqpl-textfield';
		fixture.appendChild(node);
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);
		assert.equal(
			axe.utils.getSelector(node),
			'#fixture > input.dqpl-textfield[type="password"]'
		);
	});

	it('should use the name property', function () {
		fixture.innerHTML = '<input class="dqpl-textfield" /><input class="dqpl-textfield" />' +
			'<input class="dqpl-textfield" /><input class="dqpl-textfield" /><input class="dqpl-textfield" />' +
			'<input class="dqpl-textfield" /><input class="dqpl-textfield" /><input class="dqpl-textfield" />' +
			'<input class="dqpl-textfield" /><input class="dqpl-textfield" /><input class="dqpl-textfield" />' +
			'<input class="dqpl-textfield" /><input class="dqpl-textfield" /><input class="dqpl-textfield" />' +
			'<input class="dqpl-textfield" /><input class="dqpl-textfield" /><input class="dqpl-textfield" />' +
			'<input class="dqpl-textfield" /><input class="dqpl-textfield" /><input class="dqpl-textfield" />' +
			'<input class="dqpl-textfield" /><input class="dqpl-textfield" /><input class="dqpl-textfield" />' +
			'<input class="dqpl-textfield" /><input class="dqpl-textfield" /><input class="dqpl-textfield" />';
		var node = document.createElement('input');
		node.name = 'username';
		node.className = 'dqpl-textfield';
		fixture.appendChild(node);
		axe._tree = axe.utils.getFlattenedTree(document.documentElement);
		assert.equal(
			axe.utils.getSelector(node),
			'#fixture > input.dqpl-textfield[name="username"]'
		);
	});

	it('no options: should work with shadow DOM', function () {
		var shadEl;

		if (shadowSupported) {
			// shadow DOM v1 - note: v0 is compatible with this code, so no need
			// to specifically test this
			fixture.innerHTML = '<div></div>';
			makeShadowTreeGetSelector(fixture.firstChild);
			shadEl = fixture.firstChild.shadowRoot.querySelector('input#myinput');
			axe._tree = axe.utils.getFlattenedTree(document.documentElement);
			assert.deepEqual(axe.utils.getSelector(shadEl), [
				'#fixture > div',
				'#myinput'
			]);
		}
	});
	it('toRoot: should work with shadow DOM', function () {
		var shadEl;

		if (shadowSupported) {
			// shadow DOM v1 - note: v0 is compatible with this code, so no need
			// to specifically test this
			fixture.innerHTML = '<div></div>';
			makeShadowTreeGetSelector(fixture.firstChild);
			shadEl = fixture.firstChild.shadowRoot.querySelector('input#myinput');
			axe._tree = axe.utils.getFlattenedTree(document.documentElement);
			assert.deepEqual(axe.utils.getSelector(shadEl, { toRoot: true }), [
				'html > body > #fixture > div',
				'div:nth-of-type(1) > div > #myinput'
			]);
		}
	});

});

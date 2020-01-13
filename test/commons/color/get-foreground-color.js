/* global sinon */

describe('color.getForegroundColor', function() {
	'use strict';

	var fixture = document.getElementById('fixture');
	var shadowSupported = axe.testUtils.shadowSupport.v1;

	afterEach(function() {
		document.getElementById('fixture').innerHTML = '';
		axe.commons.color.incompleteData.clear();
		document.body.scrollTop = 0;
	});

	it('should return the blended color if it has alpha set', function() {
		fixture.innerHTML =
			'<div style="height: 40px; width: 30px; background-color: #800000;">' +
			'<div id="target" style="height: 20px; width: 15px; color: rgba(0, 0, 128, 0.5);' +
			' background-color: rgba(0, 128, 0, 0.5);">' +
			'This is my text' +
			'</div></div>';
		axe.testUtils.flatTreeSetup(fixture);
		var target = fixture.querySelector('#target');
		var actual = axe.commons.color.getForegroundColor(target);
		var expected = new axe.commons.color.Color(32, 32, 64, 1);
		assert.closeTo(actual.red, expected.red, 0.8);
		assert.closeTo(actual.green, expected.green, 0.8);
		assert.closeTo(actual.blue, expected.blue, 0.8);
		assert.closeTo(actual.alpha, expected.alpha, 0.1);
	});

	it('should return the blended color if it has opacity set', function() {
		fixture.innerHTML =
			'<div style="height: 40px; width: 30px; background-color: #800000;">' +
			'<div id="target" style="height: 20px; width: 15px; color: #000080;' +
			' background-color: green; opacity: 0.5;">' +
			'This is my text' +
			'</div></div>';
		axe.testUtils.flatTreeSetup(fixture);
		var target = fixture.querySelector('#target');
		var actual = axe.commons.color.getForegroundColor(target);
		var expected = new axe.commons.color.Color(32, 32, 64, 1);
		assert.equal(actual.red, expected.red);
		assert.equal(actual.green, expected.green);
		assert.equal(actual.blue, expected.blue);
		assert.equal(actual.alpha, expected.alpha);
	});

	it('should take into account parent opacity tree', function() {
		fixture.innerHTML =
			'<div style="background-color: #fafafa">' +
			'<div style="height: 40px; width: 30px; opacity: 0.6">' +
			'<div id="target" style="height: 20px; width: 15px; color: rgba(0, 0, 0, 0.87);">' +
			'This is my text' +
			'</div></div></div>';
		axe.testUtils.flatTreeSetup(fixture);
		var target = fixture.querySelector('#target');
		var actual = axe.commons.color.getForegroundColor(target);
		var expected = new axe.commons.color.Color(119.5, 119.5, 119.5, 1);
		assert.closeTo(actual.red, expected.red, 0.8);
		assert.closeTo(actual.green, expected.green, 0.8);
		assert.closeTo(actual.blue, expected.blue, 0.8);
		assert.closeTo(actual.alpha, expected.alpha, 0.1);
	});

	it('should take into account entire parent opacity tree', function() {
		fixture.innerHTML =
			'<div style="background-color: #fafafa">' +
			'<div style="height: 40px; width: 30px; opacity: 0.75">' +
			'<div style="height: 40px; width: 30px; opacity: 0.8">' +
			'<div id="target" style="height: 20px; width: 15px; color: rgba(0, 0, 0, 0.87);">' +
			'This is my text' +
			'</div></div></div></div>';
		axe.testUtils.flatTreeSetup(fixture);
		var target = fixture.querySelector('#target');
		var actual = axe.commons.color.getForegroundColor(target);
		var expected = new axe.commons.color.Color(119.5, 119.5, 119.5, 1);
		assert.closeTo(actual.red, expected.red, 0.8);
		assert.closeTo(actual.green, expected.green, 0.8);
		assert.closeTo(actual.blue, expected.blue, 0.8);
		assert.closeTo(actual.alpha, expected.alpha, 0.1);
	});

	it('should return null if containing parent has a background image and is non-opaque', function() {
		fixture.innerHTML =
			'<div style="height: 40px; width: 30px;' +
			'background-color: #800000; background-image: url(image.png);">' +
			'<div id="target" style="height: 20px; width: 15px; color: blue; background-color: green; opacity: 0.5;">' +
			'</div></div>';
		axe.testUtils.flatTreeSetup(fixture);
		var target = fixture.querySelector('#target');
		var actual = axe.commons.color.getForegroundColor(target);
		assert.equal(axe.commons.color.incompleteData.get('fgColor'), 'bgImage');
		assert.isNull(actual);
	});

	it('should return the fgcolor if it is solid', function() {
		fixture.innerHTML =
			'<div style="height: 40px; width: 30px; background-color: red;">' +
			'<div id="target" style="height: 20px; width: 15px; color: #000080; background-color: green;">' +
			'</div></div>';
		axe.testUtils.flatTreeSetup(fixture);
		var target = fixture.querySelector('#target');
		var actual = axe.commons.color.getForegroundColor(target);
		var expected = new axe.commons.color.Color(0, 0, 128, 1);
		assert.equal(actual.red, expected.red);
		assert.equal(actual.green, expected.green);
		assert.equal(actual.blue, expected.blue);
		assert.equal(actual.alpha, expected.alpha);
	});

	it('should not recalculate bgColor if passed in', function() {
		var spy = sinon.spy(axe.commons.color, 'getBackgroundColor');
		var bgColor = new axe.commons.color.Color(255, 255, 255, 1);
		var node = document.createElement('div');
		axe.commons.color.getForegroundColor(node, false, bgColor);
		assert.isFalse(spy.called);
		spy.restore();
	});

	(shadowSupported ? it : xit)(
		'should return the fgcolor from inside of Shadow DOM',
		function() {
			fixture.innerHTML =
				'<div id="container" style="height: 40px; width: 30px; background-color: red;">' +
				'</div>';
			var container = fixture.querySelector('#container');
			var shadow = container.attachShadow({ mode: 'open' });
			shadow.innerHTML =
				'<div id="target" style="height:20px;width:15px;color:#000080;background-color:green;"></div>';

			axe.testUtils.flatTreeSetup(fixture);
			var target = shadow.querySelector('#target');
			var actual = axe.commons.color.getForegroundColor(target);
			var expected = new axe.commons.color.Color(0, 0, 128, 1);

			assert.equal(actual.red, expected.red);
			assert.equal(actual.green, expected.green);
			assert.equal(actual.blue, expected.blue);
			assert.equal(actual.alpha, expected.alpha);
		}
	);
});

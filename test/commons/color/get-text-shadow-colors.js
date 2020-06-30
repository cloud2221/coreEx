describe('axe.commons.color.getTextShadowColors', function() {
	'use strict';

	var fixture = document.getElementById('fixture');
	var getTextShadowColors = axe.commons.color.getTextShadowColors;

	afterEach(function() {
		fixture.innerHTML = '';
	});

	it('returns an empty array when there is no text-shadow', function() {
		fixture.innerHTML = '<span>Hello world</span>';
		var span = fixture.querySelector('span');
		var shadowColors = getTextShadowColors(span);
		assert.lengthOf(shadowColors, 0);
	});

	it('returns a rgb values of each text-shadow color', function() {
		fixture.innerHTML =
			'<span style="text-shadow: ' +
			'1px 1px 2px red, blue 0 0 1em, \n0\t 0  0.2em green;' +
			'">Hello world</span>';

		var span = fixture.querySelector('span');
		var shadowColors = getTextShadowColors(span);

		assert.lengthOf(shadowColors, 3);
		assert.equal(shadowColors[0].red, 255);
		assert.equal(shadowColors[0].green, 0);
		assert.equal(shadowColors[0].blue, 0);

		assert.equal(shadowColors[1].red, 0);
		assert.equal(shadowColors[1].blue, 255);
		assert.equal(shadowColors[1].green, 0);

		assert.equal(shadowColors[2].red, 0);
		assert.equal(shadowColors[2].green, 128);
		assert.equal(shadowColors[2].blue, 0);
	});

	it('returns transparent if the blur radius is greater than the offset', function() {
		fixture.innerHTML =
			'<span style="text-shadow: ' +
			'1px 3px 2px red, blue 10px 0 9px, 20px 20px 18px green;' +
			'">Hello world</span>';
		var span = fixture.querySelector('span');
		var shadowColors = getTextShadowColors(span);

		assert.equal(shadowColors[0].alpha, 0);
		assert.equal(shadowColors[1].alpha, 0);
		assert.equal(shadowColors[2].alpha, 0);
	});

	it('returns an estimated alpha value based on blur radius', function() {
		fixture.innerHTML =
			'<span style="text-shadow: ' +
			'1px 1px 2px red, blue 0 0 10px, \n0\t 0  18px green;' +
			'">Hello world</span>';

		var span = fixture.querySelector('span');
		var shadowColors = getTextShadowColors(span);
		var expected0 = 3.7 / (2 + 8);
		var expected1 = 3.7 / (10 + 8);
		var expected2 = 3.7 / (18 + 8);

		assert.closeTo(shadowColors[0].alpha, expected0, 0.05);
		assert.closeTo(shadowColors[1].alpha, expected1, 0.05);
		assert.closeTo(shadowColors[2].alpha, expected2, 0.05);
	});

	it('combines the blur radius alpha with the alpha of the text-shadow color', function() {
		fixture.innerHTML =
			'<span style="text-shadow: ' +
			'rgba(255,0,0,0) 0 0 2px, rgba(255,0,0,0.5) 0 0 2px, rgba(255,0,0,0.8) 0 0 2px' +
			'">Hello world</span>';

		var span = fixture.querySelector('span');
		var shadowColors = getTextShadowColors(span);
		var expected1 = (3.7 / (2 + 8)) * 0.5;
		var expected2 = (3.7 / (2 + 8)) * 0.8;

		assert.closeTo(shadowColors[0].alpha, 0, 0.05);
		assert.closeTo(shadowColors[1].alpha, expected1, 0.05);
		assert.closeTo(shadowColors[2].alpha, expected2, 0.05);
	});
});

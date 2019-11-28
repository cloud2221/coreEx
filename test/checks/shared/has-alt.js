describe('has-alt', function() {
	'use strict';

	var fixture = document.getElementById('fixture');
	var checkSetup = axe.testUtils.checkSetup;

	afterEach(function() {
		fixture.innerHTML = '';
	});

	it('should return true if an alt is present', function() {
		var checkArgs = checkSetup('<img id="target" alt="woohoo" />');
		assert.isTrue(checks['has-alt'].evaluate.apply(null, checkArgs));
	});

	it('should return true if an empty alt is present', function() {
		var checkArgs = checkSetup('<img id="target" alt="" />');
		assert.isTrue(checks['has-alt'].evaluate.apply(null, checkArgs));
	});

	it('should return false if an alt is not present', function() {
		var checkArgs = checkSetup('<img id="target" />');
		assert.isFalse(checks['has-alt'].evaluate.apply(null, checkArgs));
	});
});

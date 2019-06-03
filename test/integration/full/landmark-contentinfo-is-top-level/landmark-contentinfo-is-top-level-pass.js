describe('landmark-contentinfo-is-top-level test pass', function() {
	'use strict';
	var results;
	var isIE11 = axe.testUtils.isIE11;
	before(function(done) {
		axe.testUtils.awaitNestedLoad(function() {
			axe.run(
				{
					runOnly: {
						type: 'rule',
						values: ['landmark-contentinfo-is-top-level']
					}
				},
				function(err, r) {
					assert.isNull(err);
					results = r;
					done();
				}
			);
		});
	});

	describe('violations', function() {
		it('should find 0', function() {
			assert.lengthOf(results.violations, 0);
		});
	});

	describe('passes', function() {
		// This currently breaks in IE11
		(isIE11 ? it.skip : it)('should find 2', function() {
			assert.lengthOf(results.passes[0].nodes, 2);
		});
	});

	it('should find 0 inapplicable', function() {
		assert.lengthOf(results.inapplicable, 0);
	});

	it('should find 0 incomplete', function() {
		assert.lengthOf(results.incomplete, 0);
	});
});

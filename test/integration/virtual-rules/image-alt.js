describe('image-alt', function() {
	it('should pass has-alt check', function() {
		var results = axe.runVirtualRule('image-alt', {
			nodeName: 'img',
			attributes: {
				alt: 'foobar'
			}
		});

		assert.lengthOf(results.passes, 1);
		assert.lengthOf(results.violations, 0);
		assert.lengthOf(results.incomplete, 0);
	});

	it('should pass aria-label check', function() {
		var results = axe.runVirtualRule('image-alt', {
			nodeName: 'img',
			attributes: {
				'aria-label': 'foobar'
			}
		});

		assert.lengthOf(results.passes, 1);
		assert.lengthOf(results.violations, 0);
		assert.lengthOf(results.incomplete, 0);
	});

	it('should incomplete aria-labelledby check', function() {
		var results = axe.runVirtualRule('image-alt', {
			nodeName: 'img',
			attributes: {
				'aria-labelledby': 'foobar'
			}
		});

		assert.lengthOf(results.passes, 0);
		assert.lengthOf(results.violations, 0);
		assert.lengthOf(results.incomplete, 1);
	});

	it('should pass non-empty-title check', function() {
		var results = axe.runVirtualRule('image-alt', {
			nodeName: 'img',
			attributes: {
				title: 'foobar'
			}
		});

		assert.lengthOf(results.passes, 1);
		assert.lengthOf(results.violations, 0);
		assert.lengthOf(results.incomplete, 0);
	});

	it('should pass role-presentation check', function() {
		var results = axe.runVirtualRule('image-alt', {
			nodeName: 'img',
			attributes: {
				role: 'presentation'
			}
		});

		assert.lengthOf(results.passes, 1);
		assert.lengthOf(results.violations, 0);
		assert.lengthOf(results.incomplete, 0);
	});

	it('should pass role-none check', function() {
		var results = axe.runVirtualRule('image-alt', {
			nodeName: 'img',
			attributes: {
				role: 'none'
			}
		});

		assert.lengthOf(results.passes, 1);
		assert.lengthOf(results.violations, 0);
		assert.lengthOf(results.incomplete, 0);
	});

	it('should pass alt-space-value check', function() {
		var results = axe.runVirtualRule('image-alt', {
			nodeName: 'img',
			attributes: {
				alt: 'foobar'
			}
		});

		assert.lengthOf(results.passes, 1);
		assert.lengthOf(results.violations, 0);
		assert.lengthOf(results.incomplete, 0);
	});

	it('should fail has-alt check', function() {
		var results = axe.runVirtualRule('image-alt', {
			nodeName: 'img',
			attributes: {}
		});

		assert.lengthOf(results.passes, 0);
		assert.lengthOf(results.violations, 1);
		assert.lengthOf(results.incomplete, 0);
	});

	it('should fail aria-label check', function() {
		var results = axe.runVirtualRule('image-alt', {
			nodeName: 'img',
			attributes: {
				'aria-label': ''
			}
		});

		assert.lengthOf(results.passes, 0);
		assert.lengthOf(results.violations, 1);
		assert.lengthOf(results.incomplete, 0);
	});

	it('should fail non-empty-title check', function() {
		var results = axe.runVirtualRule('image-alt', {
			nodeName: 'img',
			attributes: {
				title: ''
			}
		});

		assert.lengthOf(results.passes, 0);
		assert.lengthOf(results.violations, 1);
		assert.lengthOf(results.incomplete, 0);
	});

	it('should fail role-presentation/none checks', function() {
		var results = axe.runVirtualRule('image-alt', {
			nodeName: 'img',
			attributes: {
				role: 'image'
			}
		});

		assert.lengthOf(results.passes, 0);
		assert.lengthOf(results.violations, 1);
		assert.lengthOf(results.incomplete, 0);
	});

	it('should fail alt-space-value check', function() {
		var results = axe.runVirtualRule('image-alt', {
			nodeName: 'img',
			attributes: {
				alt: '\t  \n  '
			}
		});

		assert.lengthOf(results.passes, 0);
		assert.lengthOf(results.violations, 1);
		assert.lengthOf(results.incomplete, 0);
	});
});

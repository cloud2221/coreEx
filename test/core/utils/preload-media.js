/* global Promise */

describe('axe.utils.preloadMedia', function() {
	'use strict';

	var origFn = axe.utils.preloadMedia;
	var fixture = document.getElementById('fixture');
	var fixtureSetup = axe.testUtils.fixtureSetup;

	afterEach(function() {
		axe.utils.preloadMedia = origFn;
		fixture.innerHTML = '';
	});

	it('invokes utils.preloadMedia and passes the treeRoot property', function(done) {
		var isCalled = false;
		axe.utils.preloadMedia = function(options) {
			assert.isDefined(options.treeRoot);
			isCalled = true;
			return Promise.resolve();
		};

		axe._tree = axe.utils.getFlattenedTree(document);

		axe.utils.preloadMedia({ treeRoot: axe._tree[0] }).then(function() {
			assert.ok(isCalled);
			done();
		});
	});

	it('returns empty array when there are no media nodes to be preloaded', function(done) {
		axe._tree = axe.utils.getFlattenedTree(document);

		axe.utils.preloadMedia({ treeRoot: axe._tree[0] }).then(function(result) {
			assert.equal(result.length, 0);
			done();
		});
	});

	it('returns media node (audio) after their metadata has been preloaded', function(done) {
		fixtureSetup(
			'<audio src="/test/assets/moon-speech.mp3" autoplay="true" controls></audio>'
		);

		axe.utils.preloadMedia({ treeRoot: axe._tree[0] }).then(function(result) {
			assert.equal(result.length, 1);
			assert.isTrue(result[0].readyState > 0);
			assert.equal(Math.round(result[0].duration), 27);

			done();
		});
	});

	it('returns media nodes (audio, video) after their metadata has been preloaded', function(done) {
		fixtureSetup(
			// 1 audio elm
			'<audio src="/test/assets/moon-speech.mp3"></audio>' +
				// 1 video elm
				'<video>' +
				'<source src="/test/assets/video.mp4" type="video/mp4" />' +
				'<source src="/test/assets/video.webm" type="video/webm" />' +
				'</video>'
		);

		axe.utils.preloadMedia({ treeRoot: axe._tree[0] }).then(function(result) {
			assert.equal(result.length, 2);
			assert.isTrue(result[0].readyState > 0);
			assert.equal(Math.round(result[0].duration), 27);

			assert.isTrue(result[1].readyState > 0);
			assert.equal(Math.round(result[1].duration), 14);

			done();
		});
	});
});

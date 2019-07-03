var fs = require('fs');
var path = require('path');
var assert = require('assert');
var glob = require('glob');
var axe = require('../axe');

var localeFiles = glob.sync('./locales/*.json');

describe('locales', function() {
	localeFiles.forEach(function(localeFile) {
		var localeName = path.basename(localeFile);
		it(localeName + ' should be valid', function(done) {
			fs.readFile(localeFile, 'utf-8', function(err, localeData) {
				if (err) {
					done(err);
				}

				var locale = JSON.parse(localeData);
				function fn() {
					axe.configure({ locale: locale });
				}

				assert.doesNotThrow(fn);
				done();
			});
		});
	});
});

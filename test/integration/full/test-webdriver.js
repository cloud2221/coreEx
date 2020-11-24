/*global window, Promise */

var globby = require('globby');
var WebDriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var chromedriver = require('chromedriver');
var isCI = require('is-ci');

var args = process.argv.slice(2);

// allow running certain browsers through command line args
// (only one browser supported, run multiple times for more browsers)
var browsers = ['chrome'];
args.forEach(function(arg, index) {
  // pattern: --browsers Chrome
  if (arg === '--browsers' && args[index + 1]) {
    browsers = args[index + 1].toLowerCase().split(',');
  }
});

// circle has everything configured to run chrome but local install
// may not
if (browsers.includes('chrome') && !isCI) {
  var service = new chrome.ServiceBuilder(chromedriver.path).build();
  chrome.setDefaultService(service);
}

/**
 * Keep injecting scripts until window.mochaResults is set
 */
function collectTestResults(driver) {
  // inject a script that waits half a second
  return driver
    .executeAsyncScript(function() {
      var callback = arguments[arguments.length - 1];
      setTimeout(function() {
        // return the mocha results (or undefined if not finished)
        callback(window.mochaResults);
      }, 500);
    })
    .then(function(result) {
      // If there are no results, listen a little longer
      if (!result) {
        return collectTestResults(driver);

        // if there are, return them
      } else {
        return Promise.resolve(result);
      }
    });
}

/**
 * Test each URL
 */
function runTestUrls(driver, isMobile, urls, errors) {
  var url = urls.shift();
  errors = errors || [];

  return (
    driver
      .get(url)
      // Get results
      .then(function() {
        return Promise.all([
          driver.getCapabilities(),
          collectTestResults(driver)
        ]);
      })
      // And process them
      .then(function(promiseResults) {
        var capabilities = promiseResults[0];
        var result = promiseResults[1];
        var browserName =
          capabilities.get('browserName') +
          (capabilities.get('mobileEmulationEnabled') ? '-mobile' : '');
        console.log(url + ' [' + browserName + ']');

        // Remember the errors
        (result.reports || []).forEach(function(err) {
          console.log(err.message);
          err.url = url;
          err.browser = browserName;
          errors.push(err);
        });

        // Log the result of the page tests
        console[result.failures ? 'error' : 'log'](
          'passes: ' +
            result.passes +
            ', ' +
            'failures: ' +
            result.failures +
            ', ' +
            'duration: ' +
            result.duration / 1000 +
            's'
        );
        console.log();
      })
      .then(function() {
        // Start the next job, if any
        if (urls.length > 0) {
          return runTestUrls(driver, isMobile, urls, errors);
        } else {
          driver.quit();
          return Promise.resolve(errors);
        }
      })
  );
}

/*
 * Build web driver depends whether REMOTE_SELENIUM_URL is set
 */
function buildWebDriver(browser) {
  var capabilities;
  var mobileBrowser = browser.split('-mobile');
  if (mobileBrowser.length > 1) {
    browser = mobileBrowser[0];
    capabilities = {
      browserName: mobileBrowser[0],
      chromeOptions: {
        mobileEmulation: {
          deviceMetrics: {
            width: 320,
            height: 568,
            pixelRatio: 2
          }
        }
      }
    };
  }

  var webdriver = new WebDriver.Builder()
    .withCapabilities(capabilities)
    .forBrowser(browser);

  if (process.env.REMOTE_SELENIUM_URL) {
    webdriver.usingServer(process.env.REMOTE_SELENIUM_URL);
  }

  // @see https://github.com/SeleniumHQ/selenium/issues/6026
  if (browser === 'safari') {
    var safari = require('selenium-webdriver/safari');
    var server = new safari.ServiceBuilder()
      .addArguments('--legacy')
      .build()
      .start();

    webdriver.usingServer(server);
  }

  return {
    driver: webdriver.build(),
    isMobile: mobileBrowser.length > 1
  };
}

function start(options) {
  var driver;
  var isMobile = false;
  // yes, really, and this isn't documented anywhere either.
  options.browser =
    options.browser === 'edge' ? 'MicrosoftEdge' : options.browser;

  var testUrls = globby
    .sync(['test/integration/full/**/*.html', '!**/frames/**/*.html'])
    .map(function(url) {
      return 'http://localhost:9876/' + url;
    });

  if (
    (process.platform === 'win32' && options.browser === 'safari') ||
    (process.platform === 'darwin' &&
      ['ie', 'MicrosoftEdge'].indexOf(options.browser) !== -1) ||
    ((process.platform === 'linux' || process.env.REMOTE_SELENIUM_URL) &&
      ['ie', 'MicrosoftEdge', 'safari'].indexOf(options.browser) !== -1)
  ) {
    console.log();
    console.log(
      'Skipped ' + options.browser + ' as it is not supported on this platform'
    );
    return process.exit();
  }

  // try to load the browser
  try {
    var webDriver = buildWebDriver(options.browser);
    driver = webDriver.driver;
    isMobile = webDriver.isMobile;
    // If load fails, warn user and move to the next task
  } catch (err) {
    console.log();
    console.log(err.message);
    console.log('Aborted testing using ' + options.browser);
    return process.exit();
  }

  // Give driver timeout options for scripts
  driver
    .manage()
    .timeouts()
    .setScriptTimeout(!isMobile ? 60000 * 5 : 60000 * 10);
  // allow to wait for page load implicitly
  driver
    .manage()
    .timeouts()
    .implicitlyWait(50000);

  // Test all pages
  return runTestUrls(driver, isMobile, testUrls).catch(function(err) {
    console.log(err);
    process.exit(1);
  });
}

var promises = [];
browsers.forEach(function(browser) {
  promises.push(start({ browser: browser }));
});

Promise.all(promises).then(function(browserErrors) {
  // log each error and abort
  var errors = 0;

  browserErrors.forEach(function(testErrors) {
    testErrors.forEach(function(err) {
      errors++;
      console.log();
      console.log('URL: ' + err.url);
      console.log('Browser: ' + err.browser);
      console.log('Describe: ' + err.titles.join(' > '));
      console.log('it ' + err.name);
      console.log(err.stack);
      console.log();
    });
  });

  // catch any potential problems
  process.exit(errors);
});

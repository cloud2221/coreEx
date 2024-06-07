describe('scrollable-region-focusable-matches', function () {
  'use strict';

  let fixture = document.getElementById('fixture');
  let queryFixture = axe.testUtils.queryFixture;
  let shadowSupported = axe.testUtils.shadowSupport.v1;
  let rule = axe.utils.getRule('scrollable-region-focusable');

  afterEach(function () {
    fixture.innerHTML = '';
  });

  it('returns false when element is not scrollable', function () {
    let target = queryFixture(
      '<section id="target">This element is not scrollable</section>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isFalse(actual);
  });

  it('returns false when element has no visible children', function () {
    let target = queryFixture(
      '<div id="target" style="height: 200px; width: 200px;">' +
        '<div style="display:none; height: 2000px; width: 100px;">' +
        '<p> Content </p>' +
        '</div>' +
        '</div>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isFalse(actual);
  });

  it('returns false when element does not overflow', function () {
    let target = queryFixture(
      '<div id="target" style="height: 200px; width: 200px; overflow: auto;">' +
        '<div style="height: 10px; width: 100x;">Content</div>' +
        '</div>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isFalse(actual);
  });

  it('returns false when element is not scrollable (overflow=hidden)', function () {
    let target = queryFixture(
      '<div id="target" style="height: 200px; width: 200px; overflow: hidden">' +
        '<div style="height: 2000px; width: 100px; background-color: pink;">' +
        '<p> Content </p>' +
        '</div>' +
        '</div>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isFalse(actual);
  });

  it('returns true when element is scrollable (overflow=auto)', function () {
    let target = queryFixture(
      '<div id="target" style="height: 200px; width: 200px; overflow: auto">' +
        '<div style="height: 10px; width: 2000px; background-color: red;">' +
        '<p> Content </p>' +
        '</div>' +
        '</div>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isTrue(actual);
  });

  it('returns false when element overflow is visible', function () {
    let target = queryFixture(
      '<p id="target" style="width: 12em; height: 2em; border: dotted; overflow: visible;">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isFalse(actual);
  });

  it('returns true when element overflow is scroll', function () {
    let target = queryFixture(
      '<p id="target" style="width: 12em; height: 2em; border: dotted; overflow: scroll;">Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isTrue(actual);
  });

  it('returns false when element overflow is scroll but has no content', function () {
    let target = queryFixture(
      '<div id="target" style="width: 12em; height: 2em; border: dotted; overflow: scroll;"><div style="height: 15rem"></div></div>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isFalse(actual);
  });

  it('returns false when element has combobox ancestor', function () {
    let target = queryFixture(
      '<div role="combobox"><ul id="target" role="listbox" style="width: 12em; height: 2em; border: dotted; overflow: scroll;"><li role="option" style="height: 15rem">Option</li></ul></div>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isFalse(actual);
  });

  it('returns false when element is owned by combobox', function () {
    let target = queryFixture(
      '<input role="combobox" aria-owns="foo target"/><ul id="target" role="listbox" style="width: 12em; height: 2em; border: dotted; overflow: scroll;"><li role="option" style="height: 15rem">Option</li></ul>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isFalse(actual);
  });

  it('returns false when element is controlled by combobox', function () {
    let target = queryFixture(
      '<input role="combobox" aria-controls="foo target"/><ul id="target" role="listbox" style="width: 12em; height: 2em; border: dotted; overflow: scroll;"><li role="option" style="height: 15rem">Option</li></ul>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isFalse(actual);
  });

  it('returns false for combobox with tree', function () {
    let target = queryFixture(
      '<div role="combobox"><ul id="target" role="tree" style="width: 12em; height: 2em; border: dotted; overflow: scroll;"><li role="option" style="height: 15rem">Option</li></ul></div>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isFalse(actual);
  });

  it('returns false for combobox with grid', function () {
    let target = queryFixture(
      '<div role="combobox"><ul id="target" role="grid" style="width: 12em; height: 2em; border: dotted; overflow: scroll;"><li role="option" style="height: 15rem">Option</li></ul></div>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isFalse(actual);
  });

  it('returns false for combobox with dialog', function () {
    let target = queryFixture(
      '<div role="combobox"><ul id="target" role="dialog" style="width: 12em; height: 2em; border: dotted; overflow: scroll;"><li role="option" style="height: 15rem">Option</li></ul></div>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isFalse(actual);
  });

  it('returns true for combobox with non-valid role', function () {
    let target = queryFixture(
      '<div role="combobox"><ul id="target" role="section" style="width: 12em; height: 2em; border: dotted; overflow: scroll;"><li role="option" style="height: 15rem">Option</li></ul></div>'
    );
    let actual = rule.matches(target.actualNode, target);
    assert.isTrue(actual);
  });

  describe('shadowDOM - scrollable-region-focusable-matches', function () {
    before(function () {
      if (!shadowSupported) {
        this.skip();
      }
    });

    afterEach(function () {
      axe._tree = undefined;
    });

    it('returns false when shadowDOM element does not overflow', function () {
      fixture.innerHTML = '<div></div>';

      let root = fixture.firstChild.attachShadow({ mode: 'open' });
      let slotted = document.createElement('div');
      slotted.innerHTML =
        '<p id="target" style="width: 12em; height: 2em; border: dotted;">Sed.</p>';
      root.appendChild(slotted);
      let tree = (axe._tree = axe.utils.getFlattenedTree(fixture.firstChild));
      let target = axe.utils.querySelectorAll(tree, 'p')[0];
      let actual = rule.matches(target.actualNode, target);
      assert.isFalse(actual);
    });

    it('returns true when shadowDOM element has overflow', function () {
      fixture.innerHTML = '<div></div>';

      let root = fixture.firstChild.attachShadow({ mode: 'open' });
      let slotted = document.createElement('div');
      slotted.innerHTML =
        '<p id="target" style="width: 12em; height: 2em; border: dotted; overflow: auto;">This is a repeated long sentence, This is a repeated long sentence, This is a repeated long sentence, This is a repeated long sentence, This is a repeated long sentence.</p>';
      root.appendChild(slotted);
      let tree = (axe._tree = axe.utils.getFlattenedTree(fixture.firstChild));
      let target = axe.utils.querySelectorAll(tree, 'p')[0];
      let actual = rule.matches(target.actualNode, target);
      assert.isTrue(actual);
    });
  });
});

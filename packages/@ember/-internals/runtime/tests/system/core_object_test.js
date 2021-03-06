import { getOwner, setOwner } from '@ember/-internals/owner';
import { get } from '@ember/-internals/metal';
import CoreObject from '../../lib/system/core_object';
import { moduleFor, AbstractTestCase, buildOwner } from 'internal-test-helpers';

moduleFor(
  'Ember.CoreObject',
  class extends AbstractTestCase {
    ['@test works with new (one arg)'](assert) {
      let obj = new CoreObject({
        firstName: 'Stef',
        lastName: 'Penner',
      });

      assert.equal(obj.firstName, 'Stef');
      assert.equal(obj.lastName, 'Penner');
    }

    ['@test works with new (> 1 arg)'](assert) {
      let obj = new CoreObject(
        {
          firstName: 'Stef',
          lastName: 'Penner',
        },
        {
          other: 'name',
        }
      );

      assert.equal(obj.firstName, 'Stef');
      assert.equal(obj.lastName, 'Penner');

      assert.equal(obj.other, undefined); // doesn't support multiple pojo' to the constructor
    }

    ['@test toString should be not be added as a property when calling toString()'](assert) {
      let obj = new CoreObject({
        firstName: 'Foo',
        lastName: 'Bar',
      });

      obj.toString();

      assert.notOk(
        obj.hasOwnProperty('toString'),
        'Calling toString() should not create a toString class property'
      );
    }

    ['@test should not trigger proxy assertion when retrieving a proxy with (GH#16263)'](assert) {
      let someProxyishThing = CoreObject.extend({
        unknownProperty() {
          return true;
        },
      }).create();

      let obj = new CoreObject({
        someProxyishThing,
      });

      let proxy = get(obj, 'someProxyishThing');
      assert.equal(get(proxy, 'lolol'), true, 'should be able to get data from a proxy');
    }

    ['@test should not trigger proxy assertion when retrieving a re-registered proxy (GH#16610)'](
      assert
    ) {
      let owner = buildOwner();

      let someProxyishThing = CoreObject.extend({
        unknownProperty() {
          return true;
        },
      }).create();

      // emulates ember-engines's process of registering services provided
      // by the host app down to the engine
      owner.register('thing:one', someProxyishThing, { instantiate: false });

      assert.equal(owner.lookup('thing:one'), someProxyishThing);
    }

    ['@test should not trigger proxy assertion when probing for a "symbol"'](assert) {
      let proxy = CoreObject.extend({
        unknownProperty() {
          return true;
        },
      }).create();

      assert.equal(get(proxy, 'lolol'), true, 'should be able to get data from a proxy');

      // should not trigger an assertion
      getOwner(proxy);
    }

    ['@test can use getOwner in a proxy init GH#16484'](assert) {
      let owner = {};
      let options = {};
      setOwner(options, owner);

      CoreObject.extend({
        init() {
          this._super(...arguments);
          let localOwner = getOwner(this);

          assert.equal(localOwner, owner, 'should be able to `getOwner` in init');
        },
        unknownProperty() {
          return undefined;
        },
      }).create(options);
    }
  }
);

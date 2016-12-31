import Ember from 'ember';
import { deepMerge } from 'affinity-engine';
import cmd from 'affinity-engine-stage/utils/affinity-engine/stage/cmd';
import multiton from 'ember-multiton-service';

const {
  Evented,
  assign,
  computed,
  get,
  getOwner,
  getProperties,
  isNone,
  isPresent,
  set
} = Ember;

const { RSVP: { Promise } } = Ember;

export default Ember.Object.extend(Evented, {
  _isDirection: true,

  config: multiton('affinity-engine/config', 'engineId'),
  esBus: multiton('message-bus', 'engineId', 'stageId'),

  attrs: computed(() => Ember.Object.create()),
  links: computed(() => Ember.Object.create({
    attrs: Ember.Object.create(),
    fixtures: Ember.Object.create()
  })),
  _configurationTiers: computed(() => []),
  _linkedFixtures: computed(() => Ember.Object.create()),

  init(...args) {
    this._super(...args);

    Object.defineProperty(this, '_', {
      get() {
        return get(this, '_scriptProxy');
      }
    });
  },

  resolve(...args) {
    const resolve = get(this, '_resolve');

    if (isPresent(resolve)) {
      Reflect.deleteProperty(this, '_resolve');

      const resolutions = isPresent(args) ? args : [this];

      resolve(...resolutions);
    }
  },

  _ensurePromise() {
    if (isNone(get(this, '_resolve'))) {
      const promise = new Promise((resolve) => {
        set(this, '_resolve', resolve);
      });

      const script = get(this, 'script');

      script._incrementSceneRecordIndex();
      script._record(promise);

      this.then = function(...args) {
        Reflect.deleteProperty(this, 'then');

        return promise.then(...args);
      };
    }
  },

  _scriptProxy: computed({
    get() {
      const { directionName, links } = getProperties(this, 'directionName', 'links');
      const linkedAttrs = get(this, '_configuredLinkedAttrs');

      set(links, directionName, this);

      return getOwner(this).lookup('affinity-engine/stage:script-proxy').create({
        links,
        linkedAttrs,
        linkedFixtures: get(this, '_linkedFixtures'),
        ...getProperties(this, 'script', 'engineId', 'stageId')
      });
    }
  }).readOnly(),

  linkedAttrs: cmd(function(linkedAttrs) {
    set(this, 'attrs._linkedAttrs', linkedAttrs);
  }),

  _linkedAttrs: computed('attrs._linkedAttrs', {
    get() {
      return get(this, '_configurationTiers').slice().reverse().reduce((accumulator, tier) => {
        const nextValue = get(this, `${tier}._linkedAttrs`) || {};

        return assign(accumulator, nextValue);
      }, {});
    }
  }),

  _configuredLinkedAttrs: computed({
    get() {
      const directable = get(this, 'directable') || this._createDirectable();
      const linkedAttrs = get(this, '_linkedAttrs');

      return Object.keys(linkedAttrs).reduce((attrs, key) => {
        attrs[linkedAttrs[key]] = get(directable, key);

        return attrs;
      }, Ember.Object.create());
    }
  }).volatile(),

  _linkFixture(fixture) {
    deepMerge(get(this, '_linkedFixtures'), fixture);
  },

  _$instance: computed({
    get() {
      const component = get(this, 'directable.component');

      return isPresent(component) ? component.$() : undefined;
    }
  }).volatile(),

  _ensureDirectable() {
    if (isNone(get(this, 'directable'))) {
      get(this, 'esBus').publish('shouldAddDirectable', this._createDirectable());
    }
  },

  _createDirectable() {
    const directableDefinition = get(this, '_directableDefinition') || {};
    const Directable = getOwner(this).lookup('affinity-engine/stage:directable');
    const directable = Directable.extend(directableDefinition).create({
      ...getProperties(this, 'attrs', 'componentPath', 'layer', 'links', 'engineId', 'stageId'),
      priorSceneRecord: get(this, 'script')._getPriorSceneRecord(),
      direction: this
    });

    return set(this, 'directable', directable);
  }
});

import Ember from 'ember';
import { BusPublisherMixin } from 'ember-message-bus';

const {
  Evented,
  computed,
  get,
  getOwner,
  getProperties,
  isNone,
  isBlank,
  isPresent,
  set
} = Ember;

const { RSVP: { Promise } } = Ember;

export default Ember.Object.extend(Evented, BusPublisherMixin, {
  _isDirection: true,
  _restartingEngine: true,

  attrs: computed(() => Ember.Object.create()),
  links: computed(() => Ember.Object.create()),

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

      this.then = function(...args) {
        Reflect.deleteProperty(this, 'then');

        return promise.then(...args);
      };
    }
  },

  _scriptProxy: computed({
    get() {
      const { directionName, links } = getProperties(this, 'directionName', 'links');
      const linkedAttrs = this._generateLinkedAttrs();

      set(links, directionName, this);

      return getOwner(this).lookup('affinity-engine/stage:script-proxy').create({
        links,
        linkedAttrs,
        ...getProperties(this, 'script', 'engineId', 'windowId')
      });
    }
  }).readOnly(),

  _generateLinkedAttrs() {
    const directable = get(this, 'directable') || this._createDirectable();
    const linkedAttrs = get(this, '_linkedAttrs');

    if (isBlank(linkedAttrs)) { return directable; }

    return linkedAttrs.reduce((attrs, attr) => {
      attrs[attr] = get(directable, attr);

      return attrs;
    }, Ember.Object.create());
  },

  _$instance: computed({
    get() {
      const component = get(this, 'directable.component');

      return isPresent(component) ? component.$() : undefined;
    }
  }).volatile(),

  _ensureDirectable() {
    if (isNone(get(this, 'directable'))) {
      const { engineId, windowId } = getProperties(this, 'engineId', 'windowId');

      this.publish(`ae:${engineId}:${windowId}:shouldAddDirectable`, this._createDirectable());
    }
  },

  _createDirectable() {
    const directableDefinition = get(this, '_directableDefinition') || {};
    const Directable = getOwner(this).lookup('affinity-engine/stage:directable');
    const directable = Directable.extend(directableDefinition).create({
      ...getProperties(this, 'attrs', 'componentPath', 'layer', 'links', 'engineId', 'windowId'),
      priorSceneRecord: get(this, 'script')._getPriorSceneRecord(),
      direction: this
    });

    return set(this, 'directable', directable);
  }
});

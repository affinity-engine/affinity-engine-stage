import Ember from 'ember';
import multiton from 'ember-multiton-service';

const {
  Mixin,
  computed,
  get,
  isBlank,
  isPresent,
  set
} = Ember;

const { String: { htmlSafe, dasherize } } = Ember;
const { reads } = computed;

export default Mixin.create({
  esBus: multiton('message-bus', 'engineId', 'stageId'),
  attributeBindings: ['style'],

  init(...args) {
    this._super(...args);

    this._initObservedStyles();

    const direction = get(this, 'direction');

    if (isBlank(direction)) { return; }

    set(direction, 'component', this);
  },

  observedStyles: computed(() => []),
  zIndex: reads('direction.configuration.attrs.zIndex'),

  _initObservedStyles() {
    const observedStyles = get(this, 'observedStyles');

    observedStyles.push('zIndex');
    observedStyles.forEach((attribute) => this.addObserver(attribute, this, this._recomputeStyle));
  },

  _recomputeStyle() {
    this.notifyPropertyChange('style');
  },

  style: computed({
    get() {
      return htmlSafe(get(this, 'observedStyles').reduce((style, key) => {
        return style += `${dasherize(key)}:${get(this, key)};`
      }, ''));
    }
  }),

  resolveAndDestroy(...args) {
    this.resolve(...args);
    this.removeDirection();
  },

  resolve(...args) {
    if (get(this, 'isDestroyed') || get(this, 'isDestroying')) { return; }

    const direction = get(this, 'direction');

    if (isPresent(direction)) { direction.resolve(...args); }
  },

  removeDirection() {
    if (get(this, 'isDestroyed') || get(this, 'isDestroying')) { return; }

    const direction = get(this, 'direction');

    get(this, 'esBus').publish('shouldRemoveDirection', direction);
  }
});

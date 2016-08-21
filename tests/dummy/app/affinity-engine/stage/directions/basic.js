import Ember from 'ember';
import { configurable } from 'affinity-engine';
import { Direction } from 'affinity-engine-stage';

const {
  get,
  getProperties,
  set
} = Ember;

const configurationTiers = [
  '_attrs',
  '_attrs.appender.attrs',
  'config.attrs.stage',
  'config.attrs.globals'
];

export default Direction.extend({
  componentPath: 'basic-direction',
  layer: 'engine.meta.basic',

  attrs: {
    header: configurable(configurationTiers, 'header'),
    text: configurable(configurationTiers, 'textContent'),
    footerSecondary: configurable(configurationTiers, 'footerSecondary'),
    footerText: configurable(configurationTiers, 'footerText')
  },

  _setup(header) {
    this._entryPoint();

    set(this, '_attrs.header', header);
    set(this, '_attrs.appender', get(this, 'predecessors').findBy('directionName', 'appender'));

    return this;
  },

  _reset() {
    const _attrs = get(this, '_attrs');

    return this._super(getProperties(_attrs, 'header', 'footer'));
  },

  text(textContent) {
    this._entryPoint();

    set(this, '_attrs.textContent', textContent);

    return this;
  }
});

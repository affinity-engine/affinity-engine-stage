import Ember from 'ember';
import { Direction } from 'ember-theater-director';

const {
  get,
  getProperties,
  set
} = Ember;

export default Direction.extend({
  componentPath: 'basic-direction',
  layer: 'theater.meta.basic',

  _setup(header) {
    this._entryPoint();

    set(this, 'attrs.header', header);
    set(this, 'attrs.appender', get(this, 'predecessors').findBy('_name', 'appender'));

    return this;
  },

  _reset() {
    const attrs = get(this, 'attrs');

    return this._super(getProperties(attrs, 'header', 'footer'));
  },

  text(textContent) {
    this._entryPoint();

    set(this, 'attrs.textContent', textContent);

    return this;
  }
});

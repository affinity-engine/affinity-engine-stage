import Ember from 'ember';
import { Direction } from 'ember-theater-director';

const {
  get,
  getProperties,
  set
} = Ember;

export default Direction.extend({
  componentPath: 'test-direction',
  layer: 'theater.meta.test',

  _setup(header, footer) {
    this._entryPoint();

    set(this, 'attrs.header', header);
    set(this, 'attrs.footer', footer);

    return this;
  },

  _reset() {
    const attrs = get(this, 'attrs');

    return this._super(getProperties(attrs, 'header'));
  },

  text(textContent) {
    this._entryPoint();

    set(this, 'attrs.textContent', textContent);

    return this;
  }
});

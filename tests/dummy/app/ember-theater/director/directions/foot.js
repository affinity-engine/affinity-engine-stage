import Ember from 'ember';
import { Direction } from 'ember-theater-director';

const {
  get,
  set
} = Ember;

export default Direction.extend({
  _setup(footer) {
    this._entryPoint();

    set(this, 'attrs.footerText', footer);

    return this;
  },

  secondary(secondary) {
    set(this, 'attrs.footerSecondary', secondary);

    return this;
  },

  Test(header) {
    this._removeFromQueue();

    const direction = this._createDirection('test');

    return direction._setup(header, get(this, 'attrs'));
  },

  _removeFromQueue() {
    get(this, 'queue').removeObject(this);
  }
});

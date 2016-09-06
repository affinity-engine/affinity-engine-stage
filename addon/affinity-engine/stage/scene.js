import Ember from 'ember';

const {
  computed,
  get
} = Ember;

export default Ember.Object.extend({
  _sceneName: computed('name', '_id', {
    get() {
      return get(this, 'name') || get(this, '_id');
    }
  })
});

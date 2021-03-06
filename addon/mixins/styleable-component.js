import Ember from 'ember';

const {
  Mixin,
  computed,
  get,
  isEmpty
} = Ember;

const { String: { htmlSafe } } = Ember;

export default Mixin.create({
  attributeBindings: ['style'],

  style: computed('directable.options.style', {
    get() {
      const object = get(this, 'directable.options.style');

      if (isEmpty(object)) { return; }

      const style = Object.keys(object).map((key) => {
        return `${key}: ${get(object, key)};`;
      }).join(' ');

      return new htmlSafe(style);
    }
  }).readOnly()
});

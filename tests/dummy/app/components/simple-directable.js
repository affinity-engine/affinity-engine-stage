import Ember from 'ember';

const { Component } = Ember;
const { computed: { alias } } = Ember;

export default Component.extend({
  hook: 'simple_directable',

  text: alias('directable.layer')
});

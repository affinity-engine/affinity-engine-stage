import Ember from 'ember';
import { gatherTypes } from 'ember-theater';

const { String: { camelize } } = Ember;

export function initialize(appInstance) {
  appInstance.registerOptionsForType('ember-theater/director/text-tag', { instantiate: false });

  const textTagNames = gatherTypes(appInstance, 'ember-theater/director/text-tag');

  textTagNames.forEach((textTagName) => {
    appInstance.inject('component:ember-theater/director/directable/text/body',
      camelize(textTagName),
      `ember-theater/director/text-tag:${textTagName}`);
  });
}

export default {
  name: 'ember-theater/director/register-text-tags',
  initialize
};

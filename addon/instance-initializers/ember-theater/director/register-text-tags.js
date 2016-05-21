import Ember from 'ember';
import gatherModules from 'ember-theater/utils/gather-modules';

const { String: { camelize } } = Ember;

export function initialize(appInstance) {
  const textTags = gatherModules('ember-theater\/director\/text-tags');

  textTags.forEach((textTag, textTagName) => {
    appInstance.register(`ember-theater/director/text-tag:${textTagName}`, textTag, {
      instantiate: false,
      singleton: false
    });
    appInstance.inject('component:ember-theater/director/directable/text/body',
      camelize(textTagName),
      `ember-theater/director/text-tag:${textTagName}`);
  });
}

export default {
  name: 'ember-theater/director/register-text-tags',
  initialize
};

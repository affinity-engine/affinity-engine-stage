import Directable from 'ember-theater-director/ember-theater/director/directable';
import Direction from 'ember-theater-director/ember-theater/director/direction';
import Scene from 'ember-theater-director/ember-theater/director/scene';
import Script from 'ember-theater-director/ember-theater/director/script';
import TextTag from 'ember-theater-director/ember-theater/director/text-tag';

import DirectableComponentMixin from 'ember-theater-director/mixins/directable-component';
import DirectableManagerMixin from 'ember-theater-director/mixins/directable-manager';
import StyleableComponentMixin from 'ember-theater-director/mixins/styleable-component';
import TransitionableComponentMixin from 'ember-theater-director/mixins/transitionable-component';
import TransitionableComponentAutoMixin from 'ember-theater-director/mixins/transitionable-component-auto';

import step from 'ember-theater-director/ember-theater/director/test-support/step';

import layerName from 'ember-theater-director/utils/ember-theater/director/layer-name';

import { initialize as registerDirectable } from 'ember-theater-director/instance-initializers/ember-theater/director/register-directable';
import { initialize as registerDirections } from 'ember-theater-director/instance-initializers/ember-theater/director/register-directions';
import { initialize as registerScenes } from 'ember-theater-director/instance-initializers/ember-theater/director/register-scenes';
import { initialize as registerScript } from 'ember-theater-director/instance-initializers/ember-theater/director/register-script';
import { initialize as registerTextTags } from 'ember-theater-director/instance-initializers/ember-theater/director/register-text-tags';

const initialize = function initialize(appInstance) {
  registerDirectable(appInstance);
  registerDirections(appInstance);
  registerScenes(appInstance);
  registerScript(appInstance);
  registerTextTags(appInstance);
};

export {
  Directable,
  Direction,
  Scene,
  Script,
  TextTag,
  DirectableComponentMixin,
  DirectableManagerMixin,
  StyleableComponentMixin,
  TransitionableComponentMixin,
  TransitionableComponentAutoMixin,
  initialize,
  step,
  layerName
};

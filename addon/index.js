import Directable from 'affinity-engine-stage/affinity-engine/stage/directable';
import Direction from 'affinity-engine-stage/affinity-engine/stage/direction';
import Scene from 'affinity-engine-stage/affinity-engine/stage/scene';
import Script from 'affinity-engine-stage/affinity-engine/stage/script';
import ScriptProxy from 'affinity-engine-stage/affinity-engine/stage/script-proxy';

import DirectableComponentMixin from 'affinity-engine-stage/mixins/directable-component';
import DirectableManagerMixin from 'affinity-engine-stage/mixins/directable-manager';
import StyleableComponentMixin from 'affinity-engine-stage/mixins/styleable-component';
import TransitionableComponentMixin from 'affinity-engine-stage/mixins/transitionable-component';
import TransitionableComponentAutoMixin from 'affinity-engine-stage/mixins/transitionable-component-auto';

import step from 'affinity-engine-stage/affinity-engine/stage/test-support/step';

import cmd from 'affinity-engine-stage/utils/affinity-engine/stage/cmd';
import layerName from 'affinity-engine-stage/utils/affinity-engine/stage/layer-name';

import { initialize as registerDirectable } from 'affinity-engine-stage/instance-initializers/affinity-engine/stage/register-directable';
import { initialize as registerDirections } from 'affinity-engine-stage/instance-initializers/affinity-engine/stage/register-directions';
import { initialize as registerScenes } from 'affinity-engine-stage/instance-initializers/affinity-engine/stage/register-scenes';
import { initialize as registerScript } from 'affinity-engine-stage/instance-initializers/affinity-engine/stage/register-script';

const initialize = function initialize(appInstance) {
  registerDirectable(appInstance);
  registerDirections(appInstance);
  registerScenes(appInstance);
  registerScript(appInstance);
};

export {
  Directable,
  Direction,
  Scene,
  Script,
  ScriptProxy,
  DirectableComponentMixin,
  DirectableManagerMixin,
  StyleableComponentMixin,
  TransitionableComponentMixin,
  TransitionableComponentAutoMixin,
  initialize,
  step,
  cmd,
  layerName
};

/* global require, module */

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var addon = new EmberAddon(defaults, {
    'ember-cli-babel': {
      includePolyfill: true,
      stage: 1
    },

    sassOptions: {
      extensions: 'scss'
    }
  });

  return addon.toTree();
}

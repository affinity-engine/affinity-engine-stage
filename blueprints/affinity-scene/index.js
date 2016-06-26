module.exports = {
  description: 'Generates a scene for affinity-engine.',

  locals: function(options) {
    return {
      capitalizedModuleName: options.entity.name.split(/-|_/).map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }).join(' ')
    }
  }
};

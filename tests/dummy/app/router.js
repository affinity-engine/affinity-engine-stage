import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('affinity-engine', function() {
    this.route('test-scenarios', function() {
      this.route('stage', function() {
        this.route('directions', function() {
          this.route('basic-direction');
          this.route('layer');
          this.route('scene');
        });
      });
    });
  });
});

export default Router;

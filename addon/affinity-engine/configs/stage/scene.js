export default {
  priority: 2,
  default: {
    component: {
      stage: {
        direction: {
          scene: {
            attrs: {
              layer: 'stage.windows'
            }
          }
        },
        layer: {
          stage: {
            windows: {
              attrs: {
                zIndex: 1000
              }
            }
          }
        }
      }
    }
  }
};

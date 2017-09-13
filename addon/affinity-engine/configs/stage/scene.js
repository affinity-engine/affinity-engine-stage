export default {
  priority: 2,
  default: {
    component: {
      stage: {
        direction: {
          scene: {
            attrs: {
              layer: 'stage.windows',
              transitionIn: {
                effect: { opacity: [1, 0] },
                duration: 250
              },
              transitionOut: {
                effect: { opacity: 0 },
                duration: 250
              }
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

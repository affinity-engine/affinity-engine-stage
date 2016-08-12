export default {
  priority: 2,
  component: {
    stage: {
      direction: {
        scene: {
          transitionIn: {
            effect: { opacity: [0.5, 0] },
            duration: 250
          },
          transitionOut: {
            effect: { opacity: 0 },
            duration: 250
          }
        }
      }
    }
  }
};

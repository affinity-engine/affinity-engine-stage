export default {
  priority: 2,
  component: {
    stage: {
      direction: {
        scene: {
          transitionIn: {
            merge: true,
            effect: { opacity: [1, 0] },
            duration: 250
          },
          transitionOut: {
            merge: true,
            effect: { opacity: 0 },
            duration: 250
          }
        }
      }
    }
  }
};

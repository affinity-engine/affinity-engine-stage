export default {
  priority: 2,
  stage: {
    scene: {
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
};

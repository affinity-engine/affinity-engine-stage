export default {
  priority: 1,
  globals: {
    classNames: ['et-paper', 'et-block'],
    transitionDuration: 200,
    transition: {
      duration: 250,
      effect: { opacity: 1 }
    },
    transitionIn: {
      duration: 250,
      effect: { opacity: [1, 0] }
    },
    transitionOut: {
      duration: 250,
      effect: { opacity: 0 }
    },
    keys: {
      accept: [' ', 'Enter'],
      cancel: ['Escape'],
      moveDown: ['ArrowDown', 's'],
      moveUp: ['ArrowUp', 'w']
    }
  },
  director: {
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

export default {
  component: {
    stage: {
      direction: {
        appender: {
          attrs: {
            footerViaConfigAlias: 'via config'
          },
          links: {
            basic: {
              attrs: {
                footerViaConfig: {
                  alias: 'footerViaConfigAlias'
                }
              }
            }
          }
        }
      }
    }
  }
}

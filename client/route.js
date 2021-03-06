export default function route(page) {
  switch (page) {
    case '':
      return '/applications'

    case 'application':
      import('./pages/application/application')
      return page

    case 'applications':
      import('./pages/application/applications')
      return page

    case 'register-app':
      import('./pages/application/register-app')
      return page

    case 'app-bindings':
      import('./pages/app-binding/app-bindings')
      return page
  }
}

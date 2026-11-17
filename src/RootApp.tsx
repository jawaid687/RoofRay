import { RouterProvider, Route } from './router/Router';
import { LandingPage } from './pages/LandingPage';
import { App } from './App';

export function RootApp() {
  return (
    <RouterProvider>
      <Route path="/" component={LandingPage} />
      <Route path="/app" component={App} />
    </RouterProvider>
  );
}

export default RootApp;

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  currentPath: '/',
  navigate: () => {},
});

export function useRouter() {
  return useContext(RouterContext);
}

function getInitialPath(): string {
  if (typeof window === 'undefined') return '/';
  const pathname = window.location.pathname;
  if (pathname.startsWith('/app')) return '/app';
  return '/';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);

  useEffect(() => {
    const handlePopState = () => {
      const path = getInitialPath();
      setCurrentPath(path);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    const url = new URL(to, window.location.origin);
    const targetPath = url.pathname.startsWith('/app') ? '/app' : '/';

    window.history.pushState({}, '', to);
    setCurrentPath(targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function Route({ path, component: Component }: { path: string; component: React.ComponentType }) {
  const { currentPath } = useRouter();
  if (path === currentPath || (path === '/app' && currentPath.startsWith('/app'))) {
    return <Component />;
  }
  return null;
}

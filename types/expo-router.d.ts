declare module 'expo-router' {
  export function useRouter(): {
    push: (href: string | { pathname: string; params?: Record<string, any> }) => void;
    replace: (href: string | { pathname: string; params?: Record<string, any> }) => void;
    back: () => void;
    canGoBack: () => boolean;
  };
  export function useLocalSearchParams<T = Record<string, string>>(): T;
  export function useSegments(): string[];
  export function usePathname(): string;
  export const Link: React.ComponentType<{
    href: string;
    asChild?: boolean;
    children?: React.ReactNode;
  }>;
  export const Stack: React.ComponentType<any> & {
    Screen: React.ComponentType<any>;
  };
  export const Tabs: React.ComponentType<any> & {
    Screen: React.ComponentType<any>;
  };
  export const Slot: React.ComponentType<any>;
  export function Redirect(props: { href: string }): JSX.Element;
}

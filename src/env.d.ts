interface Window {
  google?: typeof google;
}

declare namespace google.accounts {
  namespace oauth2 {
    interface TokenClientConfig {
      client_id: string;
      scope: string;
      callback: (response: { access_token?: string; error?: string }) => void;
    }
    function initTokenClient(config: TokenClientConfig): {
      requestAccessToken: () => void;
    };
  }
  namespace id {
    interface CredentialResponse {
      credential: string;
      select_by?: string;
    }
    interface IdConfiguration {
      client_id: string;
      callback: (response: CredentialResponse) => void;
      auto_select?: boolean;
      cancel_on_tap_outside?: boolean;
      context?: string;
      state_cookie_domain?: string;
      native_callback?: (response: CredentialResponse) => void;
      nonce?: string;
      prompt_parent_id?: string;
      native_login_uri?: string;
    }
    function initialize(config: IdConfiguration): void;
    function prompt(momentListener?: (moment: string) => void): void;
    function renderButton(parent: HTMLElement, options: GsiButtonConfiguration): void;
    function disableAutoSelect(): void;
    function storeCredential(credential: string, callback?: () => void): void;
    function cancel(): void;
    function revoke(credential: string, callback?: () => void): void;
    function onGoogleLibraryLoad?: () => void;
  }
}

interface GsiButtonConfiguration {
  type?: "standard" | "icon";
  shape?: "rectangular" | "pill" | "circle" | "square";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
}

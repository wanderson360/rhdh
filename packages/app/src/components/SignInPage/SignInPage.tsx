import {
  SignInPage as CCSignInPage,
  ProxiedSignInPage,
  type SignInProviderConfig,
} from '@backstage/core-components';
import {
  atlassianAuthApiRef,
  bitbucketAuthApiRef,
  bitbucketServerAuthApiRef,
  configApiRef,
  githubAuthApiRef,
  gitlabAuthApiRef,
  googleAuthApiRef,
  microsoftAuthApiRef,
  oktaAuthApiRef,
  oneloginAuthApiRef,
  useApi,
  type SignInPageProps,
} from '@backstage/core-plugin-api';

import { auth0AuthApiRef, oidcAuthApiRef, samlAuthApiRef } from '../../api';

const DEFAULT_PROVIDER = 'github';

const createProviders = () =>
  new Map<string, SignInProviderConfig | string>([
    [
      'auth0',
      {
        id: 'auth0-auth-provider',
        title: 'Auth0',
        message: 'Entre com sua conta Auth0.',
        apiRef: auth0AuthApiRef,
      },
    ],
    [
      'atlassian',
      {
        id: 'atlassian-auth-provider',
        title: 'Atlassian',
        message: 'Entre com sua conta Atlassian.',
        apiRef: atlassianAuthApiRef,
      },
    ],
    [
      'microsoft',
      {
        id: 'microsoft-auth-provider',
        title: 'Microsoft',
        message: 'Entre com sua conta Microsoft.',
        apiRef: microsoftAuthApiRef,
      },
    ],
    ['azure-easyauth', 'azure-easyauth'],
    [
      'bitbucket',
      {
        id: 'bitbucket-auth-provider',
        title: 'Bitbucket',
        message: 'Entre com sua conta Bitbucket.',
        apiRef: bitbucketAuthApiRef,
      },
    ],
    [
      'bitbucketServer',
      {
        id: 'bitbucket-server-auth-provider',
        title: 'Bitbucket Server',
        message: 'Entre com sua conta Bitbucket Server.',
        apiRef: bitbucketServerAuthApiRef,
      },
    ],
    ['cfaccess', 'cfaccess'],
    [
      'github',
      {
        id: 'github-auth-provider',
        title: 'GitHub',
        message: 'Entre com sua conta GitHub.',
        apiRef: githubAuthApiRef,
      },
    ],
    [
      'gitlab',
      {
        id: 'gitlab-auth-provider',
        title: 'GitLab',
        message: 'Entre com sua conta GitLab.',
        apiRef: gitlabAuthApiRef,
      },
    ],
    [
      'google',
      {
        id: 'google-auth-provider',
        title: 'Google',
        message: 'Entre com sua conta Google.',
        apiRef: googleAuthApiRef,
      },
    ],
    ['gcp-iap', 'gcp-iap'],
    [
      'oidc',
      {
        id: 'oidc-auth-provider',
        title: 'OIDC',
        message: 'Entre com seu provedor de identidade OIDC.',
        apiRef: oidcAuthApiRef,
      },
    ],
    [
      'okta',
      {
        id: 'okta-auth-provider',
        title: 'Okta',
        message: 'Entre com sua conta Okta.',
        apiRef: oktaAuthApiRef,
      },
    ],
    ['oauth2Proxy', 'oauth2Proxy'],
    [
      'onelogin',
      {
        id: 'onelogin-auth-provider',
        title: 'OneLogin',
        message: 'Entre com sua conta OneLogin.',
        apiRef: oneloginAuthApiRef,
      },
    ],
    [
      'saml',
      {
        id: 'saml-auth-provider',
        title: 'SAML',
        message: 'Entre com seu provedor de identidade SAML.',
        apiRef: samlAuthApiRef,
      },
    ],
  ]);

export function SignInPage(props: SignInPageProps): React.JSX.Element {
  const configApi = useApi(configApiRef);
  const isDevEnv = configApi.getString('auth.environment') === 'development';

  const signInPageConfig = configApi.getOptional<string | string[]>(
    'signInPage',
  );
  const configValue = signInPageConfig ?? DEFAULT_PROVIDER;
  const providerNames = Array.isArray(configValue)
    ? configValue
    : [configValue];

  const providers = createProviders();

  const providerConfigs = providerNames
    .map(name => providers.get(name))
    .filter(
      (config): config is SignInProviderConfig | string => config !== undefined,
    );

  if (providerConfigs.length === 0) {
    const defaultProvider = providers.get(DEFAULT_PROVIDER);
    if (defaultProvider) providerConfigs.push(defaultProvider);
  }

  // If any provider is proxied (i.e. does not use SignInProviderConfig), use the first proxied provider
  if (providerConfigs.some(config => typeof config === 'string')) {
    const proxiedProvider = providerConfigs.find(
      config => typeof config === 'string',
    ) as string;
    return <ProxiedSignInPage {...props} provider={proxiedProvider} />;
  }

  const providerList = isDevEnv
    ? ['guest' as const, ...(providerConfigs as SignInProviderConfig[])]
    : (providerConfigs as SignInProviderConfig[]);

  return (
    <CCSignInPage
      {...props}
      title="Entrar"
      align="center"
      providers={providerList}
    />
  );
}

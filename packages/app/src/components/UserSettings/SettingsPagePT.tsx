import { useEffect, useState } from 'react';
import useObservable from 'react-use/esm/useObservable';

import {
  Header,
  InfoCard,
  Page,
  RoutedTabs,
  useSidebarPinState,
} from '@backstage/core-components';
import {
  AnyApiFactory,
  ApiRef,
  appThemeApiRef,
  configApiRef,
  errorApiRef,
  identityApiRef,
  ProfileInfoApi,
  SessionApi,
  SessionState,
  useApi,
  useApp,
} from '@backstage/core-plugin-api';
import { EntityRefLinks } from '@backstage/plugin-catalog-react';
import { useUserProfile } from '@backstage/plugin-user-settings';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { ProviderSetting } from '@red-hat-developer-hub/plugin-utils';

type AuthApiRef = ApiRef<ProfileInfoApi & SessionApi>;

const ProfileCardPT = () => {
  const { profile, displayName } = useUserProfile();
  const identityApi = useApi(identityApiRef);
  const errorApi = useApi(errorApiRef);

  return (
    <InfoCard title="Perfil">
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Avatar src={profile.picture} alt={displayName}>
            {displayName.charAt(0)}
          </Avatar>
        </Grid>
        <Grid item>
          <Typography variant="subtitle1">{displayName}</Typography>
          {profile.email && (
            <Typography color="textSecondary" variant="body2">
              {profile.email}
            </Typography>
          )}
          <Button
            variant="text"
            onClick={() =>
              identityApi.signOut().catch(error => errorApi.post(error))
            }
          >
            Sair
          </Button>
        </Grid>
      </Grid>
    </InfoCard>
  );
};

const IdentityCardPT = () => {
  const { backstageIdentity } = useUserProfile();

  return (
    <InfoCard title="Identidade do Backstage">
      {backstageIdentity ? (
        <List dense>
          <ListItem>
            <ListItemText
              primary="Usuário"
              secondary={
                <EntityRefLinks
                  entityRefs={[backstageIdentity.userEntityRef]}
                />
              }
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Entidades responsáveis"
              secondary={
                <EntityRefLinks
                  entityRefs={backstageIdentity.ownershipEntityRefs}
                />
              }
            />
          </ListItem>
        </List>
      ) : (
        <Typography>
          Nenhuma identidade do Backstage está disponível.
        </Typography>
      )}
    </InfoCard>
  );
};

const AppearanceCardPT = () => {
  const themeApi = useApi(appThemeApiRef);
  const themeId = useObservable(
    themeApi.activeThemeId$(),
    themeApi.getActiveThemeId(),
  );
  const themes = themeApi.getInstalledThemes();
  const { isMobile, isPinned, toggleSidebarPinState } = useSidebarPinState();

  return (
    <InfoCard title="Aparência">
      <List dense>
        <ListItem>
          <ListItemText
            primary="Tema"
            secondary="Escolha o tema visual da aplicação."
          />
          <ToggleButtonGroup
            exclusive
            size="small"
            value={themeId ?? 'auto'}
            aria-label="Tema visual"
            onChange={(_, selectedTheme: string | null) => {
              if (selectedTheme !== null) {
                themeApi.setActiveThemeId(
                  selectedTheme === 'auto' ? undefined : selectedTheme,
                );
              }
            }}
          >
            <ToggleButton value="auto" aria-label="Tema automático">
              Automático
            </ToggleButton>
            {themes.map(theme => {
              let label = theme.title || theme.id;
              if (theme.id === 'light') {
                label = 'Claro';
              } else if (theme.id === 'dark') {
                label = 'Escuro';
              }

              return (
                <ToggleButton
                  key={theme.id}
                  value={theme.id}
                  aria-label={`Tema ${label}`}
                >
                  {label}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
        </ListItem>
        {!isMobile && (
          <ListItem>
            <FormControlLabel
              control={
                <Switch
                  checked={isPinned}
                  onChange={toggleSidebarPinState}
                  inputProps={{ 'aria-label': 'Manter menu lateral aberto' }}
                />
              }
              label="Manter menu lateral aberto"
            />
          </ListItem>
        )}
      </List>
    </InfoCard>
  );
};

const GeneralPagePT = () => (
  <Grid container spacing={3}>
    <Grid item xs={12} md={6}>
      <ProfileCardPT />
    </Grid>
    <Grid item xs={12} md={6}>
      <AppearanceCardPT />
    </Grid>
    <Grid item xs={12} md={6}>
      <IdentityCardPT />
    </Grid>
  </Grid>
);

const AuthProviderItemPT = ({
  title,
  description,
  apiRef,
}: {
  title: string;
  description: string;
  apiRef: AuthApiRef;
}) => {
  const api = useApi(apiRef);
  const errorApi = useApi(errorApiRef);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    const subscription = api.sessionState$().subscribe(state => {
      if (!mounted) {
        return;
      }
      setIsSignedIn(state === SessionState.SignedIn);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [api]);

  const reportError = (error: unknown) => {
    errorApi.post(error instanceof Error ? error : new Error(String(error)));
  };

  const toggleSignIn = () => {
    const action = isSignedIn ? api.signOut() : api.signIn();
    action.catch(reportError);
  };

  return (
    <ListItem
      secondaryAction={
        <Button variant="outlined" onClick={toggleSignIn}>
          {isSignedIn ? 'Sair' : 'Entrar'}
        </Button>
      }
    >
      <ListItemText
        primary={title}
        secondary={`${description} ${isSignedIn ? 'Conectado' : 'Desconectado'}`}
      />
    </ListItem>
  );
};

const AuthProvidersPagePT = ({
  providerSettings,
}: {
  providerSettings: ProviderSetting[];
}) => {
  const app = useApp();
  const configApi = useApi(configApiRef);
  const configuredProviders =
    configApi.getOptionalConfig('auth.providers')?.keys() ?? [];
  const allProviders = Array.from(
    new Set([
      ...configuredProviders,
      ...providerSettings.map(setting => setting.provider),
    ]),
  );
  const apiFactories = app
    .getPlugins()
    .flatMap(plugin => Array.from(plugin.getApis()));
  const providerTitles: Record<string, string> = {
    atlassian: 'Atlassian',
    auth0: 'Auth0',
    bitbucket: 'Bitbucket',
    bitbucketServer: 'Bitbucket Server',
    github: 'GitHub',
    gitlab: 'GitLab',
    google: 'Google',
    microsoft: 'Microsoft',
    oidc: 'OIDC',
    okta: 'Okta',
    onelogin: 'OneLogin',
    saml: 'SAML',
  };
  const providers = allProviders.map(provider => {
    const setting = providerSettings.find(item => item.provider === provider);
    const title = providerTitles[provider] ?? setting?.title ?? provider;
    const apiFactory = apiFactories.find(
      (candidate: AnyApiFactory) =>
        candidate.api.id === provider ||
        candidate.api.id === `auth.${provider}`,
    );

    return {
      provider,
      title,
      description: `Autenticação pelo provedor ${title}.`,
      apiRef: apiFactory?.api as AuthApiRef | undefined,
    };
  });

  return (
    <InfoCard title="Provedores de autenticação">
      {providers.length > 0 ? (
        <List dense>
          {providers.map(provider =>
            provider.apiRef ? (
              <AuthProviderItemPT
                key={provider.provider}
                title={provider.title}
                description={provider.description}
                apiRef={provider.apiRef}
              />
            ) : (
              <ListItem key={provider.provider}>
                <ListItemText
                  primary={provider.title}
                  secondary={`Não foi possível carregar o provedor ${provider.title}. Verifique a configuração da aplicação.`}
                />
              </ListItem>
            ),
          )}
        </List>
      ) : (
        <Typography>
          Nenhum provedor de autenticação está configurado.
        </Typography>
      )}
    </InfoCard>
  );
};

export const SettingsPagePT = ({
  providerSettings,
}: {
  providerSettings: ProviderSetting[];
}) => (
  <Page themeId="home">
    <Header title="Configurações" />
    <RoutedTabs
      routes={[
        {
          path: 'general',
          title: 'Geral',
          children: <GeneralPagePT />,
        },
        {
          path: 'auth-providers',
          title: 'Provedores de autenticação',
          children: <AuthProvidersPagePT providerSettings={providerSettings} />,
        },
      ]}
    />
  </Page>
);

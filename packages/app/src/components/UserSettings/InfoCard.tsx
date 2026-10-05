import { KeyboardEvent, MouseEvent, useState } from 'react';

import {
  InfoCard as BSInfoCard,
  CopyTextButton,
} from '@backstage/core-components';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import buildMetadata from '../../build-metadata.json';
import { BuildInfo } from '../../types/types';

export const InfoCard = () => {
  const config = useApi(configApiRef);
  const buildInfo: BuildInfo | undefined = config.getOptional('buildInfo');

  const [showBuildInformation, setShowBuildInformation] = useState<boolean>(
    () =>
      localStorage.getItem('rhdh-infocard-show-build-information') === 'true',
  );

  const toggleBuildInformation = () => {
    setShowBuildInformation(!showBuildInformation);
    try {
      if (showBuildInformation) {
        localStorage.removeItem('rhdh-infocard-show-build-information');
      } else {
        localStorage.setItem('rhdh-infocard-show-build-information', 'true');
      }
    } catch (e) {
      // ignore
    }
  };

  const title = buildInfo?.title ?? 'Metadados do RHDH';

  let clipboardText = title;
  const buildInfoLabels: Record<string, string> = {
    'RHDH Version': 'Versão do RHDH',
    'Backstage Version': 'Versão do Backstage',
    'Last Commit': 'Último commit',
  };
  const buildInfoEntries = Object.entries(
    buildInfo?.full === false || // make it backward compatible with previous `full` config option
      buildInfo?.overrideBuildInfo === false
      ? { ...buildInfo?.card, ...buildMetadata?.card }
      : (buildInfo?.card ?? buildMetadata?.card),
  );
  const buildDetails = buildInfoEntries.map(
    ([key, value]) => `${buildInfoLabels[key] ?? key}: ${value}`,
  );
  if (buildDetails?.length) {
    clipboardText += '\n\n';
    buildDetails.forEach(text => {
      clipboardText += `${text}\n`;
    });
  }

  const filteredContent = () => {
    if (buildInfo?.card) {
      return buildDetails.slice(0, 2);
    }
    return buildInfoEntries
      .filter(([key]) => key === 'RHDH Version' || key === 'Backstage Version')
      .map(([key, value]) => `${buildInfoLabels[key] ?? key}: ${value}`);
  };

  const filteredCards = showBuildInformation ? buildDetails : filteredContent();
  // Ensure that we show always some information
  const versionInfo =
    filteredCards.length > 0 ? filteredCards.join('\n') : buildDetails[0];

  /**
   * Show all build information and automatically select them
   * when the user selects the version with the mouse.
   */
  const onMouseUp = (event: MouseEvent<HTMLSpanElement>) => {
    if (!showBuildInformation) {
      setShowBuildInformation(true);
      window.getSelection()?.selectAllChildren(event.target as Node);
    }
  };

  /**
   * Show all build information and automatically select them
   * when the user selects the version with the keyboard (tab)
   * and presses the space key or the Ctrl+C key combination.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (
      event.key === ' ' ||
      (event.key === 'c' && event.ctrlKey) ||
      (event.key === 'C' && event.ctrlKey)
    ) {
      setShowBuildInformation(true);
      window.getSelection()?.selectAllChildren(event.target as Node);
    }
  };

  return (
    <BSInfoCard
      title={title}
      action={
        // This is a workaround to ensure that the buttons doesn't increase the header size.
        <div style={{ position: 'relative' }}>
          <div
            style={{ position: 'absolute', top: -2, right: 0, display: 'flex' }}
          >
            <CopyTextButton
              text={clipboardText}
              tooltipText="Metadados copiados"
              arial-label="Copiar metadados"
            />
            <IconButton
              title={
                showBuildInformation
                  ? 'Mostrar menos informações'
                  : 'Mostrar mais informações'
              }
              onClick={toggleBuildInformation}
              style={{ width: 48 }}
            >
              {showBuildInformation ? <UnfoldLessIcon /> : <UnfoldMoreIcon />}
            </IconButton>
          </div>
        </div>
      }
    >
      <Typography
        variant="subtitle1"
        // Allow the user to select the text with the keyboard.
        tabIndex={0}
        onMouseUp={onMouseUp}
        onKeyDown={onKeyDown}
        style={{
          whiteSpace: 'pre-line',
          wordWrap: 'break-word',
          lineHeight: '2.1rem',
        }}
      >
        {versionInfo}
      </Typography>
    </BSInfoCard>
  );
};

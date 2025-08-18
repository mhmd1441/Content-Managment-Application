import * as React from 'react';
import { NavLink } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';
import MenuIcon from '@mui/icons-material/Menu';
import SourceIcon from '@mui/icons-material/Source';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const mainListItems = [
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/business_dashboard/analyticsDashboard' },
  { text: 'Add Menu', icon: <MenuIcon />, path: '/business_dashboard/addMenu' },
  { text: 'Add Content Section', icon: <SourceIcon />, path: '/business_dashboard/addContentSection' },
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, path: '/business_dashboard/Menu/LeftMenu/settings' },
  { text: 'About',    icon: <InfoRoundedIcon />,     path: '/business_dashboard/Menu/LeftMenu/about' },
  { text: 'Feedback', icon: <HelpRoundedIcon />,     path: '/business_dashboard/Menu/LeftMenu/feedback' },
];

export default function LeftMenu() {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, idx) => (
          <ListItem key={idx} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              end={item.text === 'Analytics'}
              sx={{ '&.active': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <List dense>
        {secondaryListItems.map((item, idx) => (
          <ListItem key={idx} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              sx={{ '&.active': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Stack>
  );
}

// src/components/MenuContent.jsx
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import DraftsRoundedIcon from '@mui/icons-material/DraftsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import HelpRoundedIcon from '@mui/icons-material/HelpRounded';

const mainListItems = [
  { text: 'Analytics',       icon: <AnalyticsRoundedIcon />,       path: '/super_dashboard' },
  { text: 'Menu',            icon: <MenuRoundedIcon />,            path: '/super_dashboard/menu' },
  { text: 'Content Section', icon: <ContentCopyOutlinedIcon />,    path: '/super_dashboard/content-section' },
  { text: 'Tasks',           icon: <PeopleRoundedIcon />,          path: '/super_dashboard/tasks' },
  { text: 'Published',       icon: <AssignmentTurnedInRoundedIcon />, path: '/super_dashboard/published' },
  { text: 'Drafts',          icon: <DraftsRoundedIcon />,          path: '/super_dashboard/drafts' },
];

const secondaryListItems = [
  { text: 'Settings', icon: <SettingsRoundedIcon />, path: '/super_dashboard/settings' },
  { text: 'About',    icon: <InfoRoundedIcon />,     path: '/super_dashboard/about' },
  { text: 'Feedback', icon: <HelpRoundedIcon />,     path: '/super_dashboard/feedback' },
];

export default function MenuContent() {
  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>
        {mainListItems.map((item, idx) => (
          <ListItem key={idx} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={NavLink}               
              to={item.path}                    
              end={item.text === 'Analytics'}   
              sx={{
                '&.active': {                 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
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
              sx={{
                '&.active': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
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

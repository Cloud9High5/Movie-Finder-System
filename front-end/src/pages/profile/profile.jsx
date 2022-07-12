import Container from '@material-ui/core/Container';
import Header from "../../components/header/header";
import Box from "@mui/material/Box";
import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import {ProfileCard} from "../../components/";
import {ProfileReview} from "../../components/";


function TabPanel(props) {
  const {children, value, index, ...other} = props;
  
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{p: 3}}>
          <div>{children}</div>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

function Profile() {
  const [value, setValue] = React.useState(0);
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <Container>
      <Header/>
      <Box>
        <Box
          sx={{flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 224}}
        >
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            sx={{borderRight: 1, borderColor: 'divider'}}
          >
            <Tab label="PROFILE" {...a11yProps(0)} />
            <Tab label="FOLLOWS" {...a11yProps(1)} />
            <Tab label="REVIEWS" {...a11yProps(2)} />
          </Tabs>
          <Box style={{width: '100%'}}>
            <TabPanel value={value} index={0}>
              <ProfileCard/>
            </TabPanel>
            <TabPanel value={value} index={1}>
              FOLLOWS
            </TabPanel>
            <TabPanel value={value} index={2}>
              <ProfileReview/>
            </TabPanel>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

export default Profile;
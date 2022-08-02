import Container from '@material-ui/core/Container';
import Header from "../../components/header/header";
import Box from "@mui/material/Box";
import React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import {UploadMovie, AdminBlockList, AdminBadReview} from "../../components/";
import {useParams} from "react-router-dom";
import * as helpers from "../../helpers";

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

function Admin() {
  const [value, setValue] = React.useState(0);
  const uid = useParams().uid;
  const [userInfo, setUserInfo] = React.useState({});
  
  React.useEffect(() => {
    const reqInfo = {
      headers: {
        'Authorization': helpers.hasNoToken() ? '' : 'Bearer ' + localStorage.getItem('token'),
      },
    }
    fetch('http://localhost:5000/auth/user/' + uid, reqInfo).then(async (response) => {
      const data = await response.json();
      setUserInfo(data);
      console.log(data)
    })
  }, [])
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
  return (
    <Container>
      <Header/>
      <Box>
        <Box
          sx={{flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: 400}}
        >
          <Tabs
            orientation="vertical"
            variant="scrollable"
            value={value}
            onChange={handleChange}
            aria-label="Vertical tabs example"
            sx={{borderRight: 1, borderColor: 'divider'}}
          >
            <Tab label="Upload Movie" {...a11yProps(0)} sx={{textTransform: 'none'}} style={{fontSize: "large"}}/>
            <Tab label="Blocklist" {...a11yProps(1)} sx={{textTransform: 'none'}} style={{fontSize: "large"}}/>
            <Tab label="Review with bad words" {...a11yProps(2)} sx={{textTransform: 'none'}}
                 style={{fontSize: "large"}}/>
          </Tabs>
          <Box style={{width: '100%'}}>
            <TabPanel value={value} index={0}>
              <UploadMovie/>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <AdminBlockList/>
            </TabPanel>
            <TabPanel value={value} index={2}>
              <AdminBadReview/>
            </TabPanel>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}

export default Admin;
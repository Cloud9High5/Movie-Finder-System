import Box from "@mui/material/Box";
import {Typography} from '@mui/material';
import Avatar from "@material-ui/core/Avatar";
import {Thumb} from "../../components";
import Rating from '@mui/material/Rating';
import {Divider} from "@material-ui/core";
import Grid from '@mui/material/Grid';
import {makeStyles} from "@material-ui/core/styles";
import {lightGreen} from "@material-ui/core/colors";
import React from 'react';
import {useParams} from "react-router-dom";


function FollowList() {
  const token = localStorage.getItem('token');
  const userId = useParams().uid;
  
  React.useEffect(() => {
    async function fetchFollowList() {
      const response = await fetch('http://127.0.0.1:5000/auth/user/' + userId + '/following_list');
      const data = await response.json();
      console.log(data)
    }
    
    fetchFollowList();
  }, []);
  
  return (
    <Box sx={{marginTop: 3}}>
      {"Follow list"}
    </Box>
  
  )
}

export default FollowList;
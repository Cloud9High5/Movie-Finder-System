import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { hover } from "@testing-library/user-event/dist/hover";

const style = makeStyles({
  box: {
    flexGrow: 1,
    position: "sticky",
  },
  logo: {
    flexGrow: 1,
    paddingRight: "7%",
  },
  caseSensitive: {
    textTransform: 'none',
  }
});

const NavBar = () => {
  const [token, setToken] = React.useState('');
  const path = useNavigate();
  const classes = style();
  
  function toLogin () {
    path('/login');
  }

  function toSignUp () {
    path('/signup');
  }

  return (
    <Box className={classes.box}>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" component="div" classes={classes.logo} onClick={toLogin} sx={{ transition: "color .3s ease-in-out, box-shadow .3s ease-in-out", ":hover": { boxShadow: "inset 100px 0 0 0 #54b3d6", color: "whitesmoke", textDecoration: "",} }}>
            DOUBI
          </Typography>
          <span>
            <Button color="inherit" onClick={toLogin} sx={{ textTransform: 'none' }}>Login</Button>
            <span> | </span>
            <Button color="inherit" onClick={toLogin} sx={{ textTransform: 'none' }}>Sign Up</Button>
          </span>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default NavBar;

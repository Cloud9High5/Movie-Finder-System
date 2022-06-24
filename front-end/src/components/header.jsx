import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
// import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { lightGreen } from '@material-ui/core/colors';
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";


const useStyles = makeStyles((theme) => ({
    toolbar: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: "darkgreen",
    },
    toolbarTitle: {
        flex: 1,
        fontWeight: "bold",
        fontFamily: "Roboto",
    },
    toolbarSecondary: {
        justifyContent: 'space-between',
        overflowX: 'auto',
    },
    toolbarLink: {
        padding: theme.spacing(1),
        flexShrink: 0,
    },
    green: {
        backgroundColor: lightGreen[500],
    },
}));

export default function Header () {
    const classes = useStyles();
    const path = useNavigate();
    const [token, setToken] = React.useState('');


    const toDashboard = () => {
        path('/dashboard');
    }
    const toLogin = () => {
        path('/login');
    }
    const toSignUp = () => {
        path('/signup');
    }
    const isNotLoggedIn = () => {
        // return true if token is null or empty
        return localStorage.getItem('token') === '' || localStorage.getItem('token') === null;
    }

    return (
      <React.Fragment>
          <Toolbar maxWidth="lg" className={classes.toolbar}>

              <Typography
                component="h2"
                variant="h4"
                color="inherit"
                align="left"
                noWrap
                className={classes.toolbarTitle}
                onClick={toDashboard}
              >
                  DOUBI
              </Typography>
              {/*When not login, sign up button, when login, avator*/}
              {/*<Button variant="outlined" size="small">*/}
              {/*    Sign up*/}
              {/*</Button>*/}
              {
                  isNotLoggedIn() ?
                    <Avatar className={classes.green}>N</Avatar>
                    :
                    <span>
                    <Button color="inherit" variant="outlined" onClick={toLogin}
                            sx={{ textTransform: 'none' }}>Login</Button>
                    <span> | </span>
                    <Button color="inherit" variant="outlined" onClick={toSignUp}
                            sx={{ textTransform: 'none' }}>Sign Up</Button>
                </span>
              }

          </Toolbar>

      </React.Fragment>
    );
}

Header.propTypes = {
    sections: PropTypes.array,
    title: PropTypes.string,
};
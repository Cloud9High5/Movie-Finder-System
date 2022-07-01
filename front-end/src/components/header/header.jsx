import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
// import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import {lightGreen} from '@material-ui/core/colors';
import {useNavigate} from "react-router-dom";
import Button from "@mui/material/Button";
import {Menu, MenuItem} from "@mui/material";


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

export default function Header() {
  const classes = useStyles();
  const path = useNavigate();
  const [userInfo, setUserInfo] = React.useState({});
  const [token, setToken] = React.useState(localStorage.getItem('token'));
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);


  const toDashboard = () => {
    path('/mostPopularComments');
  }

  const toLogin = () => {
    path('/login');
  }

  const toSignUp = () => {
    path('/signup');
  }
  // return true if token is null or empty
  const isNotLoggedIn = () => {
    return localStorage.getItem('token') === '' || localStorage.getItem('token') === null;
  }
  // display menu list
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  // hide menu list
  const handleClose = () => {
    setAnchorEl(null);
  };
  // when the user click logout
  const userLogout = () => {
    handleClose();
    localStorage.setItem('token', '');
    localStorage.setItem('email', '');
    setToken('');
  }

  React.useEffect(() => {
    fetch('http://127.0.0.1:5000/auth/user/' + token).then(async (response) => {
      if (response.status === 200) {
        const data = await response.json();
        setUserInfo({...data});
      } else {
        setUserInfo({});
      }
    })
  }, [token])

  // console.log(open);

  return (
    <React.Fragment>
      <Toolbar className={classes.toolbar} sx={{maxWidth: 'lg'}}>
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

        {
          isNotLoggedIn() ?
            // region UI displayed when not logged in
            <span>
                        <Button color="inherit" variant="outlined" onClick={toLogin}
                                sx={{textTransform: 'none'}}>Login</Button>
                        <span> | </span>
                        <Button color="inherit" variant="outlined" onClick={toSignUp}
                                sx={{textTransform: 'none'}}>Sign Up</Button>
                        </span>
            // endregion
            :
            // region UI displayed when logged in (display available actions)
            <span>
                            <Avatar className={classes.green}
                                    onClick={handleClick}
                            >
                            {userInfo.username}
                            </Avatar>

                                <Menu
                                  id="basic-menu"
                                  anchorEl={anchorEl}
                                  open={open}
                                  onClose={handleClose}
                                >
                                    <MenuItem onClick={handleClose}>Profile</MenuItem>
                                    <MenuItem onClick={handleClose}>My account</MenuItem>
                                    <MenuItem onClick={userLogout}>Logout</MenuItem>
                                </Menu>
                        </span>
          // endregion
        }

      </Toolbar>

    </React.Fragment>
  );
}

Header.propTypes = {
  sections: PropTypes.array,
  title: PropTypes.string,
};
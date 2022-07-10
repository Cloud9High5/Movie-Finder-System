import React from 'react';
import ModalBlock from '../../components/modalBlock/modalBlock'
import {makeStyles} from '@material-ui/styles';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Link from '@mui/material/Link';
import { useLocation, useNavigate } from 'react-router-dom';
import { Typography } from "@mui/material";

const styles = makeStyles({
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  copyright: {
    mt: 8,
    mb: 4
  },
})

function Login() {
  const classes = styles();
  const path = useNavigate();
  const [visibility, setVisibility] = React.useState(false); // modalBlock properties
  const [modalMsg, setModalMsg] = React.useState(''); // modalBlock properties
  const [states, setStates] = React.useState(
    {
      email: '',
      password: '',
      showPassword: false,
    }
  );

  const location = useLocation();
  let from;
  if (location.state != null) {
      // const {state:{from}} = location;
    from = location.state['from']
  }

  const toPreviousPage = () => {
    path(-1);
  }

  const toDashboard = () => {
    path('/mostPopularComments');
  }

  const handleChange = (prop) => (event) => {
    setStates({...states, [prop]: event.target.value});

  };

  const handleClickShowPassword = () => {
    setStates({...states, showPassword: !states.showPassword});
  };
  // send fetch request when user input something
  const validateInfo = () => {
    const emailReg = /[A-Za-z0-9]+@[A-Za-z0-9]+[.][A-Za-z0-9]+/;
    if (!emailReg.test(states.email)) {
      setModalMsg('Invalid email address, please try again.');
      setVisibility(true);
      return false;
    }
    if (states.password.length <= 0) {
      setModalMsg('Please input your password.');
      setVisibility(true);
      return false;
    }
    return true;
  }

  const submitLogin = async (e) => {
    e.preventDefault();
    if (!validateInfo()) return;
    const requestedInfo = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        email: states.email,
        password: states.password,
      }),
    };
    const response = await fetch('http://127.0.0.1:5000/auth/login', requestedInfo);
    const data = await response.json();
    if (response.status === 200) {
      console.log(data);
      localStorage.setItem('token', data.uid);  // use uid as token
      localStorage.setItem('email', states.email);  // might be used later
      if (from === undefined) {
        path('/mostPopularComments') // from sign up page to login, go to dashboard page
      } else {
        path(from) // return to the page before logging in
      }
    } else if (response.status === 401) {
      setModalMsg('User not found, you need to register a DOUBI account.');
      setVisibility(true);
    } else if (response.status === 403) {
      setModalMsg('Incorrect password, please try again.');
      setVisibility(true);
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <ModalBlock msg={modalMsg} visibility={visibility} setVisibility={setVisibility}/>
      <h1 className={'title'} onClick={toDashboard}>DOUBI</h1>
      <Typography variant="subtitle2" display="block" gutterBottom>
        Login to the DOUBI platform
      </Typography>
      <Link variant="caption" display="block" onClick={toPreviousPage} gutterBottom>
        ← Back to previous page
      </Link>
      <div className={classes.loginForm}>
        <Box component="form" noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            onChange={handleChange('email')}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={states.showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            onChange={handleChange('password')}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle password visibility"
                    onClick={handleClickShowPassword}
                  >
                    {states.showPassword ? <VisibilityOff/> : <Visibility/>}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={submitLogin}
          >
            Login
          </Button>
          <div>
            Don&apos;t have an account? &nbsp;&nbsp;
            <Link variant="body2" onClick={(e) => {
              path('/signup')
            }}>
              {'Sign Up Now'}
            </Link>
          </div>
          <div>
            Forgot password?&nbsp;&nbsp;
            <Link variant="body2" onClick={(e) => {
              path('/resetPassword')
            }}>
              {'Reset Now'}
            </Link>
          </div>
        </Box>
      </div>
    </Container>

  );
}

export default Login;
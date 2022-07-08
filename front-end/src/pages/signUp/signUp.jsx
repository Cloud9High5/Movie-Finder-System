import * as React from 'react';
import {useNavigate} from "react-router-dom";
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {makeStyles} from '@material-ui/styles';
import ModalBlock from '../../components/modalBlock/modalBlock';

const useStyles = makeStyles({
  box_1: {
    marginTop: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  box_2: {
    mt: 1
  },
  button: {
    mt: 3,
    mb: 2
  },
  copyright: {
    mt: 8,
    mb: 4
  }
});

function SignUp() {
  const path = useNavigate();
  const [visibility, setVisibility] = React.useState(false); // modalBlock properties
  const [modalMsg, setModalMsg] = React.useState(''); // modalBlock properties
  const [states, setStates] = React.useState(
    {
      email: '',
      name: '',
      password: '',
      c_password: '',
      showPassword: false,
      emailValid: true,
      nameValid: true,
      passwordValid: true,
      passwordsAreSame: true,
    }
  );

  // already have account, go to login
  const toLogin = () => {
    path('/login' , { state: {'from' : '/signup'} });
  }
  // go to mostPopularComments page
  const toDashboard = () => {
    path('/mostPopularComments');
  }
  // back to previous page
  const toPreviousPage = () => {
    path(-1);
  }

  // fill states up and wait for further process
  const handleChange = (prop) => (event) => {
    setStates({...states, [prop]: event.target.value});
  };

  const handleChangePassword = (prop) => (event) => {
    setStates({...states, [prop]: event.target.value === states.password});
  };

  const handleClickShowPassword = () => {
    setStates({
      ...states, showPassword: !states.showPassword,
    });
  };

  const validateEmail = (prop) => (event) => {
    const emailReg = /[A-Za-z0-9]+@[A-Za-z0-9]+[.][A-Za-z0-9]+/;
    setStates({...states, [prop]: emailReg.test(event.target.value)});
  }

  const validateName = (prop) => (event) => {
    setStates({...states, [prop]: event.target.value !== '' && event.target.value.replace(/ /g, '') !== ''});
  }

  const validatePassword = (prop) => (event) => {
    setStates({...states, [prop]: event.target.value.length <= 16});
  }

  const signUpUser = async (e) => {
    e.preventDefault();
    if (states.password === states.c_password) {
      if (states.emailValid && states.nameValid) {
        const requestedInfo = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            email: states.email,
            username: states.name,
            password: states.password,
          }),
          // mode: 'no-cors',
        };
        const response = await fetch('http://127.0.0.1:5000/auth/signup', requestedInfo);
        if (response.status === 201) {
          toLogin();
        } else if (response.status === 409) {
          setModalMsg('User already exist, please use another email address');
          setVisibility(true);
        }

      } else {
        setModalMsg('Please input a valid email address and user name.');
        setVisibility(true);
      }
    }
  }

  const classes = useStyles();

  return (
    <Container component="main" maxWidth={'xs'}>
      <h1 id={'appTitle'} onClick={toDashboard}>DOUBI</h1>
      <ModalBlock msg={modalMsg} visibility={visibility} setVisibility={setVisibility}/>
      <CssBaseline/>
      <Link variant="caption" display="block" onClick={toPreviousPage} gutterBottom>
        ← Back to previous page
      </Link>
      <Box className={classes.box_1}>
        <Box component="form" onSubmit={signUpUser} noValidate className={classes.box_2}>
          {/*<Box component="form" noValidate className={classes.box_2}>*/}
          <TextField
            margin="normal"
            required={states.emailValid}
            error={!states.emailValid}
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            helperText={states.emailValid ? '' : 'Please in put an valid email format (xxx@xx.xxx)'}
            onKeyUp={validateEmail('emailValid')}
            onInput={handleChange('email')}
          />
          <TextField
            margin="normal"
            required={states.nameValid}
            error={!states.nameValid}
            fullWidth
            id="name"
            label="User Name"
            name="name"
            autoComplete="name"
            helperText={states.nameValid ? '' : 'User name cannot be empty or all space'}
            onKeyUp={validateName('nameValid')}
            onInput={handleChange('name')}
          />
          <TextField
            margin="normal"
            required={states.passwordValid}
            error={!states.passwordValid}
            fullWidth
            name="password"
            label="Password"
            type={states.showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            helperText={states.passwordValid ? '' : 'Password length should less or equal to 16'}
            onKeyUp={validatePassword('passwordValid')}
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
          <TextField
            margin="normal"
            required={states.passwordsAreSame}
            error={!states.passwordsAreSame}
            fullWidth
            name="c_password"
            label='Confirm Password'
            type='password'
            id="c_password"
            autoComplete="current-password"
            onKeyUp={handleChangePassword('passwordsAreSame')}
            helperText={states.passwordsAreSame ? '' : 'Different password, please input again'}
            onInput={handleChange('c_password')}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            className={classes.button}
          >
            Sign Up
          </Button>
          Already have an account?
          <Link variant="body2" onClick={toLogin}>
            {'Login now'}
          </Link>
        </Box>
      </Box>
    </Container>
  );
}

export default SignUp;
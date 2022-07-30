import * as React from 'react';
import './signUp.css';
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
import { Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SecurityIcon from "@mui/icons-material/Security";

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
  const [states, setStates] = React.useState({
      email: '',
      name: '',
      password: '',
      c_password: '',
      showPassword: false,
      emailValid: true,
      nameValid: true,
      passwordValid: true,
      passwordsAreSame: true,
    });
  const codeRefs = [React.createRef(), React.createRef(), React.createRef(), React.createRef(), React.createRef(), React.createRef()];
  const [code, setCode] = React.useState({
    0: '',
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  });
  const [codeDisabled, setCodeDisabled] = React.useState(true);
  const [genCode, setGenCode] = React.useState('');
  const [validEmail, setValidEmail] = React.useState(false);
  const [disableField, setDisableField] = React.useState(false);
  const [codeValid, setCodeValid] = React.useState(false);

  // examine verification code
  React.useEffect(() => {
    for (let i = 0; i < 6; i++) {
      if (code[i].toString() !== genCode[i]) {
        setCodeValid(false);
        return
      }
    }
    console.log('match all code')
    setCodeValid(true);
  }, [code])
  const classes = useStyles();
  // already have account, go to login
  const toLogin = () => {
    // path('/login' , { state: {'from' : '/signup'} });
    path('/login');
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
    setValidEmail(emailReg.test(states.email));
  }

  const validateName = (prop) => (event) => {
    setStates({...states, [prop]: event.target.value !== '' && event.target.value.replace(/ /g, '') !== ''});
  }

  const validatePassword = (prop) => (event) => {
    let password = event.target.value;
    let valid = password.length >= 8 && password.length <= 12;
    valid = valid && !/[^0-9a-zA-Z]/.test(password);
    valid = valid && /\d/.test(password);
    valid = valid && /[a-z]/.test(password);
    valid = valid && /[A-Z]/.test(password);
    console.log(valid);
    setStates({...states, [prop]: valid});
  }
  // examine all inputted info and send it to backend
  const signUpUser = async (e) => {
    e.preventDefault();
    if (!codeValid){
      setModalMsg('Incorrect verification code, please try again.');
      setVisibility(true);
      return
    }
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

  const sendEmail = async () => {
    let temp = '';
    for (let i = 0; i < 6; i++) {
      const num = Math.floor(Math.random() * 10);
      temp += num;
    }
    console.log('code: ' + temp)
    setGenCode(temp);
    const response = await fetch("http://127.0.0.1:5000/auth/signup?email=" + states.email + "&verification_code=" + temp);
    if (response.status === 200) {
      setDisableField(true);
      setCodeDisabled(false);
    } else {
      setModalMsg("This email has already registered an DOUBI account.");
      setVisibility(true);
    }
  }

  const inputCode = (e, num) => {
    // const input = e.target.value;
    const input = e.key;
    if (e.keyCode === 8) {
      setCode({ ...code, [num]: '' });
      if (num > 0) {
        codeRefs[num - 1].current.focus();
      }
    } else if (!(isNaN(parseInt(input))) && (/^[0-9]$/).test(input)) {
      setCode({ ...code, [num]: input });
      if (num < 5) {
        codeRefs[num + 1].current.focus();
      }
    }
  }

  return (
    <Container component="main" maxWidth={'xs'}>
      <h1 className={'title'} onClick={toDashboard}>DOUBI</h1>
      <ModalBlock msg={modalMsg} visibility={visibility} setVisibility={setVisibility}/>
      {/*<CssBaseline/>*/}
      <Typography variant="subtitle2" display="block" gutterBottom>
        Register on the DOUBI platform
      </Typography>
      <Link variant="caption" display="block" onClick={toPreviousPage} href={'#'} gutterBottom>
        ← Back to previous page
      </Link>
        <Box noValidate className={classes.box_2}>
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
            disabled={disableField}
            error={!validEmail}
            onInput={handleChange('email')}
          />
          {
            codeDisabled ?
              <Button variant="contained" disabled={!validEmail} onClick={sendEmail} endIcon={<SendIcon/>}>
                Send
              </Button>
              :
              <>
                <Typography variant={'body2'} display="block" sx={{ paddingTop: "20px" }} gutterBottom>
                  Enter your verification code:
                </Typography>
                <Box component="form" className={'codeArea'}>
                  {
                    [0, 1, 2, 3, 4, 5].map((num) => {
                      return (
                        <TextField className={'codeBlock'} key={num} inputRef={codeRefs[num]}
                                   value={code[num]}
                                   onKeyDown={(e) => inputCode(e, num)} variant="outlined"
                                   inputProps={{ style: { textAlign: 'center' } }}/>
                      )
                    })
                  }
                </Box>
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
                  helperText={states.passwordValid ? '' : 'Password length should in 8-12, and composed by upper case letters, lower case letters and numbers'}
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
                  onClick={signUpUser}
                  className={classes.button}
                >
                  Sign Up
                </Button>
              </>
          }
          <Box>
            Already have an account?
            <Link variant="body2" onClick={toLogin} href={'#'}>
              {'Login now'}
            </Link>
          </Box>
        </Box>
    </Container>
  );
}

export default SignUp;
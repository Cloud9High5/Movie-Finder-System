import React from 'react';
import { makeStyles } from '@material-ui/styles';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Link from '@mui/material/Link';
import { useHistory } from 'react-router-dom';
import Typography from '@mui/material/Typography';

const styles = makeStyles({
  loginForm: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  copyright: {
    mt: 8,
    mb: 4
  }
})

function Login () {
  const classes = styles();
  return (
    <Container component="main" maxWidth="xs">
      <h1 id={'appTitle'}>DOUBI</h1>
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
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            // type={states.showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle password visibility"
                  >
                    {/*{states.showPassword ? <VisibilityOff/> : <Visibility/>}*/}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
          >
            Login
          </Button>
          Don&apos;t have an account?
          <Link variant="body2">
            {'Sign Up Now'}
          </Link>
        </Box>
      </div>
    </Container>

  );
}

export default Login;
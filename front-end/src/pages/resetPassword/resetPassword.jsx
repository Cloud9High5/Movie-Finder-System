import React from 'react';
import './resetPassword.css';
import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import SendIcon from '@mui/icons-material/Send';
import Link from "@mui/material/Link";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import SecurityIcon from "@mui/icons-material/Security";
import ModalBlock from "../../components/modalBlock/modalBlock";


function ResetPassword () {
    const path = useNavigate();
    const [visibility, setVisibility] = React.useState(false); // modalBlock properties
    const [modalMsg, setModalMsg] = React.useState(''); // modalBlock properties
    const [email, setEmail] = React.useState('');
    const [disableField, setDisableField] = React.useState(false);
    const [validEmail, setValidEmail] = React.useState(false);
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
    const [codeValid, setCodeValid] = React.useState(false);
    const [states, setStates] = React.useState({
            password: '',
            c_password: '',
            showPassword: false,
            passwordValid: false,
            passwordsAreSame: false,
        });

    const sendEmail = async () => {
        let temp = '';
        for (let i = 0; i < 6; i++) {
            const num = Math.floor(Math.random() * 10);
            temp += num;
        }
        console.log('code: ' + temp)
        setGenCode(temp);
        const response = await fetch("http://127.0.0.1:5000/auth/resetpwd?email=" + email + "&verification_code=" + temp);
        if (response.status === 200) {
            setDisableField(true);
            setCodeDisabled(false);
        } else {
            setModalMsg("User not found, please register an account first");
            setVisibility(true);
        }
    }

    const validateEmail = () => {
        const emailReg = /[A-Za-z0-9]+@[A-Za-z0-9]+[.][A-Za-z0-9]+/;
        setValidEmail(emailReg.test(email));
    }

    const inputCode = (e, num) => {
        const input = e.target.value;
        if (!(isNaN(parseInt(input))) && (/^[0-9]$/).test(input)) {
            setCode({ ...code, [num]: input });
            if (num < 5) {
                codeRefs[num + 1].current.focus();
            }
        }
    }

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

    const verifyCode = () => {
        if (!codeValid) {
            setModalMsg('Your verification code is incorrect!');
            setVisibility(true);
        } else {
            path('/login')
        }
    }

    const handleChange = (prop) => (event) => {
        setStates({ ...states, [prop]: event.target.value });
    };

    const validatePassword = (prop) => (event) => {
        let password = event.target.value;
        let valid = password.length >= 8 && password.length <= 12;
        valid = valid && !/[^0-9a-zA-Z]/.test(password);
        valid = valid && /\d/.test(password);
        valid = valid && /[a-z]/.test(password);
        valid = valid && /[A-Z]/.test(password);
        setStates({...states, [prop]: valid});
    }

    const handleClickShowPassword = () => {
        setStates({ ...states, showPassword: !states.showPassword });
    };

    const handleChangePassword = (prop) => (event) => {
        setStates({ ...states, [prop]: event.target.value === states.password });
    };

    return (
        <Container component="main" maxWidth="xs">
            <ModalBlock msg={modalMsg} visibility={visibility} setVisibility={setVisibility}/>

            <h1 className={'title'} onClick={() => path('/mostPopularComments')}>DOUBI</h1>
            <Typography variant="subtitle2" display="block" gutterBottom>
                Reset your account password using your code
            </Typography>
            <Link variant="caption" display="block" onClick={() => path(-1)} href={'#'} gutterBottom>
                ← Back to previous page
            </Link>
            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onInput={(e) => setEmail(e.target.value)}
                onKeyUp={validateEmail}
                disabled={disableField}
                error={!validEmail}
                helperText={validEmail ? '' : 'Email format: xxx@xx.xxx'}
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
                                                   onInput={(e) => inputCode(e, num)} variant="outlined"
                                                   inputProps={{ style: { textAlign: 'center' } }}/>
                                    )
                                })
                            }
                        </Box>
                        <TextField
                            margin="normal"
                            required={states.passwordValid}
                            error={!(states.passwordValid) && (states.password !== '')}
                            fullWidth
                            name="password"
                            label="Password"
                            type={states.showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            helperText={'Password length should in 8-12, and composed by upper case letters, lower case letters and numbers'}
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
                            error={!(states.passwordsAreSame) && (states.c_password !== '')}
                            fullWidth
                            name="c_password"
                            label='Confirm Password'
                            type='password'
                            id="c_password"
                            autoComplete="current-password"
                            onKeyUp={handleChangePassword('passwordsAreSame')}
                            helperText={states.c_password !== '' ? (states.passwordsAreSame ? '' : 'Different password, please input again') : ''}
                            onInput={handleChange('c_password')}
                        />

                        <Button variant="contained" color={'info'} sx={{ marginTop: "20px", textTransform: 'none' }} onClick={verifyCode}
                                endIcon={<SecurityIcon/>} disabled={!((states.password !== '') && (states.passwordsAreSame) && (states.passwordValid))}>
                            Reset Password
                        </Button>
                    </>
            }

        </Container>
    )
}

export default ResetPassword
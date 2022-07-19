import {Alert, Box, Button, Grid, TextField, Typography} from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import * as helpers from "../../helpers";

const validatePassword = (password) => {
  let valid = password.length >= 8 && password.length <= 12;
  valid = valid && !/[^0-9a-zA-Z]/.test(password);
  valid = valid && /\d/.test(password);
  valid = valid && /[a-z]/.test(password);
  valid = valid && /[A-Z]/.test(password);
  return valid;
}

function ProfileCard() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('display');
  const [profile, setProfile] = useState(null);
  const userID = useParams().uid;
  const [refresh, setRefresh] = useState(true);
  const [message, setMessage] = useState('');
  
  // get user info
  useEffect(() => {
    const reqInfo = {
      headers: {
        'Authorization': helpers.hasNoToken() ? '' : 'Bearer ' + localStorage.getItem('token'),
      },
    }
    if (userID) {
      fetch(`http://127.0.0.1:5000/auth/user/${userID}`, reqInfo).then(async (res) => {
        if (res.status === 200) {
          const data = await res.json();
          data.avatar = data.photo_url;
          setProfile(data);
          console.log(data)
        }
        
      })
    }
  }, [refresh, userID]);
  // update user profile
  const handleSubmit = () => {
    if (profile.old_password && !validatePassword(profile.old_password)) {
      setMessage("Password length should in 8-12, and composed by upper case letters, lower case letters and numbers");
      return;
    }
    if (profile.new_password && !validatePassword(profile.new_password)) {
      setMessage("Password length should in 8-12, and composed by upper case letters, lower case letters and numbers");
      return;
    }
    if (profile.confirmPassword && !validatePassword(profile.confirmPassword)) {
      setMessage("Password length should in 8-12, and composed by upper case letters, lower case letters and numbers");
      return;
    }
    
    if (profile.new_password !== profile.confirmPassword) {
      setMessage('New password not same as confirm password!');
      return;
    }
    
    
    fetch(`http://127.0.0.1:5000/auth/user/${userID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': helpers.hasNoToken() ? '' : 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({
        username: profile.username,
        email: profile.email,
        old_password: profile.old_password,
        new_password: profile.new_password,
        photo_url: profile.avatar
      })
    }).then(res => {
      if (res.status === 200) {
        setMessage('');
        setMode('display');
        setRefresh(!refresh);
      }
      if (res.status === 401) {
        setMessage('User not found');
      }
      if (res.status === 403) {
        setMessage('Old password is incorrect！');
      }
      
    })
  }
  // follow / black list user
  const userAction = async (action) => {
    if (helpers.hasNoToken()) {
      alert('You need to login first.');
      return
    }
    const reqInfo = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    }
    let response;
    if (action === 'black') {
      response = await fetch(`http://127.0.0.1:5000/auth/user/${userID}/black_list`, reqInfo);
    } else if (action === 'follow') {
      response = await fetch(`http://127.0.0.1:5000/auth/user/${userID}/following_list`, reqInfo);
    }
    if (response.status !== 200) {
      const data = await response.json();
      alert(data['message']);
    } else {
      setRefresh(!refresh);
    }
  }
  
  
  if (!profile) {
    return <Typography component={'span'} variant={'h4'}>Cannot fetch information of this user!</Typography>
  }
  let avatar = 'https://images.pexels.com/photos/10242803/pexels-photo-10242803.jpeg';
  if (profile.photo_url) {
    avatar = profile.photo_url;
  }
  return (
    <Box>
      {mode === 'display' && (
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography component={'span'} variant={'h3'}>Account</Typography>
          </Grid>
          <Grid item xs={4}>
            <img style={{width: '300px'}} src={avatar}/>
          </Grid>
          <Grid item xs={8}
                style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
            <Box>
              <Typography variant={'h3'}>{profile.username}</Typography>
              <Typography variant={'h6'}>{profile.email}</Typography>
            </Box>
            <Box>
              {
                profile.is_self ?
                  <Button variant={'contained'} onClick={() => setMode('edit')}>UPDATE</Button>
                  : <Box display={'flex'} justifyContent={'space-between'} width={'50%'}>
                    <Button sx={{textTransform: 'none'}} onClick={() => userAction('follow')} color={'info'}
                            variant={'outlined'} disabled={profile.blocked}>
                      <b>{profile.followed ? 'Followed' : 'Follow'}</b>
                    </Button>
                    <Button sx={{textTransform: 'none'}} onClick={() => userAction('black')} color={'error'}
                            variant={'outlined'} disabled={profile.followed}>
                      <b>{profile.blocked ? 'In your blacklist' : 'Add to blacklist'}</b>
                    </Button>
                  </Box>
              }
            </Box>
          </Grid>
        </Grid>
      )}
      {mode === 'edit' && (
        <Grid container spacing={1}>
          <Grid item xs={4}>
            {profile.avatar && <img src={profile.avatar} width={'300px'}/>}
            <input accept={'image/*'} onChange={e => {
              helpers.loadImageFromFile(e.target.files[0])
                .then(src => {
                  setProfile({
                    ...profile,
                    avatar: src,
                    avatarFile: e.target.files[0]
                  })
                })
            }} id={'upload-avatar'} type={'file'} style={{display: 'none'}}/>
            <label htmlFor={'upload-avatar'} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <AddAPhotoIcon style={{fontSize: '100px'}}/>
              <Typography>Update Avatar</Typography>
            </label>
          </Grid>
          <Grid item xs={8}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '500px'
                }}>
            <Box>
              <Box>
                <Typography>Username</Typography>
                <TextField value={profile.username}
                           onChange={e => setProfile({
                             ...profile,
                             username: e.target.value
                           })}
                           fullWidth
                           size={'small'}/>
              </Box>
              <Box marginTop={'20px'}>
                <Typography>Email</Typography>
                <TextField
                  value={profile.email}
                  onChange={e => setProfile({
                    ...profile,
                    email: e.target.value
                  })}
                  fullWidth size={'small'}/>
              </Box>
              <Box marginTop={'20px'}>
                <Typography>Old Password</Typography>
                <TextField
                  type={'password'}
                  value={profile.old_password}
                  onChange={e => setProfile({
                    ...profile,
                    old_password: e.target.value
                  })}
                  fullWidth size={'small'}/>
              </Box>
              <Box marginTop={'20px'}>
                <Typography>New Password</Typography>
                <TextField
                  type={'password'}
                  value={profile.new_password}
                  onChange={e => setProfile({
                    ...profile,
                    new_password: e.target.value
                  })}
                  fullWidth size={'small'}/>
              </Box>
              <Box marginTop={'20px'}>
                <Typography>Confirm New Password</Typography>
                <TextField
                  type={'password'}
                  value={profile.confirmPassword}
                  onChange={e => setProfile({
                    ...profile,
                    confirmPassword: e.target.value
                  })}
                  fullWidth size={'small'}/>
              </Box>
            </Box>
            {message &&
              <Box>
                <Alert severity="error">{message}</Alert>
              </Box>
            }
            <Box>
              <Button variant={'contained'}
                      onClick={() => handleSubmit()}
                      color={'secondary'}>Confirm</Button>
              <Button variant={'contained'}
                      onClick={() => {
                        setMode('display');
                        setRefresh(!refresh);
                      }}
                      style={{marginLeft: '20px'}}
                      color={'inherit'}>Cancel</Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default ProfileCard;
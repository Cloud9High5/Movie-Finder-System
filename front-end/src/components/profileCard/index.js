import {Box, Grid, Typography, Button, TextField} from '@mui/material';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { useState } from 'react';
function ProfileCard() {
  const [mode, setMode] = useState('display');
  return (
    <Box >
      {mode === 'display' && (
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <img style={{width: '300px'}} src={'https://images.pexels.com/photos/10242803/pexels-photo-10242803.jpeg'}/>
          </Grid>
          <Grid item xs={8}
                style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
            <Box>
              <Typography variant={'h3'}>Username</Typography>
              <Typography variant={'h6'}>Job@gmail.com</Typography>
            </Box>
            <Box>
              <Button variant={'contained'} onClick={() => setMode('edit')}>UPDATE</Button>
            </Box>
          </Grid>
        </Grid>
      )}
      {mode === 'edit' && (
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <Box style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <AddAPhotoIcon style={{fontSize: '100px'}}/>
              <Typography>Update Avatar</Typography>
            </Box>
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
                <TextField fullWidth size={'small'}/>
              </Box>
              <Box marginTop={'20px'}>
                <Typography>Email</Typography>
                <TextField fullWidth size={'small'}/>
              </Box>
              <Box marginTop={'20px'}>
                <Typography>Old Password</Typography>
                <TextField fullWidth size={'small'}/>
              </Box>
              <Box marginTop={'20px'}>
                <Typography>New Password</Typography>
                <TextField fullWidth size={'small'}/>
              </Box>
              <Box marginTop={'20px'}>
                <Typography>Confirm New Password</Typography>
                <TextField fullWidth size={'small'}/>
              </Box>
            </Box>
            <Box>
              <Button variant={'contained'}
                      onClick={() => setMode('display')}
                      color={'secondary'}>Confirm</Button>
              <Button variant={'contained'}
                      onClick={() => setMode('display')}
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
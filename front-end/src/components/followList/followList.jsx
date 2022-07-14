import Box from "@mui/material/Box";
import React from 'react';
import {Typography} from '@mui/material';
import Avatar from "@material-ui/core/Avatar";
import {Divider} from "@material-ui/core";
import Grid from '@mui/material/Grid';
import {useParams} from "react-router-dom";


function FollowList() {
  const token = localStorage.getItem('token');
  const userId = useParams().userID;
  
  const [follow, setFollow] = React.useState([]);
  // obtain comments from backend
  React.useEffect(() => {
    async function fetchFollowList() {
      const getFollowInfo = await fetch('http://127.0.0.1:5000/xxx' + userId);
      const followInfo = await getFollowInfo.json();
      setFollow(followInfo);
    }
    
    fetchFollowList();
  }, [userId])
  // obtain username from backend
  
  return (<Box sx={{marginTop: 3}}>
      {Array.isArray(follow) ? follow.map((review, idx) => {
        return (<Box borderTop={'1px solid gainsboro'}
                     padding={'20px 0'}
                     display={'flex'}
                     key={idx}
          >
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Box display={'flex'} alignItems={'center'}>
                  <Avatar>
                    U
                  </Avatar>
                  <Box marginLeft={'10px'}>
                    <Typography variant={'p'} color={'gray'}>
                      {review.username}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography component={'span'} variant={'body2'}>
                    {review.movieDetail}
                  </Typography>
                </Box>
                <Box display={'flex'} marginTop={'10px'}>
                  <Box marginRight={'20px'}
                    // onClick={() => likeComment(review)}
                  >
                    {/*<Thumb quantity={review.like} type={'up'}/>*/}
                  </Box>
                  <Box display={'flex'} alignItems={'center'}
                    // onClick={() => dislikeComment(review)}
                  >
                    {/*<Thumb quantity={review.dislike} type={'down'}/>*/}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )
      }) : <Box className={classes.textBar}>
        <Typography align={'center'} component={'span'} variant={'h5'}>No Comment</Typography>
      </Box>}
    </Box>)
}
export default FollowList;
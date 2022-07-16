import Box from "@mui/material/Box";
import { Chip, Typography } from '@mui/material';
import Avatar from "@material-ui/core/Avatar";
import { Thumb } from "../../components";
import Rating from '@mui/material/Rating';
import { Divider } from "@material-ui/core";
import Grid from '@mui/material/Grid';
import { makeStyles } from "@material-ui/core/styles";
import { lightGreen } from "@material-ui/core/colors";
import React from 'react';
import { useNavigate, useParams } from "react-router-dom";
import * as helpers from "../../helpers";

const useStyles = makeStyles(theme => ({
  textBar: {
    display: "flex",
    justifyContent: "center",
  },
  green: {
    backgroundColor: lightGreen[500],
  },
}));

const parseDateString = (date) => {
  const d = new Date(date * 1000);
  const temp = d.toString();
  return (temp.substring(0, 24));
}


function CommentBlock ({ props }) {
  const classes = useStyles();
  const path = useNavigate();
  const [rawComments, setRawComments] = React.useState([]);  // comments with uid and movie_id
  const [comments, setComments] = React.useState([]);  // the combined comments dataset
  const [flag, setFlag] = React.useState(false);
  const mid = useParams()['movieID'];
  const [likesDislikes, setLikesDislikes] = React.useState({});


  // obtain comments from backend
  React.useEffect(() => {
    const reqInfo = {
      method: 'GET',
      headers: {
        'Authorization': helpers.hasNoToken() ? '' : 'Bearer ' + localStorage.getItem('token'),
      },
    }
    fetch('http://127.0.0.1:5000/review?method=f_id&f_id=' + mid, reqInfo).then(async (response) => {
      const data = await response.json();
      setRawComments([...data]);
      // console.log('raw comments: ', JSON.stringify(data));
    })
  }, [flag, mid])
  // obtain username from backend
  React.useEffect(() => {
    let temp = [...rawComments];
    temp.map((t) => (
      fetch('http://127.0.0.1:5000/auth/user/' + t.u_id).then(async (response) => {
        const data = await response.json();
        t['username'] = data.username;
        setComments([...temp]);
      })
    ))
  }, [rawComments])
  // like/dislike list
  React.useEffect(() => {
    if (helpers.hasNoToken()) { return }
    const reqInfo = {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      }
    }
    fetch('http://127.0.0.1:5000/review/likes_dislikes', reqInfo).then(async (response) => {
      const data = await response.json();
      setLikesDislikes({ ...data });
    })
  }, [flag])
  // like / dislike actions
  const reviewAction = async (review, action) => {
    if (helpers.hasNoToken()) {
      alert("Please login first");
      return
    }
    const requestInfo = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
      body: JSON.stringify({
        "method": action,
        "r_id": review.r_id,
      }),
    };
    const response = await fetch('http://127.0.0.1:5000/review/rating', requestInfo);
    if (response.status === 200) {
      setFlag(!flag);
    }
  }


  return (
    <Box sx={{ marginTop: 3 }}>
      <Typography variant={'h5'}>Comments:</Typography>
      <Divider/>
      {Array.isArray(props) ? comments.map((review, idx) => {
        return (
          <Box borderTop={'1px solid gainsboro'}
               padding={'20px 0'}
               display={'flex'}
               key={idx}
          >
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Box display={'flex'} alignItems={'center'}>
                  <Avatar className={classes.green}>
                    U
                  </Avatar>
                  <Box marginLeft={'10px'}>
                    <Typography variant={'p'} color={'gray'} onClick={() => path('/profile/' + review.u_id)}
                                sx={{ cursor: 'pointer' }}>
                      {review.username}
                    </Typography>
                  </Box>
                </Box>
                <Box marginLeft={'10px'}>
                  <Rating name="read-only"
                          value={parseInt(review.rating)}
                          readOnly/>
                </Box>
                <Box>
                  <Typography component={'span'} variant={'body2'}>
                    {review.content}
                  </Typography>
                </Box>
                <Box display={'flex'} marginTop={'10px'}>
                  <Box marginRight={'20px'} onClick={() => reviewAction(review, 1)}>
                    <Thumb quantity={review.like} type={'up'}/>
                  </Box>
                  <Box display={'flex'} alignItems={'center'} onClick={() => reviewAction(review, 0)}>
                    <Thumb quantity={review.dislike} type={'down'}/>
                  </Box>
                  <Box sx={{ marginLeft: '20px' }}>
                    {
                      likesDislikes.likes.indexOf(review.r_id) !== -1 ? <Chip label={'You Liked'} color={'success'} size={'small'} variant={'outlined'} /> : <></>
                    }
                    {
                      likesDislikes.dislikes.indexOf(review.r_id) !== -1 ? <Chip label={'You Dislike'} color={'error'} size={'small'} variant={'outlined'} /> : <></>
                    }
                  </Box>
                </Box>
                <Box display={'flex'} alignItems={'flex-end'}>
                  <Typography variant={'p'} color={'gray'}>
                    Posted on: {review.created_time.substring(0, 19)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )
      }) : <Box className={classes.textBar}>
        <Typography align={'center'} component={'span'} variant={'h5'}>No Comment</Typography>
      </Box>}
    </Box>
  )
}

export default CommentBlock;
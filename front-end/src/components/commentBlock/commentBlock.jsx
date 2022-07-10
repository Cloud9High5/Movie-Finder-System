import Box from "@mui/material/Box";
import {Typography} from '@mui/material';
import Avatar from "@material-ui/core/Avatar";
import {Thumb} from "../../components";
import Rating from '@mui/material/Rating';
import {Divider} from "@material-ui/core";
import Grid from '@mui/material/Grid';
import {makeStyles} from "@material-ui/core/styles";
import {lightGreen} from "@material-ui/core/colors";
import React from 'react';
import {useParams} from "react-router-dom";

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


function CommentBlock({props}) {
  const classes = useStyles();
  const token = localStorage.getItem('token');
  const likeComment = async (review) => {
    const requestInfo = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "method": 1,
        "uid": parseInt(token),
        "review_id": parseInt(review.review_id)
      }),
    };
    console.log(requestInfo)
    const response = await fetch('http://127.0.0.1:5000/review/rating', requestInfo);
    // const result = await response.json();
    if (response.status === 400) {
      alert("Please login first")
    }
    setFlag(!flag);
  }
  const dislikeComment = async (review) => {
    const requestInfo = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "method": 0,
        "uid": parseInt(token),
        "review_id": parseInt(review.review_id)
      }),
    };
    const response = await fetch('http://127.0.0.1:5000/review/rating', requestInfo);
    const result = await response.json();
    console.log('result is: ', JSON.stringify(result));
    if (response.status !== 200) {
      alert("Please login first")
    }
    setFlag(!flag);
  }
  
  const [rawComments, setRawComments] = React.useState([]);  // comments with uid and movie_id
  // const [tempComments, setTempComments] = React.useState([]);  // comments with username and mostPopularComments id
  const [comments, setComments] = React.useState([]);  // the combined comments dataset
  const [flag, setFlag] = React.useState(false);
  const mid = useParams()['movieID'];
  // obtain comments from backend
  React.useEffect(() => {
    fetch('http://127.0.0.1:5000/review?method=movie_id&movie_id=' + mid).then(async (response) => {
      const data = await response.json();
      setRawComments([...data]);
      console.log('raw comments: ', JSON.stringify(data));
    })
  }, [flag, mid])
  // obtain username from backend
  React.useEffect(() => {
    let temp = [...rawComments];
    temp.map((t) => (
      fetch('http://127.0.0.1:5000/auth/user/' + t.uid).then(async (response) => {
        const data = await response.json();
        t['username'] = data.username;
        setComments([...temp]);
      })
    ))
  }, [rawComments])
  
  return (
    <Box sx={{marginTop: 3}}>
      <Typography variant={'h5'}>Comments:</Typography>
      <Divider/>
      {/*{Array.isArray(props) ? props.map((movieDetail, idx) => {*/}
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
                    <Typography variant={'p'} color={'gray'}>
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
                    {review.movieDetail}
                  </Typography>
                </Box>
                <Box display={'flex'} marginTop={'10px'}>
                  <Box marginRight={'20px'} onClick={() => likeComment(review)}>
                    <Thumb quantity={review.like} type={'up'}/>
                  </Box>
                  <Box display={'flex'} alignItems={'center'} onClick={() => dislikeComment(review)}>
                    <Thumb quantity={review.dislike} type={'down'}/>
                  </Box>
                </Box>
                <Box display={'flex'} alignItems={'flex-end'}>
                  <Typography variant={'p'} color={'gray'}>
                    Posted on: {parseDateString(review.release_date)}
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
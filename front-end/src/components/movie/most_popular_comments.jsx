import React from 'react';
import { Box, Grid, Typography } from '@mui/material';
import Rating from "./rating";
import { string } from "prop-types";

function MostPopularComments () {
    const [rawComments, setRawComments] = React.useState([]);  // comments with uid and movie_id
    const [tempComments, setTempComments] = React.useState([]);  // comments with user name and movie id
    const [comments, setComments] = React.useState([]);  // the combined comments dataset

    // obtain comments from backend
    React.useEffect(() => {
        fetch('http://127.0.0.1:5000/review?method=recent_top&movie_id=1&top=10&recent=10').then(async (response) => {
            const data = await response.json();
            console.log(data);
            setRawComments([...data]);
        })
    }, [])

    // obtain user name from backend
    React.useEffect(() => {
        let temp = [...rawComments];
            temp.map((t) => {
            fetch('http://127.0.0.1:5000/auth/user/' + t.uid).then(async (response) => {
                const data = await response.json();
                t['username'] = data.username;
                setTempComments([...temp]);
            })
        })
    }, [rawComments])

    // obtain movie title and poster from backend
    React.useEffect(() => {
        let temp = [...tempComments];
        temp.map((t) => {
            fetch('http://127.0.0.1:5000/films?id=' + t.movie_id).then(async (response) => {
                const data = await response.json();
                t['title'] = data.title;
                t['poster'] = data.poster;
                setComments([...temp]);
            })
        })
    }, [tempComments])

    const parseDateString = (date) => {
        const d = new Date(date * 1000);
        const temp = d.toString();
        return (temp.substring(0, 24));
    }
    // console.log(comments);

    return (
        <Box margin={'20px 14px 20px 14px'}>
            <Typography variant={'h6'}>
                The most popular comments of movies
            </Typography>

            {comments.map((comment, idx) => {
                console.log(comment)
               return (
                    <Box key={idx} padding={'20px 0'} borderTop={'1px solid gainsboro'}>
                        <Grid container spacing={2}>
                            <Grid item xs={1}>
                                <Box>
                                    <img width={'100%'}
                                         src={comment.poster}/>
                                </Box>
                            </Grid>
                            <Grid item xs={11}>
                                <Box>
                                    <Typography variant={'h6'} color={'cadetblue'}>{comment.title}</Typography>
                                </Box>
                                <Box display={'flex'} alignItems={'center'}>
                                    <Typography variant={'p'} color={'gray'}>
                                        {comment.username}
                                    </Typography>
                                    <Box marginLeft={'10px'}>
                                        <Rating rating={comment.rating}/>
                                    </Box>
                                </Box>
                                <Typography variant={'p'} color={'gray'}>
                                    Posted on: {parseDateString(comment.release_date)}
                                </Typography>
                                <Box>
                                    <Typography variant={'p'}>
                                        {comment.review}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )
            })}

            {/*{renderPopularComments()}*/}
        </Box>
    )
}

export default MostPopularComments;
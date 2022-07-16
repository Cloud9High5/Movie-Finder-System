import React from 'react';
import { Box, Button, Grid, Link, MenuItem, Select, Typography } from '@mui/material';
import Rating from '@mui/material/Rating';
import { useNavigate } from "react-router-dom";
import * as helpers from "../../helpers";

function MostPopularComments () {
    const [rawComments, setRawComments] = React.useState([]);  // comments with uid and movie_id
    const [tempComments, setTempComments] = React.useState([]);  // comments with user name and mostPopularComments id
    const [comments, setComments] = React.useState([]);  // the combined comments dataset
    const [commentNum, setCommentNum] = React.useState(10);
    const [commentMonth, setCommentMonth] = React.useState(1);
    const [flag, setFlag] = React.useState(false);
    const path = useNavigate();

    // obtain comments from backend
    React.useEffect(() => {
        const reqInfo = {
            headers: {
                'Authorization': helpers.hasNoToken() ? '' : 'Bearer ' + localStorage.getItem('token'),
            },
        }
        fetch('http://127.0.0.1:5000/review?method=recent_top&top=' + commentNum + '&recent=' + commentMonth, reqInfo).then(async (response) => {
            const data = await response.json();
            setRawComments([...data]);
        })
    }, [commentNum, commentMonth, flag])
    // obtain user name from backend
    React.useEffect(() => {
        let temp = [...rawComments];
        temp.map((t) => {
            fetch('http://127.0.0.1:5000/auth/user/' + t.u_id).then(async (response) => {
                const data = await response.json();
                t['username'] = data.username;
                setTempComments([...temp]);
            })
        })
    }, [rawComments])
    // obtain mostPopularComments title and poster from backend
    React.useEffect(() => {
        let temp = [...tempComments];
        temp.map((t) => {
            fetch('http://127.0.0.1:5000/films?f_id=' + t.f_id).then(async (response) => {
                const data = await response.json();
                t['title'] = data.title;
                t['poster'] = data.url_poster;
                setComments([...temp]);
            })
        })
    }, [tempComments])
    // transform Date object to its substring
    const parseDateString = (date) => {
        const d = new Date(date * 1000);
        const temp = d.toString();
        return (temp.substring(0, 24));
    }
    // change the number of displayed comment
    const numOfDisplayComment = () => {
        return (
            <Select
                value={commentNum}
                onChange={(e) => {
                    setCommentNum(e.target.value)
                }}
                size={'small'}
            >
                <MenuItem value={'10'}>10</MenuItem>
                <MenuItem value={'20'}>20</MenuItem>
                <MenuItem value={'30'}>30</MenuItem>
            </Select>
        )
    }
    // choose the most popular comment within 1-6 months
    const numOfDisplayMonths = () => {
        return (
            <Select
                value={commentMonth}
                onChange={(e) => {
                    setCommentMonth(e.target.value)
                }}
                size={'small'}
            >
                <MenuItem value={'1'}>1 month</MenuItem>
                <MenuItem value={'2'}>2 months</MenuItem>
                <MenuItem value={'3'}>3 months</MenuItem>
                <MenuItem value={'4'}>4 months</MenuItem>
                <MenuItem value={'5'}>5 months</MenuItem>
                <MenuItem value={'6'}>6 months</MenuItem>
            </Select>
        )
    }
    // console.log(comments);
    const isNotLoggedIn = () => {
        return localStorage.getItem('token') === '' || localStorage.getItem('token') === null;
    }
    const likeComment = async (rid) => {
        if (isNotLoggedIn()) { return }
        const requestedInfo = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                method: 1,
                u_id: localStorage.getItem('token'),
                r_id: rid,
            }),
        };
        const response = await fetch('http://127.0.0.1:5000/review/rating', requestedInfo);
        if (response.status === 200) {
            setFlag(!flag);  // force refreshing the comment block
        }
    }

    return (
        <Box margin={'20px 14px 20px 14px'}>
            <Typography variant={'h6'}>
                The most popular {numOfDisplayComment()} comments of movies within {numOfDisplayMonths()}
            </Typography>

            {comments.map((comment, idx) => {
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Link variant={'h6'} underline={'hover'} sx={{ color: 'cadetblue' }}
                                          onClick={() => {path('../movie_detail/' + comment.f_id)}} sx={{ cursor: 'pointer' }}>
                                      {comment.title}
                                    </Link>
                                    <Typography variant={'p'}>{comment.like}
                                        <Button size="small" onClick={() => likeComment(comment.r_id)}
                                                sx={{ textTransform: 'none', minWidth: 0 }}>
                                            likes
                                        </Button>
                                    </Typography>
                                </Box>
                                <Box display={'flex'} alignItems={'center'}>
                                    <Typography variant={'p'} color={'gray'} onClick={() => {path('/profile/' + comment.u_id)}} sx={{ cursor: 'pointer' }}>
                                        {comment.username}
                                    </Typography>
                                    <Box marginLeft={'10px'}>
                                        <Rating value={comment.rating} readOnly />
                                    </Box>
                                </Box>
                                <Typography variant={'p'} color={'gray'}>
                                    Posted on: {comment.created_time.substring(0,19)}
                                </Typography>
                                <Box>
                                    <Typography variant={'p'}>
                                        {comment.content}
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
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import { CardActionArea, List, ListItem, ListItemAvatar, ListItemText, Paper, Typography } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useNavigate } from "react-router-dom";
import './dashboardMovieCard.css';


function DashboardMovieCard (props) {
    const path = useNavigate();
    const [hotComments, setHotComments] = useState([]);
    const { movie_id } = props;
    useEffect(() => {
        fetch(`http://127.0.0.1:5000/review?method=f_id&f_id=${props.movie_id}`)
            .then(async (response) => {
                const comments = await response.json();
                Array.isArray(comments) ?
                    comments.map(async (comment) => {
                        const userInfo = await fetch(`http://127.0.0.1:5000/auth/user/${comment.u_id}`);
                        const data = await userInfo.json();
                        comment['username'] = data['username'];
                        setHotComments([...comments]);
                    })
                    : setHotComments([]);

            })
    }, [movie_id]);
    const renderHotComments = () => {
        const commentList = hotComments.map((hotComment, idx) => {
            return (
                <ListItem alignItems="flex-start" key={idx}>
                    <ListItemAvatar>
                        <AccountCircleIcon style={{ fontSize: '40px' }}/>
                    </ListItemAvatar>
                    <ListItemText
                        primary={hotComment['username']}
                        secondary={hotComment.content}
                        onClick={() => path('/profile/' + hotComment.u_id)}
                        sx={{ cursor: 'pointer' }}
                    />
                </ListItem>
            )
        });
        return <List style={{ maxHeight: '80%', overflow: 'auto' }}>
            {commentList}
        </List>
    }

    return (
        <Card
            className="movieCard"
            sx={{
                maxWidth: 210,
                marginLeft: 2,
                marginRight: 2,
                marginTop: 2,
                position: 'relative',
                overflow: 'visible'
            }}>
            <CardActionArea onClick={() => {
                path('../movie_detail/' + props.movie_id)
            }}>
                {/*<CardActionArea>*/}
                <CardMedia
                    component="img"
                    image={props.poster}
                    sx={{ width: 210, height: 307 }}
                    alt={'poster of ' + props.title}
                />
                <CardContent>
                    <Typography gutterBottom variant="h6" component="div" noWrap={true}>
                        {props.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        DOUBI Rating: {props.rating}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <Paper className="profile">
                <Typography variant={'h6'}>Hot Comments</Typography>
                {renderHotComments()}
            </Paper>
        </Card>
    )
}

DashboardMovieCard.propTypes = {
    title: PropTypes.string,
    rating: PropTypes.number,
    poster: PropTypes.string,
    movie_id: PropTypes.string,
}

export default DashboardMovieCard;
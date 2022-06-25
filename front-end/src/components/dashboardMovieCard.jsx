import React from 'react';
import PropTypes from 'prop-types';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import { CardActionArea, Paper, Typography, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import styles from './styles/dashboard-card.module.css';

function DashboardMovieCard (props) {
    console.log(props);
    const renderHotComments = () => {
      const hotComments = [
        {
          user: {
            username: 'xuwanyi'
          },
          comment: 'Wow, it is the best movie I saw from I was human!'
        }
      ];
      const commentList = hotComments.map(hotComment => {
        return (
          <ListItem alignItems="flex-start" key={hotComment.comment}>
            <ListItemAvatar>
              <AccountCircleIcon style={{fontSize: '40px'}}/>
            </ListItemAvatar>
            <ListItemText
              primary={hotComment.user.username}
              secondary={
                hotComment.comment
              }/>
          </ListItem>
        )
      });
      return <List>
        {commentList}
      </List>
    }
    return (
        <Card
          className={styles.movieCard}
          sx={{ maxWidth: 210,
                    marginLeft: 2,
                    marginRight: 2,
                    marginTop: 2,
                    position: 'relative',
                    overflow: 'visible'
                }}>
            <CardActionArea>
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
                        IMDB Rating: {props.rating}
                    </Typography>
                </CardContent>
            </CardActionArea>
            <Paper className={styles.profile}>
              <Typography variant={'h6'}>Hot Comments</Typography>
              {renderHotComments()}
            </Paper>
        </Card>
    )
}

DashboardMovieCard.propTypes = {
    title: PropTypes.string,
    rating: PropTypes.string,
    poster: PropTypes.string,
}

export default DashboardMovieCard;
import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from "@mui/material/Box";
import IconButton from '@mui/material/IconButton';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import {Stack} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from "@mui/material/TextField";
import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import Button from "@mui/material/Button";

export default function CommentBlock() {
    return (
        <React.Fragment>
            <Box sx={{flexGrow: 1, margin: 2}} sp>
                <TextField fullWidth label="Leave a comment" id="fullWidth"
                           InputProps={{
                               endAdornment: (
                                   <InputAdornment position="end">
                                       <IconButton color="primary">
                                           <SendIcon/>
                                       </IconButton>
                                   </InputAdornment>
                               ),
                           }}/>
            </Box>
            <Box sx={{flexGrow: 1, marginTop: 3}} sp>
                <Typography gutterBottom variant="h5" component="div">Comments:</Typography>
                <Divider/>
                <List>
                    <ListItem alignItems="center">
                        <ListItemAvatar>
                            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg"/>
                        </ListItemAvatar>
                        <ListItemText
                            primary="I cannot believe anyone could give this film less than a 6 ,I gave it an 8 because I thought it was well acted great filming and an exciting story, c'mon man what's with all the negativity."
                            secondary={<Stack direction="row" spacing={1}>
                                <IconButton aria-label="like">
                                    <ThumbUpIcon/>{"100"}
                                </IconButton>
                                <IconButton aria-label="dislike">
                                    <ThumbDownIcon/>{"12"}
                                </IconButton>
                            </Stack>}
                        />
                    </ListItem>
                    <Divider variant="inset" component="li"/>
                    <ListItem alignItems="center">
                        <ListItemAvatar>
                            <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg"/>
                        </ListItemAvatar>
                        <ListItemText
                            primary="I cannot believe anyone could give this film less than a 6 ,I gave it an 8 because I thought it was well acted great filming and an exciting story, c'mon man what's with all the negativity."
                            secondary={<Stack direction="row" spacing={1}>
                                <IconButton aria-label="like">
                                    <ThumbUpIcon/>{"100"}
                                </IconButton>
                                <IconButton aria-label="dislike">
                                    <ThumbDownIcon/>{"12"}
                                </IconButton>
                            </Stack>}
                        />
                    </ListItem>
                </List>
            </Box>
        </React.Fragment>
    );
}
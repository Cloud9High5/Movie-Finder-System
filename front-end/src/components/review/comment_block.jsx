import Box from "@mui/material/Box";
import Typography from "@material-ui/core/Typography";
import Avatar from "@material-ui/core/Avatar";
import Thumb from "../movie/Thumb";
import {Divider} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    textBar: {
        display: "flex",
        justifyContent: "center",
    }
}));

function CommentMovie({props}) {
    const classes = useStyles();
    return (
        <Box sx={{marginTop: 3}}>
            <Typography variant={'h5'}>Comments:</Typography>
            <Divider/>
            {Array.isArray(props) ? props.map((review, idx) => {
                return (
                    <Box borderTop={'1px solid gainsboro'}
                         padding={'20px 0'}
                         display={'flex'}
                         key={idx}
                         uid={review.uid}
                    >
                        <Avatar>R</Avatar>
                        <Box marginLeft={'15px'}>
                            <Typography component={'span'} variant={'body2'}>
                                {review.review}
                            </Typography>
                            <Box display={'flex'} marginTop={'10px'}>
                                <Box marginRight={'20px'}>
                                    <Thumb quantity={review.like} type={'up'}/>
                                </Box>
                                <Box display={'flex'} alignItems={'center'}>
                                    <Thumb quantity={review.dislike} type={'down'}/>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )
            }) : <Box className={classes.textBar}>
                <Typography align={'center'} component={'span'} variant={'h5'}>No Comment</Typography>
            </Box>}
        </Box>
    )
}

export default CommentMovie;
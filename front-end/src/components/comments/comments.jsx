import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import {Typography} from "@mui/material";
import Avatar from "@material-ui/core/Avatar";
// import ThumbUpIcon from '@mui/icons-material/ThumbUp';
// import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import {Thumb} from "../../components";

function Comments() {
  const renderComments = () => {
    return [1, 2, 3].map(item => {
      return (


        <Box borderTop={'1px solid gainsboro'}
             padding={'20px 0'}
             display={'flex'}>
          <Avatar>R</Avatar>
          <Box marginLeft={'15px'}>
            <Typography variant={'p'}>
              I cannot believe anyone could give this film less than a 6, I gave it an 8 because....
            </Typography>
            <Box display={'flex'} marginTop={'10px'}>
              <Box marginRight={'20px'}>
                <Thumb quantity={20} type={'up'}/>
              </Box>
              <Box display={'flex'} alignItems={'center'}>
                <Thumb quantity={10} type={'down'}/>
              </Box>
            </Box>
          </Box>
        </Box>

      )
    })
  }
  return (
    <Box>
      <Typography variant={'h5'} color={'gray'}>Comments:</Typography>
      {renderComments()}
    </Box>
  )
}

export default Comments;
import StarIcon from '@mui/icons-material/Star';
import Box from "@mui/material/Box";
function Rating({rating = 3}) {
  const renderRating = () => {
    let ratings = [];
    for (let i = 0; i < rating; i ++) {
      ratings.push(
        <StarIcon style={{color: 'orange'}}/>
      )
    }
    for (let i = 0; i < 5 - rating; i ++) {
      ratings.push(
        <StarIcon style={{color: 'gainsboro'}}/>
      )
    }
    return ratings;
  }
  return (
    <Box>
      {renderRating()}
    </Box>
  )
}

export default Rating;
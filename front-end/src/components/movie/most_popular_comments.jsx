import {Box, Grid, Typography} from '@mui/material';
import Rating from "./rating";

function MostPopularComments() {
  const renderPopularComments = () => {
    return [1, 2, 3].map(item => {
      return (
        <Box padding={'20px 0'} borderTop={'1px solid gainsboro'}>
          <Grid container spacing={2}>
            <Grid item xs={1}>
              <Box>
                <img width={'100%'} src={'https://m.media-amazon.com/images/M/MV5BNTBmZWJkNjctNDhiNC00MGE2LWEwOTctZTk5OGVhMWMyNmVhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_UX67_CR0,0,67,98_AL_.jpg'}/>
              </Box>
            </Grid>
            <Grid item xs={11}>
              <Box>
                <Typography variant={'h6'} color={'cadetblue'}>Spider Man</Typography>
              </Box>
              <Box display={'flex'} alignItems={'center'}>
                <Typography variant={'p'} color={'gray'}>
                  Sam Raimi
                </Typography>
                <Box marginLeft={'10px'}>
                  <Rating rating={4}/>
                </Box>
              </Box>
              <Box>
                <Typography variant={'p'}>
                  When bitten by a genetically modified spider, a nerdy, shy, and awkward high school student gains spider-like abilities that he eventually must use to fight evil as a superhero after tragedy befalls his family.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )
    })
  }
  return (
    <Box margin={'20px 14px 20px 14px'}>
      <Typography variant={'h6'}>
        The most popular comments of movies
      </Typography>
      {renderPopularComments()}
    </Box>
  )
}

export default MostPopularComments;
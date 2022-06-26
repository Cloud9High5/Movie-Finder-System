import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import Box from "@mui/material/Box";
import {useState} from "react";

function Thumb({type = 'up', quantity}) {
  const [active, setActive] = useState(false);
  const Icon = type === 'up' ? ThumbUpIcon : ThumbDownIcon;
  const handleClick = () => {
    setActive(!active);
  }
  return (
    <Box display={'flex'} alignItems={'center'}>
      <Icon
        onClick={handleClick}
        style={{marginRight: '5px', cursor: 'pointer', color: active ? 'orangered' : 'grey'}}/>
      <span style={{color: active ? 'orangered' : 'grey'}}>
        {quantity}
      </span>

    </Box>
  )
}
export default Thumb;
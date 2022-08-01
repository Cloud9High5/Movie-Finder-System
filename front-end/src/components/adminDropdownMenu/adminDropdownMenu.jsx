import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import * as helpers from "../../helpers";
import React from "react";


function AdminDropdownMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const deleteReview = async (review) => {
    console.log(review.props.r_id);
    if (!window.confirm('Are you sure to delete this review?')) {
      return
    }
    if (helpers.hasNoToken()) {
      return
    }
    const reqInfo = {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    }
    const response = await fetch('http://127.0.0.1:5000/review?r_id=' + review.props.r_id, reqInfo);
    const data = await response.json();
    if (response.status !== 200) {
      alert(data);
    } else {
      console.log(data);
      window.location.reload();
    }
  }
  
  const banUser = async (review) => {
    console.log(review.props.u_id);
    if (!window.confirm('Are you sure to ban this user account?')) {
      return
    }
    if (helpers.hasNoToken()) {
      return
    }
    const reqInfo = {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    }
    const response = await fetch('http://127.0.0.1:5000/auth/admin/block_list/' + review.props.u_id, reqInfo);
    const data = await response.json();
    if (response.status !== 200) {
      alert(data);
    } else {
      console.log(data);
      window.location.reload();
    }
  }
  
  return (
    <React.Fragment>
      <Box>
        <IconButton
          aria-label="more"
          id="long-button"
          aria-controls={open ? 'long-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon/>
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <MenuItem onClick={() => {
            setAnchorEl(null);
            deleteReview(props)
          }}>Delete Review</MenuItem>
          <MenuItem onClick={() => {
            setAnchorEl(null);
            banUser(props)
          }}>Ban User</MenuItem>
        </Menu></Box>
    </React.Fragment>
  )
}

export default AdminDropdownMenu;

import React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import {Rating} from "@mui/material";
import {ModalBlock} from "../../components";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function RateMovieModal(props) {
  const closeModal = () => {
    props.setVisibility(false);
  }
  return (
    <div>
      <Modal
        keepMounted
        open={props.visibility}
        onClose={closeModal}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={style}>
          <Typography id="keep-mounted-modal-title" variant="h6" component="h2">
            <Box component="fieldset" mb={1} borderColor="transparent">
              <Rating
                name="simple-controlled"
                defaultValue={0}
                size="large"
              />
            </Box>
          </Typography>
          <Typography id="keep-mounted-modal-description" sx={{mt: 2}}>
            {props.msg}
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}

function isEqual(prevProps, nextProps) {
  if (prevProps.msg !== nextProps.msg) {
    return false;
  } else if (prevProps.visibility !== nextProps.visibility) {
    return false;
  }
  return true;
}

ModalBlock.propTypes = {
  msg: PropTypes.string,
  visibility: PropTypes.bool,
  setVisibility: PropTypes.func,
}

export default React.memo(ModalBlock, isEqual);

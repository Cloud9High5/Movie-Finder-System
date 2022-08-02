import React from 'react';
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow, Typography
} from "@mui/material";
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import * as helpers from "../../helpers";

const columns = [
  { id: 'created_time', label: 'Date', minWidth: 100 },
  { id: 'title', label: 'Movie', minWidth: 30 },
  { id: 'content', label: 'Content', minWidth: 200 },
  { id: 'rating', label: 'Rating', minWidth: 30 },
  { id: 'like', label: 'Like', minWidth: 30 },
  { id: 'dislike', label: 'Dislike', minWidth: 30 },
  { id: 'operation', label: 'Operation', minWidth: 30 },
];

function ProfileReview () {
  const uid = useParams().uid;
  const path = useNavigate();
  const [targetInfo, setTargetInfo] = React.useState({});
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rawReviews, setRawReviews] = React.useState([]);
  const [reviews, setReviews] = React.useState([]);
  const [flag, setFlag] = React.useState(true);
  const [likesDislikes, setLikesDislikes] = React.useState({likes: [], dislikes: []});

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // whether this page displays the user's own info
  const isSelf = () => {
    return targetInfo.is_self;
  }

  const isNotLoggedIn = () => {
    return localStorage.getItem('token') === '' || localStorage.getItem('token') === null;
  }

  // get all review of target user
  React.useEffect(() => {
    const reqInfo = {
      headers: {
        'Authorization': helpers.hasNoToken() ? '' : 'Bearer ' + localStorage.getItem('token'),
      },
    }
    fetch("http://localhost:5000/review?method=u_id&u_id=" + uid, reqInfo).then(async (response) => {
      const data = await response.json();
      Array.isArray(data) ?
        setRawReviews(data)
        :
        setRawReviews([])
    })
  }, [flag])

  // update like / dislike list
  React.useEffect(() => {
    if (helpers.hasNoToken()) {return}
    const reqInfo = {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    }
    fetch('http://127.0.0.1:5000/review/likes_dislikes', reqInfo).then(async (response) => {
      const data = await response.json();
      setLikesDislikes({ ...data });
    })
  }, [flag])
  // fetch movie info of each review
  React.useEffect(() => {
    for (const r of rawReviews) {
      const reqInfo = {
        headers: {
          'Authorization': helpers.hasNoToken() ? '' : 'Bearer ' + localStorage.getItem('token'),
        },
      }
      fetch('http://localhost:5000/films?f_id=' + r.f_id, reqInfo).then(async (response) => {
        const data = await response.json();
        r.title = data.title;
        setReviews([...rawReviews]);
      })
    }
  }, [rawReviews])

  React.useEffect(() => {
    const reqInfo = {
      headers: {
        'Authorization': helpers.hasNoToken() ? '' : 'Bearer ' + localStorage.getItem('token'),
      },
    }
    fetch(`http://127.0.0.1:5000/auth/user/${uid}`, reqInfo).then(async (response) => {
      const data = await response.json();
      setTargetInfo({...data});
    })
  }, [])

  const deleteReview = async (rid) => {
    const reqInfo = {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    }
    const response = await fetch('http://127.0.0.1:5000/review?r_id=' + rid, reqInfo);
    if (response.status === 200) {
      setFlag(!flag)
    }
  }

  const reviewAction = async (rid, action) => {
    if (isNotLoggedIn()) {
      return
    }
    const requestedInfo = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
      body: JSON.stringify({
        method: action,
        r_id: rid,
      }),
    };
    const response = await fetch('http://127.0.0.1:5000/review/rating', requestedInfo);
    if (response.status === 200) {
      setFlag(!flag);  // force refreshing the comment block
    }
  }

  return (
    <>
      <h1>{isSelf() ? 'Your' : targetInfo.username + '\'s'} Review</h1>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 640 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, idx) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={idx}>
                      {columns.map((column) => {
                        const value = row[column.id];
                        if (column.id === 'created_time') {
                          return (
                            <TableCell key={column.id}>
                              {row[column.id].substring(0, 19)}
                            </TableCell>
                          )
                        } else if (column.id === 'title') {
                          return (
                            <TableCell key={column.id}>
                              <Typography sx={{ cursor: 'pointer' }} onClick={() => path('../movie_detail/' + row.f_id)}>{value}</Typography>
                            </TableCell>
                          )
                        } else if (column.id === 'operation') {
                          return (
                            <TableCell key={column.id}>
                              {
                                isSelf() ?
                                  <Button variant={'outlined'} color={'warning'} endIcon={<RemoveCircleOutlineIcon/>}
                                          sx={{ textTransform: 'none' }}
                                          onClick={() => deleteReview(row.r_id)}>Delete</Button>
                                  :
                                  <>
                                    <Button
                                      variant={likesDislikes.likes.indexOf(row.r_id) === -1 ? 'outlined' : 'contained'}
                                      color={'info'}
                                      endIcon={<ThumbUpIcon sx={{ marginLeft: '12px' }}/>}
                                      onClick={() => reviewAction(row.r_id, 1)}
                                      sx={{ width: '80px', marginBottom: '5px', textTransform: 'none' }}
                                      disabled={likesDislikes.dislikes.indexOf(row.r_id) !== -1}
                                    >
                                      {likesDislikes.likes.indexOf(row.r_id) === -1 ? 'Like' : 'Liked'}
                                    </Button>
                                    <Button
                                      variant={likesDislikes.dislikes.indexOf(row.r_id) === -1 ? 'outlined' : 'contained'}
                                      color={'error'}
                                      endIcon={<ThumbDownAltIcon/>}
                                      onClick={() => reviewAction(row.r_id, 0)}
                                      sx={{ width: '80px', marginTop: '5px', textTransform: 'none' }}
                                      disabled={likesDislikes.likes.indexOf(row.r_id) !== -1}
                                    >
                                      {likesDislikes.dislikes.indexOf(row.r_id) === -1 ? 'Dislike' : 'Disliked'}
                                    </Button>
                                  </>
                              }
                            </TableCell>
                          );
                        }
                        else {
                          return (
                            <TableCell key={column.id} align={column.align}>
                              {column.format && typeof value === 'number'
                                ? column.format(value)
                                : value}
                            </TableCell>
                          );
                        }
                      })}
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={reviews.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </>
  )
}

export default ProfileReview
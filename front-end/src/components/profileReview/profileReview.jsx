import React from 'react';
import { useParams } from "react-router-dom";
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow
} from "@mui/material";

const columns = [
    { id: 'release_date', label: 'Date', minWidth: 100 },
    { id: 'movieDetail', label: 'Content', minWidth: 200 },
    { id: 'rating', label: 'Rating', minWidth: 100 },
    { id: 'like', label: 'Like', minWidth: 30 },
    { id: 'dislike', label: 'Dislike', minWidth: 30 },
    { id: 'operation', label: 'Operation', minWidth: 30 },
];

function ProfileReview () {
    const uid = useParams().uid;
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);
    const [data, setData] = React.useState([]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    React.useEffect(() => {
        fetch("http://localhost:5000/review?method=uid&uid=" + uid).then(async (response) => {
            const data = await response.json();
            for (const review of data) {
                review['release_date'] = new Date(review['release_date'] * 1000).toString().substring(0, 24);
            }
            setData(data);
        })
    }, [])

    return (
        <>
            <h1>ProfileReview</h1>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 440 }}>
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
                            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => {
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                            {columns.map((column) => {
                                                const value = row[column.id];
                                                if (column.id === 'operation') {
                                                    return null;
                                                }
                                                return (
                                                    <TableCell key={column.id} align={column.align}>
                                                        {column.format && typeof value === 'number'
                                                            ? column.format(value)
                                                            : value}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell>
                                                <Button variant={'outlined'}>btn</Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={data.length}
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
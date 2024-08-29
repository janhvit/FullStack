
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Attendance.css'; 
 
const Attendance = () => {
    const [date, setDate] = useState(new Date());
    const [status, setStatus] = useState('present');
    const [attendances, setAttendances] = useState([]);
    const [markedDates, setMarkedDates] = useState({});
    const navigate = useNavigate();
 
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const formattedDate = date.toLocaleDateString('en-CA'); 
            await axios.post(
                'http://localhost:5000/attendance/attendances',
                { date: formattedDate, status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            fetchAttendances(); 
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    };
 
    
    const fetchAttendances = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.get(
                'http://localhost:5000/attendance/attendances/me',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setAttendances(response.data);
            const dates = {};
            response.data.forEach((att) => {
                dates[att.date] = { status: att.status, verified: att.verified };
            });
            setMarkedDates(dates);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };
 
        const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateStr = date.toLocaleDateString('en-CA');
            const attendance = markedDates[dateStr];
            if (attendance) {
                if (attendance.verified) {
                    return attendance.status === 'present'
                        ? 'verified-present'
                        : 'verified-absent';
                } else {
                    return attendance.status;
                }
            }
        }
        return null;
    };
 
    useEffect(() => {
        fetchAttendances(); 
    }, []);
 
    return (
        <div className="container mt-5">
            <div className="card p-4 shadow-sm">
                <h1 className="mb-4">Mark Attendance</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3 date-picker-container">
                        <label htmlFor="date"><h4>Date : </h4></label>
                    <DatePicker
                        selected={date}
                        onChange={(date) => setDate(date)}
                        className="form-control"
                        id="date"
                        dateFormat="yyyy-MM-dd"
                        popperPlacement="bottom-end" 
                    />

                    </div>
                    <div className="form-group mb-3">
                            <label htmlFor="status"><h4>Status: </h4></label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="form-control form-control-sm"
                                id="status"
                                style={{ width: '175px' }}  
                            >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                            </select>
                        </div>
                    <button type="submit" className="btn btn-primary">
                        Mark Attendance
                    </button>
                </form>
            </div>
            <div className="card mt-5 p-4 shadow-sm">
                <h2 className="mb-4">My Attendance</h2>
                <Calendar tileClassName={tileClassName} />
            </div>
        </div>
    );
};
 
export default Attendance;
 
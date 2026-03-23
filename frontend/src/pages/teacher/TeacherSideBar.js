import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import { useSelector } from 'react-redux';
import PeopleIcon from '@mui/icons-material/People';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradingIcon from '@mui/icons-material/Grading';
import AssessmentIcon from '@mui/icons-material/Assessment';

const TeacherSideBar = () => {
    const { currentUser } = useSelector((state) => state.user);
    const sclassName = currentUser.teachSclass

    const location = useLocation();
    return (
        <>
            <React.Fragment>
                <ListItemButton component={Link} to="/">
                    <ListItemIcon>
                        <HomeIcon color={location.pathname === ("/" || "/Teacher/dashboard") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/class">
                    <ListItemIcon>
                        <ClassOutlinedIcon color={location.pathname.startsWith("/Teacher/class") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary={`Class ${sclassName.sclassName}`} />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/classes">
                    <ListItemIcon>
                        <ClassOutlinedIcon color={location.pathname.startsWith("/Teacher/classes") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="My Classes" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/students">
                    <ListItemIcon>
                        <PeopleIcon color={location.pathname.startsWith("/Teacher/students") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Students" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/attendance">
                    <ListItemIcon>
                        <CoPresentIcon color={location.pathname.startsWith("/Teacher/attendance") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Attendance" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/assignments">
                    <ListItemIcon>
                        <AssignmentIcon color={location.pathname.startsWith("/Teacher/assignments") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Assignments" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/exams">
                    <ListItemIcon>
                        <GradingIcon color={location.pathname.startsWith("/Teacher/exams") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Exams" />
                </ListItemButton>
                <ListItemButton component={Link} to="/teacher/marks-upload">
                    <ListItemIcon>
                        <GradingIcon color={location.pathname.startsWith("/teacher/marks-upload") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Upload Marks" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/reports">
                    <ListItemIcon>
                        <AssessmentIcon color={location.pathname.startsWith("/Teacher/reports") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Reports" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Teacher/complain">
                    <ListItemIcon>
                        <AnnouncementOutlinedIcon color={location.pathname.startsWith("/Teacher/complain") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Complain" />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    User
                </ListSubheader>
                <ListItemButton component={Link} to="/Teacher/profile">
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={location.pathname.startsWith("/Teacher/profile") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Profile" />
                </ListItemButton>
                <ListItemButton component={Link} to="/logout">
                    <ListItemIcon>
                        <ExitToAppIcon color={location.pathname.startsWith("/logout") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </React.Fragment>
        </>
    )
}

export default TeacherSideBar
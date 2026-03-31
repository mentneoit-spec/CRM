import * as React from 'react';
import { Divider, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AnnouncementOutlinedIcon from '@mui/icons-material/AnnouncementOutlined';
import ClassOutlinedIcon from '@mui/icons-material/ClassOutlined';
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined';
import ReportIcon from '@mui/icons-material/Report';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import GroupIcon from '@mui/icons-material/Group';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

const SideBar = () => {
    const location = useLocation();
    return (
        <>
            <React.Fragment>
                <ListItemButton component={Link} to="/">
                    <ListItemIcon>
                        <HomeIcon color={location.pathname === ("/" || "/Admin/dashboard") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/classes">
                    <ListItemIcon>
                        <ClassOutlinedIcon color={location.pathname.startsWith('/Admin/classes') ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Classes" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/subjects">
                    <ListItemIcon>
                        <AssignmentIcon color={location.pathname.startsWith("/Admin/subjects") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Subjects" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/teachers">
                    <ListItemIcon>
                        <SupervisorAccountOutlinedIcon color={location.pathname.startsWith("/Admin/teachers") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Teachers" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/students">
                    <ListItemIcon>
                        <PersonOutlineIcon color={location.pathname.startsWith("/Admin/students") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Students" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/notices">
                    <ListItemIcon>
                        <AnnouncementOutlinedIcon color={location.pathname.startsWith("/Admin/notices") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Notices" />
                </ListItemButton>
                <ListItemButton component={Link} to="/Admin/complains">
                    <ListItemIcon>
                        <ReportIcon color={location.pathname.startsWith("/Admin/complains") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Complains" />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/fees">
                    <ListItemIcon>
                        <AssignmentIcon color={location.pathname.startsWith("/admin/fees") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Fees" />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/receipts">
                    <ListItemIcon>
                        <ReceiptIcon color={location.pathname.startsWith("/admin/receipts") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Receipts & Payments" />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/transport">
                    <ListItemIcon>
                        <AssignmentIcon color={location.pathname.startsWith("/admin/transport") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Transport" />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/results">
                    <ListItemIcon>
                        <AssignmentIcon color={location.pathname.startsWith("/admin/results") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Results" />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/admissions">
                    <ListItemIcon>
                        <PersonOutlineIcon color={location.pathname.startsWith("/admin/admissions") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Admissions" />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/admission-team">
                    <ListItemIcon>
                        <GroupIcon color={location.pathname.startsWith("/admin/admission-team") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Admission Team" />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/marks-upload">
                    <ListItemIcon>
                        <CloudUploadIcon color={location.pathname.startsWith("/admin/marks-upload") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Upload Marks" />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/hr">
                    <ListItemIcon>
                        <PeopleAltIcon color={location.pathname.startsWith("/admin/hr") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="HR Management" />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/analytics">
                    <ListItemIcon>
                        <BarChartIcon color={location.pathname.startsWith("/admin/analytics") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Analytics" />
                </ListItemButton>
                <ListItemButton component={Link} to="/admin/reports">
                    <ListItemIcon>
                        <ReportIcon color={location.pathname.startsWith("/admin/reports") ? 'primary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText primary="Reports" />
                </ListItemButton>
            </React.Fragment>
            <Divider sx={{ my: 1 }} />
            <React.Fragment>
                <ListSubheader component="div" inset>
                    User
                </ListSubheader>
                <ListItemButton component={Link} to="/Admin/profile">
                    <ListItemIcon>
                        <AccountCircleOutlinedIcon color={location.pathname.startsWith("/Admin/profile") ? 'primary' : 'inherit'} />
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

export default SideBar

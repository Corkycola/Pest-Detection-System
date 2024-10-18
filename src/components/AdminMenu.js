import React from 'react';
import { AppBar, Tabs, Tab } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminMenu.css';

const AdminMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [value, setValue] = React.useState(location.pathname);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        navigate(newValue);
    };

    return (
        <AppBar position="static" className="appBar">
            <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                className="tabs"
            >
                <Tab label="Admin Panel" value="/admin-panel" className="tab" classes={{ selected: 'tabSelected' }} />
                <Tab label="Pest Wiki" value="/admin-pestwiki" className="tab" classes={{ selected: 'tabSelected' }} />
            </Tabs>
        </AppBar>
    );
};

export default AdminMenu;

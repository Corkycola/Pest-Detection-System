import React, { useMemo } from 'react';
import { AppBar, Tabs, Tab } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import './UserMenu.css';

const UserMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const validTabs = useMemo(() => ['/home', '/user-panel', '/user-pestwiki'], []); // Add all valid tab paths here

    const currentPath = validTabs.includes(location.pathname) ? location.pathname : '/home';
    const [value, setValue] = React.useState(currentPath);

    const handleChange = (event, newValue) => {
        setValue(newValue);
        navigate(newValue);
    };

    React.useEffect(() => {
        if (validTabs.includes(location.pathname)) {
            setValue(location.pathname);
        }
    }, [location.pathname, validTabs]);

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
                <Tab label="Home" value="/home" className="tab" classes={{ selected: 'tabSelected' }} />
                <Tab label="Detection Overview" value="/user-panel" className="tab" classes={{ selected: 'tabSelected' }} />
                <Tab label="Pest Wiki" value="/user-pestwiki" className="tab" classes={{ selected: 'tabSelected' }} />
            </Tabs>
        </AppBar>
    );
};

export default UserMenu;

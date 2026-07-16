// Redirects to the paid-social login when there is no active session, and
// (optionally) bounces to the correct dashboard when the active role doesn't
// match the screen. Returns the current session user.
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, getUser, getActiveRole, routeForRole } from '../api/session';

export default function usePaidGuard(expectedRole) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!getToken()) {
            navigate('/paid/login', { replace: true });
            return;
        }
        const role = getActiveRole();
        if (expectedRole && role && role !== String(expectedRole).toUpperCase()) {
            navigate(routeForRole(role), { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return getUser();
}

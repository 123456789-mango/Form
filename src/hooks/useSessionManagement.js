import { useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const INACTIVITY_TIME = 15 * 60 * 1000; // 15 minutes
const REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry

export function useSessionManagement(onLogout) {
    const inactivityTimerRef = useRef(null);
    const refreshTimerRef = useRef(null);

    // Reset inactivity timer
    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
        }

        inactivityTimerRef.current = setTimeout(() => {
            handleInactivityLogout();
        }, INACTIVITY_TIME);
    }, []);

    // Handle inactivity logout
    const handleInactivityLogout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        if (onLogout) onLogout();
        window.location.href = '/login?reason=inactive';
    }, [onLogout]);

    // Refresh access token
    const refreshAccessToken = useCallback(async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                handleInactivityLogout();
                return;
            }

            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
                { refreshToken }
            );

            localStorage.setItem('token', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            resetInactivityTimer();

            // Schedule next refresh
            scheduleTokenRefresh();
        } catch (err) {
            handleInactivityLogout();
        }
    }, [resetInactivityTimer, handleInactivityLogout]);

    // Schedule token refresh
    const scheduleTokenRefresh = useCallback(() => {
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current);
        }

        // Refresh token every 55 minutes (before 1-hour expiry)
        refreshTimerRef.current = setTimeout(() => {
            refreshAccessToken();
        }, 55 * 60 * 1000);
    }, [refreshAccessToken]);

    // Track user activity
    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

        const handleActivity = () => {
            resetInactivityTimer();
        };

        events.forEach(event => {
            document.addEventListener(event, handleActivity, true);
        });

        // Initial timer setup
        resetInactivityTimer();
        scheduleTokenRefresh();

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, handleActivity, true);
            });
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
        };
    }, [resetInactivityTimer, scheduleTokenRefresh]);

    return {
        refreshAccessToken,
        handleInactivityLogout
    };
}

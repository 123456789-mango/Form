import { useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const INACTIVITY_TIME = 15 * 60 * 1000;   // 15 minutes idle -> logout
const REFRESH_INTERVAL = 55 * 60 * 1000;  // refresh before a 1-hour token expiry

export function useSessionManagement(onLogout) {
    const inactivityTimerRef = useRef(null);
    const refreshTimerRef = useRef(null);
    const onLogoutRef = useRef(onLogout);
    const activeRef = useRef(true); // flips false on any logout, guards stale async work

    useEffect(() => { onLogoutRef.current = onLogout; }, [onLogout]);

    const clearTimers = useCallback(() => {
        clearTimeout(inactivityTimerRef.current);
        clearTimeout(refreshTimerRef.current);
    }, []);

    // Exposed so manual logout can neutralize timers + in-flight refreshes too
    const stopSession = useCallback(() => {
        activeRef.current = false;
        clearTimers();
    }, [clearTimers]);

    const handleInactivityLogout = useCallback(() => {
        if (!activeRef.current) return;
        stopSession();
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        onLogoutRef.current?.();
        window.location.href = '/login?reason=inactive';
    }, [stopSession]);

    const resetInactivityTimer = useCallback(() => {
        if (!activeRef.current) return;
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(handleInactivityLogout, INACTIVITY_TIME);
    }, [handleInactivityLogout]);

    const refreshAccessToken = useCallback(async () => {
        if (!activeRef.current) return;
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) return handleInactivityLogout();

            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
                { refreshToken }
            );

            if (!activeRef.current) return; // logged out while this was in flight
            localStorage.setItem('token', res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.refreshToken);
            scheduleTokenRefresh();
        } catch (err) {
            if (activeRef.current) handleInactivityLogout();
        }
    }, [handleInactivityLogout]);

    const scheduleTokenRefresh = useCallback(() => {
        if (!activeRef.current) return;
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = setTimeout(refreshAccessToken, REFRESH_INTERVAL);
    }, [refreshAccessToken]);

    useEffect(() => {
        activeRef.current = true;
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        const handleActivity = () => resetInactivityTimer();
        events.forEach(e => document.addEventListener(e, handleActivity, true));

        resetInactivityTimer();
        scheduleTokenRefresh();

        return () => {
            events.forEach(e => document.removeEventListener(e, handleActivity, true));
            clearTimers();
        };

    }, []);

    return { refreshAccessToken, handleInactivityLogout, stopSession };
}
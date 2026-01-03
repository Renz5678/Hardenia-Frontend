// utils/api.js
import { supabase } from '../lib/supabaseClient';

export async function authenticatedFetch(url, options = {}) {
    const { data: { session } } = await supabase.auth.getSession();

    let response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
            ...options.headers,
        }
    });

    // If 401, refresh token and retry once
    if (response.status === 401) {
        console.log('Token expired, refreshing...');
        const { data: { session: newSession } } = await supabase.auth.refreshSession();

        if (newSession) {
            response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${newSession.access_token}`,
                    ...options.headers,
                }
            });
        }
    }

    return response;
}
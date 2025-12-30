/*
 * ThoughtSwap
 * Copyright (C) 2026 ThoughtSwap
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import axios from 'axios';

const BASE_URL = 'http://localhost:5173';

async function runSmokeTest() {
    console.log('Starting Smoke Tests...');

    try {
        try {
            await axios.get(`${BASE_URL}/`);
            console.log('Root URL is reachable');
        } catch (e: any) {
            // If it redirects (302) that is also a success for reachability
            if (e.response && e.response.status === 302) {
                console.log('Root URL is reachable (Redirects to Canvas)');
            } else {
                throw e;
            }
        }

        console.log('All Smoke Tests Passed');
        process.exit(0);
    } catch (error: any) {
        console.error('Smoke Test Failed:', error.message);
        process.exit(1);
    }
}

runSmokeTest();

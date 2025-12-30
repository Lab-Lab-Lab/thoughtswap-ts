/*
 * ThoughtSwap
 * Copyright (C) 2026 ThoughtSwap
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
import { io } from 'socket.io-client';

export const socket = io({
    path: '/socket.io',
    autoConnect: false, // We connect manually when the user joins/logs in
});

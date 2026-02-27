import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.REACT_APP_API_BASE_URL || '';

const baseQuery = fetchBaseQuery({
    baseUrl: `${API_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
        // Try to get token from state first, fallback to localStorage
        const token = getState().auth?.token || localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && (result.error.status === 401 || result.error.status === 403)) {
        // Auto-logout on token expiry or invalid token
        api.dispatch({ type: 'auth/logout' });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-expired'));

        // Redirect to login only if not already on it
        if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login?expired=true';
        }
    }
    return result;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        'Structure', 'Events', 'Buildings', 'Admins', 'Users',
        'Bookings', 'Comments', 'LiveLinks', 'PasswordRequests',
        'CheckinData', 'Allocations', 'Notifications', 'ShortLinks',
        'Rooms', 'People'
    ],
    endpoints: (builder) => ({
        getStructure: builder.query({
            query: () => '/structure',
            providesTags: ['Structure'],
        }),
        getEvents: builder.query({
            query: () => '/events',
            providesTags: ['Events'],
        }),
        getEventById: builder.query({
            query: (id) => `/events/${id}`,
            providesTags: (result, error, id) => [{ type: 'Events', id }],
        }),
        getBuildings: builder.query({
            query: () => '/buildings',
            providesTags: ['Buildings'],
        }),
        getAdmins: builder.query({
            query: () => '/admin',
            providesTags: ['Admins'],
        }),
        getAllUsers: builder.query({
            query: () => '/admin/all-users',
            providesTags: ['Users'],
        }),
        getAllBookings: builder.query({
            query: () => '/bookings',
            providesTags: ['Bookings'],
        }),
        getRooms: builder.query({
            query: () => '/rooms',
            providesTags: ['Rooms'],
        }),
        getAllPeople: builder.query({
            query: () => '/people',
            providesTags: ['People'],
        }),
        getMyBookings: builder.query({
            query: () => '/bookings/my-bookings',
            providesTags: ['Bookings'],
        }),
        getComments: builder.query({
            query: () => '/comments',
            providesTags: ['Comments'],
        }),
        getAllComments: builder.query({
            query: () => '/comments/all',
            providesTags: ['Comments'],
        }),
        getLiveLinks: builder.query({
            query: () => '/satsang/live-links',
            providesTags: ['LiveLinks'],
        }),
        getLiveLinksByEvent: builder.query({
            query: (eventId) => `/satsang/live-links/event/${eventId}`,
            providesTags: (result, error, eventId) => [{ type: 'LiveLinks', id: eventId }],
        }),
        getPendingPasswordRequests: builder.query({
            query: () => '/password-requests/pending',
            providesTags: ['PasswordRequests'],
        }),
        getCheckinData: builder.query({
            query: (params) => {
                return {
                    url: '/people/checkin-data',
                    params,
                };
            },
            providesTags: ['CheckinData'],
        }),
        getPaginatedPeople: builder.query({
            query: (params) => ({
                url: '/people/paginated',
                params,
            }),
            providesTags: ['Allocations'],
        }),
        getNotifications: builder.query({
            query: () => '/notifications',
            providesTags: ['Notifications'],
        }),
        getUnreadNotificationCount: builder.query({
            query: () => '/notifications/unread-count',
            providesTags: ['Notifications'],
        }),
        getShortLinks: builder.query({
            query: () => '/admin/short-links',
            providesTags: ['ShortLinks'],
        }),
        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `/admin/delete-admin/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users', 'Admins'],
        }),
    }),
});

export const {
    useGetStructureQuery,
    useGetEventsQuery,
    useGetEventByIdQuery,
    useGetBuildingsQuery,
    useGetAdminsQuery,
    useGetAllUsersQuery,
    useGetAllBookingsQuery,
    useGetRoomsQuery,
    useGetAllPeopleQuery,
    useGetMyBookingsQuery,
    useGetCommentsQuery,
    useGetAllCommentsQuery,
    useGetLiveLinksQuery,
    useGetLiveLinksByEventQuery,
    useGetPendingPasswordRequestsQuery,
    useGetCheckinDataQuery,
    useGetPaginatedPeopleQuery,
    useGetNotificationsQuery,
    useGetUnreadNotificationCountQuery,
    useGetShortLinksQuery,
    useDeleteUserMutation
} = apiSlice;

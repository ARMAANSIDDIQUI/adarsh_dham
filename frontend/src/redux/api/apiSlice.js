import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.REACT_APP_API_BASE_URL || '';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api`,
        prepareHeaders: (headers) => {
            const token = localStorage.getItem('token');
            if (token) {
                headers.set('x-auth-token', token);
            }
            return headers;
        },
    }),
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
    useGetShortLinksQuery
} = apiSlice;

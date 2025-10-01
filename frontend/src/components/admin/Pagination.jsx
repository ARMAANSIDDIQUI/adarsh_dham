import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Pagination = ({ pagination, onPageChange, onLimitChange }) => {
    const { currentPage, totalPages, limit, totalRecords } = pagination;

    // Corrected logic to ensure totalPages is at least 1, even if totalRecords is 0
    const adjustedTotalPages = totalRecords > 0 ? totalPages : 1;
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === adjustedTotalPages;

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Rows Per Page Selector */}
            <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>Items per page:</span>
                <select
                    value={limit}
                    onChange={(e) => onLimitChange(Number(e.target.value))}
                    className="p-2 border rounded-lg bg-gray-50 focus:ring-pink-500 focus:border-pink-500"
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                </select>
            </div>

            {/* Pagination Info */}
            <div className="flex-1 text-center text-sm text-gray-700 my-4 sm:my-0">
                Showing{' '}
                <span className="font-semibold text-pink-600">
                    {(currentPage - 1) * limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-pink-600">
                    {Math.min(currentPage * limit, totalRecords)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-pink-600">
                    {totalRecords}
                </span>{' '}
                records
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={isFirstPage}
                    className="p-2 border rounded-lg text-pink-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaChevronLeft />
                </button>
                <span className="px-3 py-1 text-sm font-bold text-gray-700">
                    Page {currentPage} of {adjustedTotalPages}
                </span>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={isLastPage}
                    className="p-2 border rounded-lg text-pink-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaChevronRight />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
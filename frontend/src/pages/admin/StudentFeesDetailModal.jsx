import React, { useEffect, useState } from 'react';
import { X, Edit2, Trash2, Download } from 'lucide-react';
import { adminAPI } from '../../config/api';

const StudentFeesDetailModal = ({ open, student, onClose, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [fees, setFees] = useState([]);
    const [payments, setPayments] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [editingFee, setEditingFee] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({
        feeType: '',
        amount: '',
        dueDate: '',
        description: '',
        isActive: true,
    });

    useEffect(() => {
        if (open && student?.id) {
            loadStudentFeesAndPayments();
        }
    }, [open, student?.id]);

    const loadStudentFeesAndPayments = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const studentRes = await adminAPI.getStudent(student.id);
            const studentData = studentRes?.data?.data;
            
            const studentFees = studentData?.fees || [];
            setFees(studentFees);

            const studentPayments = studentData?.payments || [];
            setPayments(studentPayments);
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to load student fees');
            console.error('Error loading fees:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateFeeStats = () => {
        const totalFee = fees.reduce((sum, f) => sum + (f.amount || 0), 0);
        const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalPending = totalFee - totalPaid;
        const paidPercentage = totalFee > 0 ? Math.round((totalPaid / totalFee) * 100) : 0;

        return { totalFee, totalPaid, totalPending, paidPercentage };
    };

    const handleEditFee = (fee) => {
        setEditingFee(fee);
        const dueDate = fee?.dueDate ? new Date(fee.dueDate) : null;
        const dueDateValue = dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate.toISOString().slice(0, 10) : '';
        setEditFormData({
            feeType: fee?.feeType || '',
            amount: fee?.amount ?? '',
            dueDate: dueDateValue,
            description: fee?.description || '',
            isActive: fee?.isActive ?? true,
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingFee?.id) return;

        try {
            const payload = {
                feeType: editFormData.feeType,
                amount: Number(editFormData.amount),
                dueDate: editFormData.dueDate,
                description: editFormData.description,
                isActive: Boolean(editFormData.isActive),
            };

            await adminAPI.updateFee(editingFee.id, payload);
            setSuccessMessage('Fee updated successfully');
            setShowEditModal(false);
            loadStudentFeesAndPayments();
            onRefresh?.();
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to update fee');
        }
    };

    const handleDeleteFee = async (feeId) => {
        if (!window.confirm('Are you sure you want to delete this fee?')) return;

        try {
            await adminAPI.deleteFee(feeId);
            setSuccessMessage('Fee deleted successfully');
            loadStudentFeesAndPayments();
            onRefresh?.();
        } catch (error) {
            setErrorMessage(error?.response?.data?.message || 'Failed to delete fee');
        }
    };

    const stats = calculateFeeStats();

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-6 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-white">{student?.name}</h2>
                            <p className="text-indigo-100 text-sm mt-1">
                                ID: {student?.studentId} • Class: {student?.sclass?.sclassName || 'N/A'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-indigo-700 p-2 rounded-lg transition"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="overflow-y-auto flex-1 p-8">
                        {/* Messages */}
                        {errorMessage && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex justify-between items-center">
                                <span>{errorMessage}</span>
                                <button onClick={() => setErrorMessage('')} className="text-red-500 hover:text-red-700">
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                        {successMessage && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex justify-between items-center">
                                <span>{successMessage}</span>
                                <button onClick={() => setSuccessMessage('')} className="text-green-500 hover:text-green-700">
                                    <X size={18} />
                                </button>
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Statistics Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                                        <p className="text-blue-600 text-sm font-medium">Total Fees</p>
                                        <p className="text-3xl font-bold text-blue-900 mt-2">₹{stats.totalFee.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                                        <p className="text-green-600 text-sm font-medium">Amount Paid</p>
                                        <p className="text-3xl font-bold text-green-900 mt-2">₹{stats.totalPaid.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                                        <p className="text-red-600 text-sm font-medium">Pending</p>
                                        <p className="text-3xl font-bold text-red-900 mt-2">₹{stats.totalPending.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                                        <p className="text-purple-600 text-sm font-medium">Progress</p>
                                        <p className="text-3xl font-bold text-purple-900 mt-2">{stats.paidPercentage}%</p>
                                        <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                                            <div
                                                className="bg-purple-600 h-2 rounded-full transition-all"
                                                style={{ width: `${stats.paidPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Fee Structure Section */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Fee Structure</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b-2 border-gray-200">
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fee Type</th>
                                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Due Date</th>
                                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {fees.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-8 text-gray-500">
                                                            No fees assigned
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    fees.map((fee) => (
                                                        <tr key={fee.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                            <td className="py-4 px-4 font-medium text-gray-900">{fee.feeType}</td>
                                                            <td className="py-4 px-4 text-right font-semibold text-indigo-600">
                                                                ₹{fee.amount.toLocaleString()}
                                                            </td>
                                                            <td className="py-4 px-4 text-center text-gray-600">
                                                                {new Date(fee.dueDate).toLocaleDateString()}
                                                            </td>
                                                            <td className="py-4 px-4 text-center">
                                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                                    fee.isActive
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {fee.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4 text-center">
                                                                <div className="flex justify-center gap-2">
                                                                    <button
                                                                        onClick={() => handleEditFee(fee)}
                                                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                                        title="Edit Fee"
                                                                    >
                                                                        <Edit2 size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteFee(fee.id)}
                                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                        title="Delete Fee"
                                                                    >
                                                                        <Trash2 size={18} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Payments Received Section */}
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Payments Received</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b-2 border-gray-200">
                                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Amount</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Fee Type</th>
                                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Payment Date</th>
                                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Transaction ID</th>
                                                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Receipt</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="text-center py-8 text-gray-500">
                                                            No payments received yet
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    payments.map((payment) => (
                                                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                                            <td className="py-4 px-4 text-right font-semibold text-green-600">
                                                                ₹{payment.amount.toLocaleString()}
                                                            </td>
                                                            <td className="py-4 px-4 text-gray-900">{payment.notes || 'Fee Payment'}</td>
                                                            <td className="py-4 px-4 text-center text-gray-600">
                                                                {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                                                            </td>
                                                            <td className="py-4 px-4 text-center">
                                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                                                    payment.status === 'completed'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                    {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1) || 'Pending'}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-4 text-gray-600 text-sm font-mono">
                                                                {payment.razorpayPaymentId || payment.transactionId || 'N/A'}
                                                            </td>
                                                            <td className="py-4 px-4 text-center">
                                                                <button
                                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    disabled
                                                                    title="Download Receipt"
                                                                >
                                                                    <Download size={18} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-8 py-4 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Fee Modal */}
            {showEditModal && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowEditModal(false)}></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Edit Fee</h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="text-white hover:bg-indigo-700 p-1 rounded transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type</label>
                                    <input
                                        type="text"
                                        value={editFormData.feeType}
                                        onChange={(e) => setEditFormData({ ...editFormData, feeType: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={editFormData.amount}
                                        onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        value={editFormData.dueDate}
                                        onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={editFormData.description}
                                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        rows="2"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={editFormData.isActive}
                                        onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.value === 'true' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default StudentFeesDetailModal;

'use client';

import React from 'react';
//@ts-ignore
import "../../styles/budget-management/addBudgetRequest.css";
import { formatDate, formatDateTime } from '../../utility/dateFormatter';
import ModalHeader from '../../Components/ModalHeader';

interface ViewPurchaseModalProps {
    purchaseRequest: any; // The purchase request data from the table
    onClose: () => void;
}

export default function ViewPurchaseModal({ purchaseRequest, onClose }: ViewPurchaseModalProps) {
    // Helper function to format status
    const formatStatus = (status: string) => {
        switch (status) {
            case "pending":
                return "Pending Approval";
            case "approved":
                return "Approved";
            case "rejected":
                return "Rejected";
            case "completed":
                return "Completed";
            case "partially-completed":
                return "Partially Completed";
            case "cancelled":
                return "Cancelled";
            default:
                return status;
        }
    };

    // Helper function to format request type
    const formatRequestType = (type: string) => {
        switch (type) {
            case "normal":
                return "Normal Request";
            case "urgent":
                return "Urgent Request";
            default:
                return type;
        }
    };

    // Calculate total price and format currency
    const totalPrice = purchaseRequest.unitPrice * purchaseRequest.quantity;
    const formatCurrency = (amount: number) => `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Mock additional data that would come from the full purchase request
    const mockFormData = {
        title: purchaseRequest.itemName || 'Purchase Request',
        description: purchaseRequest.requestPurpose || 'No description provided',
        department: 'Operations',
        requester_name: 'Admin User',
        requester_position: 'Administrator',
        request_date: '2024-03-22',
        start_date: '2024-03-22',
        end_date: '2024-03-30',
        created_by: 'Admin User'
    };

    // Mock items array
    const items = [
        {
            item_name: purchaseRequest.itemName,
            quantity: purchaseRequest.quantity,
            unit_measure: purchaseRequest.unitMeasure || 'pcs',
            unit_cost: purchaseRequest.unitPrice,
            supplier: purchaseRequest.vendor,
            subtotal: totalPrice
        }
    ];

    // Mock supporting documents
    const supportingDocuments = [
        { name: 'purchase-justification.pdf', size: '245 KB' },
        { name: 'vendor-quotation.xlsx', size: '127 KB' }
    ];

    return (
        <div className="modalOverlay">
            <div className="addBudgetRequestModal" style={{ display: 'flex', flexDirection: 'column', height: 'auto', maxHeight: '90vh' }}>
                <ModalHeader 
                    title="View Purchase Request" 
                    onClose={onClose} 
                    showDateTime={true} 
                />

                <div className="modalContent">
                    <div className="formInputs">
                        
                        {/* Basic Information Section */}
                        <div className="sectionHeader">Request Information</div>
                        
                        <div className="formRow">
                            <div className="formField formFieldHalf">
                                <label>Department</label>
                                <div className="viewOnlyField">{mockFormData.department}</div>
                            </div>
                            
                            <div className="formField formFieldHalf">
                                <label>Requester Name</label>
                                <div className="viewOnlyField">{mockFormData.requester_name}</div>
                            </div>
                        </div>

                        <div className="formRow">
                            <div className="formField formFieldHalf">
                                <label>Requester Position</label>
                                <div className="viewOnlyField">{mockFormData.requester_position}</div>
                            </div>
                            
                            <div className="formField formFieldHalf">
                                <label>Date of Request</label>
                                <div className="viewOnlyField">{formatDate(mockFormData.request_date)}</div>
                            </div>
                        </div>

                        {/* Purchase Details Section */}
                        <div className="sectionHeader">Purchase Details</div>
                        
                        <div className="formRow">
                            <div className="formField formFieldHalf">
                                <label>Request Type</label>
                                <div className="viewOnlyField">
                                    <span className={`chip ${purchaseRequest.requestType}`}>
                                        {formatRequestType(purchaseRequest.requestType)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="formField formFieldHalf">
                                <label>Request Status</label>
                                <div className="viewOnlyField">
                                    <span className={`chip ${purchaseRequest.requestStatus}`}>
                                        {formatStatus(purchaseRequest.requestStatus)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="formField">
                            <label>Purchase Request Title</label>
                            <div className="viewOnlyField">{mockFormData.title}</div>
                        </div>

                        <div className="formField">
                            <label>Request Purpose</label>
                            <div className="viewOnlyField multiline">{mockFormData.description}</div>
                        </div>

                        <div className="formRow">
                            <div className="formField formFieldHalf">
                                <label>Request Date</label>
                                <div className="viewOnlyField">{formatDate(mockFormData.start_date)}</div>
                            </div>
                            
                            <div className="formField formFieldHalf">
                                <label>Needed By Date</label>
                                <div className="viewOnlyField">{formatDate(mockFormData.end_date)}</div>
                            </div>
                        </div>

                        {/* Items Section */}
                        <div className="sectionHeader">Purchase Items</div>
                        
                        <div className="itemsTableContainer">
                            <table className="itemsTable">
                                <thead>
                                    <tr>
                                        <th>Item Name</th>
                                        <th>Quantity</th>
                                        <th>Unit Measure</th>
                                        <th>Unit Cost</th>
                                        <th>Supplier</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.item_name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.unit_measure}</td>
                                            <td>{formatCurrency(item.unit_cost)}</td>
                                            <td>{item.supplier}</td>
                                            <td className="subtotalCell">
                                                {formatCurrency(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={5} className="totalLabel"><strong>Total Amount:</strong></td>
                                        <td className="totalAmount">
                                            <strong>{formatCurrency(totalPrice)}</strong>
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Supporting Documents Section */}
                        <div className="sectionHeader">Supporting Documents</div>
                        
                        <div className="documentsViewSection">
                            {supportingDocuments.length > 0 ? (
                                <div className="documentsList">
                                    {supportingDocuments.map((doc, index) => (
                                        <div key={index} className="documentItem">
                                            <div className="documentIcon">
                                                <i className="ri-file-text-line" />
                                            </div>
                                            <div className="documentInfo">
                                                <div className="documentName">{doc.name}</div>
                                                <div className="documentSize">{doc.size}</div>
                                            </div>
                                            <button className="downloadBtn" type="button">
                                                <i className="ri-download-line" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="noDocuments">
                                    <i className="ri-file-line" />
                                    <span>No supporting documents uploaded</span>
                                </div>
                            )}
                        </div>

                        {/* Request Timeline */}
                        <div className="sectionHeader">Request Timeline</div>
                        
                        <div className="timelineSection">
                            <div className="timelineItem">
                                <div className="timelineIcon completed">
                                    <i className="ri-add-circle-line" />
                                </div>
                                <div className="timelineContent">
                                    <div className="timelineTitle">Request Created</div>
                                    <div className="timelineDate">{formatDateTime(mockFormData.request_date + 'T08:30:00Z')}</div>
                                    <div className="timelineUser">by {mockFormData.created_by}</div>
                                </div>
                            </div>
                            
                            {purchaseRequest.requestStatus !== 'pending' && (
                                <div className="timelineItem">
                                    <div className={`timelineIcon ${purchaseRequest.requestStatus === 'approved' || purchaseRequest.requestStatus === 'completed' ? 'completed' : 'rejected'}`}>
                                        <i className={purchaseRequest.requestStatus === 'rejected' ? 'ri-close-circle-line' : 'ri-check-circle-line'} />
                                    </div>
                                    <div className="timelineContent">
                                        <div className="timelineTitle">
                                            {purchaseRequest.requestStatus === 'rejected' ? 'Request Rejected' : 'Request Approved'}
                                        </div>
                                        <div className="timelineDate">{formatDateTime('2024-03-23T14:45:00Z')}</div>
                                        <div className="timelineUser">by Department Head</div>
                                    </div>
                                </div>
                            )}
                            
                            {(purchaseRequest.requestStatus === 'completed' || purchaseRequest.requestStatus === 'partially-completed') && (
                                <div className="timelineItem">
                                    <div className="timelineIcon completed">
                                        <i className="ri-check-double-line" />
                                    </div>
                                    <div className="timelineContent">
                                        <div className="timelineTitle">
                                            {purchaseRequest.requestStatus === 'completed' ? 'Order Completed' : 'Order Partially Completed'}
                                        </div>
                                        <div className="timelineDate">{formatDateTime('2024-03-26T15:30:00Z')}</div>
                                        <div className="timelineUser">by Warehouse Manager</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modalButtons">
                    <button type="button" className="secondaryButton" onClick={onClose}>
                        <i className="ri-close-line" /> Close
                    </button>
                </div>
            </div>
        </div>
    );
}
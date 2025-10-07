"use client";

import React, { useState, useEffect, useMemo } from "react";
//@ts-ignore
import ModalManager from "../../Components/modalManager";
import ActionButtons from "../../Components/actionButtons";
import FilterDropdown, { FilterSection } from "../../Components/filter";
import Loading from "../../Components/loading";
import PaginationComponent from "../../Components/pagination";
//@ts-ignore
import AddPurchaseRequest from "./addPurchaseRequest";
//@ts-ignore
import EditPurchaseRequest from "./editPurchaseRequest";
//@ts-ignore
import ViewPurchaseRequest from "./viewPurchaseRequest";
//@ts-ignore
import AuditTrailPurchaseRequest from "./auditTrailPurchaseRequest";
//@ts-ignore
import TrackStatusPurchaseRequest from "./trackStatusPurchaseRequest";
import { showConfirmation, showSuccess, showError } from "../../utility/Alerts";

// Import type for purchase requests
interface NewBudgetRequest {
  title: string;
  description: string;
  department: string;
  requester_name: string;
  requester_position: string;
  request_date: string;
  budget_period: string;
  total_amount: number;
  start_date: string;
  end_date: string;
  items?: any[];
  supporting_documents?: File[];
  status: 'Draft' | 'Pending Approval';
  created_by: string;
}

// Legacy interface for edit functionality
interface PurchaseRequestForm {
  itemName: string;
  quantity: number;
  unitMeasure: string;
  requestType: string;
  requestStatus: string;
  requestPurpose: string;
  supplierDetails?: {
    supplierName?: string;
    unitPrice?: number;
  };
}

// @ts-ignore
import "../../styles/components/filter.css";
// @ts-ignore
import "../../styles/components/table.css";
// @ts-ignore
import "../../styles/components/chips.css";
// @ts-ignore
import "../../styles/components/loading.css";
  

export default function PurchaseRequest() {
    // Move hardcoded data outside of useEffect so it's accessible throughout the component
    const hardcodedData = [
        {
            id: 1,
            itemName: "Brake Disc",
            quantity: 5,
            unitMeasure: "pcs",
            requestType: "urgent",
            requestStatus: "pending",
            requestPurpose: "Replacement for Bus 001",
            vendor: "AutoParts Inc.",
            unitPrice: 450.00
        },
        {
            id: 2,
            itemName: "Engine Oil",
            quantity: 10,
            unitMeasure: "liters",
            requestType: "normal",
            requestStatus: "approved",
            requestPurpose: "Maintenance of Bus 002",
            vendor: "OilMax Supply",
            unitPrice: 85.00
        },
        {
            id: 3,
            itemName: "Tire",
            quantity: 4,
            unitMeasure: "pcs",
            requestType: "normal",
            requestStatus: "rejected",
            requestPurpose: "Transfer to Branch Office",
            vendor: "TireMax Corp.",
            unitPrice: 320.00
        },
        {
            id: 4,
            itemName: "Air Filter",
            quantity: 8,
            unitMeasure: "pcs",
            requestType: "normal",
            requestStatus: "completed",
            requestPurpose: "Scheduled maintenance for fleet",
            vendor: "FilterPro Ltd.",
            unitPrice: 35.00
        },
        {
            id: 5,
            itemName: "Brake Pads",
            quantity: 12,
            unitMeasure: "sets",
            requestType: "urgent",
            requestStatus: "partially-completed",
            requestPurpose: "Emergency repair for Bus 005",
            vendor: "BrakeTech Corp.",
            unitPrice: 180.00
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Set the hardcoded data to filteredData state
                setFilteredData(hardcodedData);
            } catch (error) {
                console.error('Error fetching data:', error);
                showError('Failed to load purchase requests', 'Error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // for modal
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeRow, setActiveRow] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);

    // For filtering
    const [filteredData, setFilteredData] = useState<any[]>([]);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10); // default number of rows per page

    // Calculate paginated data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
    }, [filteredData, currentPage, pageSize]);

    // Calculate total pages
    const totalPages = Math.ceil(filteredData.length / pageSize);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Handle page size change
    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1); // Reset to first page when changing page size
    };

    // Filter sections
    const filterSections: FilterSection[] = [
        {
            id: "dateRange",
            title: "Date Range",
            type: "dateRange",
            defaultValue: { from: "", to: "" }
        },
        {
            id: "requestStatus",
            title: "Status",
            type: "checkbox",
            options: [
                { id: "pending", label: "Pending" },
                { id: "approved", label: "Approved" },
                { id: "rejected", label: "Rejected" },
                { id: "completed", label: "Completed" },
                { id: "partially-completed", label: "Partially Completed" }
            ]
        },
        {
            id: "requestType",
            title: "Request Type",
            type: "checkbox",
            options: [
                { id: "normal", label: "Normal" },
                { id: "urgent", label: "Urgent" }
            ]
        },
        {
            id: "vendor",
            title: "Vendor",
            type: "checkbox",
            options: [
                { id: "AutoParts Inc.", label: "AutoParts Inc." },
                { id: "OilMax Supply", label: "OilMax Supply" },
                { id: "TireMax Corp.", label: "TireMax Corp." },
                { id: "FilterPro Ltd.", label: "FilterPro Ltd." },
                { id: "BrakeTech Corp.", label: "BrakeTech Corp." }
            ]
        },
        {
            id: "sortBy",
            title: "Sort By",
            type: "radio",
            options: [
                { id: "itemName", label: "Item Name" },
                { id: "quantity", label: "Quantity" },
                { id: "vendor", label: "Vendor" },
                { id: "unitPrice", label: "Unit Price" }
            ],
            defaultValue: "itemName"
        },
        {
            id: "order",
            title: "Order",
            type: "radio",
            options: [
                { id: "asc", label: "Ascending" },
                { id: "desc", label: "Descending" }
            ],
            defaultValue: "asc"
        }
    ];

    // Handle filter application
    const handleApplyFilters = (filterValues: Record<string, any>) => {
        console.log("Applied filters:", filterValues);

        // In a real application, you would filter your data based on these values
        // For now, we'll just log them and keep the original data

        // Example implementation for filtering and sorting:
        let newData = [...hardcodedData];

        // Filter by status if selected
        if (filterValues.requestStatus && filterValues.requestStatus.length > 0) {
            newData = newData.filter(request => filterValues.requestStatus.includes(request.requestStatus));
        }

        // Filter by request type if selected
        if (filterValues.requestType && filterValues.requestType.length > 0) {
            newData = newData.filter(request => filterValues.requestType.includes(request.requestType));
        }

        // Filter by vendor if selected
        if (filterValues.vendor && filterValues.vendor.length > 0) {
            newData = newData.filter(request => filterValues.vendor.includes(request.vendor));
        }

        // Sort by itemName, quantity, vendor, or unitPrice
        if (filterValues.sortBy === "itemName") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.itemName.localeCompare(b.itemName) * sortOrder;
            });
        } else if (filterValues.sortBy === "quantity") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.quantity - b.quantity) * sortOrder;
            });
        } else if (filterValues.sortBy === "vendor") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return a.vendor.localeCompare(b.vendor) * sortOrder;
            });
        } else if (filterValues.sortBy === "unitPrice") {
            newData.sort((a, b) => {
                const sortOrder = filterValues.order === "asc" ? 1 : -1;
                return (a.unitPrice - b.unitPrice) * sortOrder;
            });
        }

        setFilteredData(newData);
        setCurrentPage(1); // Reset to first page when filters change
    };

    // for request status formatting
    function formatStatus(requestStatus: string) {
        switch (requestStatus) {
            case "pending":
                return "Pending";
            case "approved":
                return "Approved";
            case "rejected":
                return "Rejected";
            case "completed":
                return "Completed";
            case "partially-completed":
                return "Partially Completed";
            default:
                return requestStatus;
        }
    }

    // for request type formatting
    function formatRequestType(requestType: string) {
        switch (requestType) {
            case "normal":
                return "Normal";
            case "urgent":
                return "Urgent";
            default:
                return requestType;
        }
    }

    // for the modals of add, view, edit, audit trail, and track status
    const openModal = (mode: "add-purchase-request" | "view-purchase-request" | "edit-purchase-request" | "audit-trail-purchase-request" | "track-status-purchase-request", rowData?: any) => {
        console.log("openModal called with mode:", mode);
        let content;

        switch (mode) {
            case "add-purchase-request":
                console.log("Creating AddPurchaseRequest component");
                content = <AddPurchaseRequest
                    onAddPurchaseRequest={handleAddPurchaseRequest}
                    onClose={closeModal}
                    currentUser="Admin User"
                />;
                break;
            case "view-purchase-request":
                content = <ViewPurchaseRequest
                    purchaseRequest={rowData}
                    onClose={closeModal}
                />;
                break;
            case "edit-purchase-request":
                content = <EditPurchaseRequest
                    purchaseRequest={rowData}
                    onEditPurchaseRequest={handleEditPurchaseRequest}
                    onClose={closeModal}
                    currentUser="Admin User"
                />;
                break;
            case "audit-trail-purchase-request":
                content = <AuditTrailPurchaseRequest
                    requestId={`PR-${rowData?.id || '001'}`}
                    requestTitle={rowData?.itemName || 'Purchase Request'}
                    onClose={closeModal}
                />;
                break;
            case "track-status-purchase-request":
                content = <TrackStatusPurchaseRequest
                    requestId={`PR-${rowData?.id || '001'}`}
                    requestTitle={rowData?.itemName || 'Purchase Request'}
                    onClose={closeModal}
                />;
                break;
            default:
                content = null;
        }

        console.log("Setting modal content:", content);
        console.log("Setting isModalOpen to true");
        setModalContent(content);
        setActiveRow(rowData || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
        setActiveRow(null);
    };

    // Handle add purchase request
    const handleAddPurchaseRequest = (formData: NewBudgetRequest) => {
        console.log("Adding purchase request:", formData);
        
        // Convert formData to table format
        const newRequests = formData.items?.map((item, index) => ({
            id: filteredData.length + index + 1,
            itemName: item.item_name,
            quantity: item.quantity,
            unitMeasure: item.unit_measure,
            requestType: formData.budget_period, // normal/urgent
            requestStatus: 'pending',
            requestPurpose: formData.description,
            vendor: item.supplier,
            unitPrice: item.unit_cost
        })) || [];
        
        setFilteredData(prev => [...prev, ...newRequests]);
        closeModal();
    };

    // Handle edit purchase request
    const handleEditPurchaseRequest = (formData: NewBudgetRequest) => {
        console.log("Updating purchase request:", formData);
        
        if (activeRow && formData.items && formData.items.length > 0) {
            // Get the first item (since we're editing a single purchase request)
            const updatedItem = formData.items[0];
            
            const updatedData = filteredData.map(request => 
                request.id === activeRow.id ? {
                    ...request,
                    itemName: updatedItem.item_name,
                    quantity: updatedItem.quantity,
                    unitMeasure: updatedItem.unit_measure,
                    requestType: formData.budget_period, // normal/urgent
                    requestStatus: 'pending', // Reset to pending when edited
                    requestPurpose: formData.description,
                    vendor: updatedItem.supplier,
                    unitPrice: updatedItem.unit_cost
                } : request
            );
            
            setFilteredData(updatedData);
        }
        closeModal();
    };

    // Handle cancel request
    const handleCancelRequest = async (request: any) => {
        const result = await showConfirmation(
            `Are you sure you want to <b>CANCEL</b> the purchase request for "${request.itemName}"?`,
            "Cancel Request"
        );
        
        if (result.isConfirmed) {
            const updatedData = filteredData.map(item => 
                item.id === request.id 
                    ? { ...item, requestStatus: "cancelled" }
                    : item
            );
            setFilteredData(updatedData);
            showSuccess("Purchase request has been cancelled successfully.", "Request Cancelled");
        }
    };

    // Handle rollback request
    const handleRollbackRequest = async (request: any) => {
        const result = await showConfirmation(
            `Are you sure you want to <b>ROLLBACK</b> the purchase request for "${request.itemName}" to pending status?`,
            "Rollback Request"
        );
        
        if (result.isConfirmed) {
            const updatedData = filteredData.map(item => 
                item.id === request.id 
                    ? { ...item, requestStatus: "pending" }
                    : item
            );
            setFilteredData(updatedData);
            showSuccess("Purchase request has been rolled back to pending status.", "Request Rolled Back");
        }
    };

    // Handle export request
    const handleExportRequest = async (request: any) => {
        try {
            // Simulate export functionality
            const exportData = {
                id: request.id,
                itemName: request.itemName,
                quantity: request.quantity,
                unitMeasure: request.unitMeasure,
                vendor: request.vendor,
                unitPrice: request.unitPrice,
                totalAmount: request.quantity * request.unitPrice,
                requestStatus: request.requestStatus,
                requestType: request.requestType,
                requestPurpose: request.requestPurpose,
                exportDate: new Date().toLocaleDateString()
            };
            
            // In a real application, this would download a file
            console.log("Exporting data:", exportData);
            showSuccess(`Purchase request data for "${request.itemName}" has been exported successfully.`, "Export Successful");
        } catch (error) {
            showError("Failed to export the purchase request data.", "Export Failed");
        }
    };

    // Handle audit trail
    const handleAuditTrail = (request: any) => {
        openModal("audit-trail-purchase-request", request);
    };

    // Handle process refund
    const handleProcessRefund = async (request: any) => {
        const result = await showConfirmation(
            `Are you sure you want to <b>PROCESS REFUND</b> for the purchase request "${request.itemName}"?<br/>
            <small>This action will initiate the refund process.</small>`,
            "Process Refund"
        );
        
        if (result.isConfirmed) {
            const updatedData = filteredData.map(item => 
                item.id === request.id 
                    ? { ...item, requestStatus: "refund-processing" }
                    : item
            );
            setFilteredData(updatedData);
            showSuccess("Refund process has been initiated successfully.", "Refund Processing");
        }
    };

    // Handle track status
    const handleTrackStatus = (request: any) => {
        openModal("track-status-purchase-request", request);
    };

    // Get conditional action buttons based on request status
    const getActionButtons = (request: any) => {
        const commonProps = {
            onView: () => openModal("view-purchase-request", request)
        };

        switch (request.requestStatus) {
            case "pending":
                return (
                    <ActionButtons
                        {...commonProps}
                        onEdit={() => openModal("edit-purchase-request", request)}
                        onCancel={() => handleCancelRequest(request)}
                    />
                );
            
            case "approved":
                return (
                    <ActionButtons
                        {...commonProps}
                        onRollback={() => handleRollbackRequest(request)}
                        onCancel={() => handleCancelRequest(request)}
                    />
                );
            
            case "rejected":
                return (
                    <ActionButtons
                        {...commonProps}
                        onRollback={() => handleRollbackRequest(request)}
                    />
                );
            
            case "completed":
                return (
                    <ActionButtons
                        {...commonProps}
                        onExport={() => handleExportRequest(request)}
                        onAuditTrail={() => handleAuditTrail(request)}
                    />
                );
            
            case "partially-completed":
                return (
                    <ActionButtons
                        {...commonProps}
                        onProcessRefund={() => handleProcessRefund(request)}
                        onTrackStatus={() => handleTrackStatus(request)}
                    />
                );
            
            default:
                return (
                    <ActionButtons
                        {...commonProps}
                    />
                );
        }
    };

    if (loading) {
      return (
          <div className="card">
              <h1 className="title">Purchase Request</h1>
              <Loading />
          </div>
      );
  }

    return (
        <div className="card">
            <h1 className="title">Purchase Request</h1>

            {/* Search Engine and Filters */}
            <div className="elements">
                <div className="entries">
                    <div className="search">
                        <i className="ri-search-line" />
                        <input type="text" placeholder="Search here..." />
                    </div>

                    {/* Filter Button with Dropdown */}
                    <div className="filter">
                        <FilterDropdown
                            sections={filterSections}
                            onApply={handleApplyFilters}
                        />
                    </div>

                    {/* Generate Report Button */}
                    <button
                        type="button"
                        className="generate-btn"
                        // onClick={handleGenerateReport}
                    >
                        <i className="ri-receipt-line" /> Generate Report
                    </button>

                    {/* Add Purchase Request Button */}
                    <button 
                        className="main-btn" 
                        onClick={() => {
                            console.log("Add Request button clicked!");
                            openModal("add-purchase-request");
                        }}
                    >
                        <i className="ri-add-line" /> Add Request
                    </button>
                </div>

                {/* Table */}
                <div className="table-wrapper">
                    <div className="table-container">
                        <table className="data-table">
                            <thead className="table-heading">
                                <tr>
                                    <th>Item Name</th>
                                    <th>Quantity</th>
                                    <th>Vendor</th>
                                    <th>Unit Price</th>
                                    <th>Status</th>
                                    <th>Request Type</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {paginatedData.map(request => (
                                    <tr
                                        key={request.id}
                                        className={selectedIds.includes(request.id) ? "selected" : ""}
                                    >
                                        <td>{request.itemName}</td>
                                        <td>{request.quantity}</td>
                                        <td>{request.vendor}</td>
                                        <td>₱{request.unitPrice.toFixed(2)}</td>
                                        <td className="table-status">
                                            <span className={`chip ${request.requestStatus}`}>
                                                {formatStatus(request.requestStatus)}
                                            </span>
                                        </td>
                                        <td className="table-status">
                                            <span className={`chip ${request.requestType}`}>
                                                {formatRequestType(request.requestType)}
                                            </span>
                                        </td>
                                        <td>
                                            {getActionButtons(request)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={filteredData.length}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>

            {/* Dynamic Modal Manager */}
            <ModalManager
                isOpen={isModalOpen}
                onClose={closeModal}
                modalContent={modalContent}
            />

        </div>
    );
}
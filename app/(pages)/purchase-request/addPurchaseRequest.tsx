'use client';

import React, { useState, useEffect } from 'react';
//@ts-ignore
import "../../styles/budget-management/addBudgetRequest.css";
import { formatDate } from '../../utility/dateFormatter';
import { showSuccess, showError, showConfirmation } from '../../utility/Alerts';
import { validateField, isValidAmount, ValidationRule } from "../../utility/validation";
import ModalHeader from '../../Components/ModalHeader';
import ItemsTable, { Item } from '../../Components/itemTable';

// Types
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
  items?: Item[];
  supporting_documents?: File[];
  status: 'Draft' | 'Pending Approval';
  created_by: string;
}

interface AddPurchaseRequestProps {
  onClose: () => void;
  onAddPurchaseRequest: (formData: NewBudgetRequest) => void;
  currentUser: string;
}

type FieldName = 'title' | 'description' | 'total_amount' | 'start_date' | 'end_date' | 'budget_period';

const AddPurchaseRequest: React.FC<AddPurchaseRequestProps> = ({
  onClose,
  onAddPurchaseRequest,
  currentUser
}) => {
  const [errors, setErrors] = useState<Record<FieldName, string[]>>({
    title: [],
    description: [],
    total_amount: [],
    start_date: [],
    end_date: [],
    budget_period: []
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'Operations', // Auto-filled
    requester_name: 'Admin User', // Auto-filled
    requester_position: 'Administrator', // Auto-filled
    request_date: new Date().toISOString().split('T')[0],
    budget_period: 'normal',
    total_amount: 0,
    start_date: new Date().toISOString().split('T')[0], // Auto-set to today
    end_date: '',
    created_by: currentUser
  });

  const [items, setItems] = useState<Item[]>([]);
  const [supportingDocuments, setSupportingDocuments] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const validationRules: Record<FieldName, ValidationRule> = {
    title: { required: true, label: "Purchase Request Title" },
    description: { required: true, label: "Request Purpose" },
    total_amount: {
      required: true,
      min: 0.01,
      label: "Total Amount",
      custom: (v: unknown) => {
        const numValue = typeof v === 'number' ? v : Number(v);
        return isValidAmount(numValue) ? null : "Amount must be greater than 0.";
      }
    },
    start_date: { required: true, label: "Request Date" },
    end_date: { required: true, label: "Needed By Date" },
    budget_period: { required: true, label: "Request Type" }
  };

  // Calculate total from items
  const calculateTotalFromItems = () => {
    return items.reduce((total, item) => total + item.subtotal, 0);
  };

  // Update total amount when items change
  useEffect(() => {
    if (items.length > 0) {
      const itemsTotal = calculateTotalFromItems();
      setFormData(prev => ({ ...prev, total_amount: itemsTotal }));
    }
  }, [items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue: string | number = value;

    if (name === 'total_amount') {
      newValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Validate field
    if (validationRules[name as FieldName]) {
      setErrors(prev => ({
        ...prev,
        [name]: validateField(newValue, validationRules[name as FieldName])
      }));
    }
  };

  // File handling functions
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    // Filter for allowed file types (documents and images)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    const validFiles = files.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        showError(`File type not allowed: ${file.name}`, 'Invalid File');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showError(`File too large: ${file.name}. Maximum size is 10MB.`, 'File Too Large');
        return false;
      }
      return true;
    });

    setSupportingDocuments(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSupportingDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = ['title', 'description', 'total_amount', 'start_date', 'end_date'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0 && !saveAsDraft) {
      showError('Please fill in all required fields', 'Validation Error');
      return;
    }

    // Validate date range
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (startDate >= endDate) {
        showError('Needed by date must be after request date', 'Invalid Date Range');
        return;
      }
    }

    // Validate items - mandatory for purchase requests
    if (items.length === 0) {
      showError('At least one item must be added to the purchase request', 'Missing Items');
      return;
    }

    const invalidItems = items.filter(item => 
      !item.item_name || 
      item.quantity <= 0 || 
      item.unit_cost <= 0 || 
      !item.supplier
    );

    if (invalidItems.length > 0 && !saveAsDraft) {
      showError('Please complete all item fields or remove incomplete items', 'Invalid Items');
      return;
    }

    const action = saveAsDraft ? 'save as draft' : 'submit for approval';
    const result = await showConfirmation(
      `Are you sure you want to ${action} this purchase request?`,
      `Confirm ${saveAsDraft ? 'Draft' : 'Submit'}`
    );

    if (result.isConfirmed) {
      try {
        const payload: NewBudgetRequest = {
          ...formData,
          status: saveAsDraft ? 'Draft' : 'Pending Approval',
          items: items.length > 0 ? items : undefined,
          supporting_documents: supportingDocuments.length > 0 ? supportingDocuments : undefined
        };

        await onAddPurchaseRequest(payload);
        showSuccess(
          `Purchase request ${saveAsDraft ? 'saved as draft' : 'submitted for approval'} successfully`, 
          'Success'
        );
        onClose();
      } catch (error: unknown) {
        console.error('Error adding purchase request:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        showError('Failed to add purchase request: ' + errorMessage, 'Error');
      }
    }
  };

  return (
    <div className="modalOverlay">
      <div className="addBudgetRequestModal">
        <ModalHeader 
          title="Create Purchase Request" 
          onClose={onClose} 
          showDateTime={true} 
        />

        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div className="modalContent">
            <div className="formInputs">
              
              {/* Basic Information Section */}
              <div className="sectionHeader">Request Information</div>
              
              <div className="formRow">
                <div className="formField formFieldHalf">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    readOnly
                    className="formInput"
                  />
                  <span className="autofill-note">Auto-filled based on current user</span>
                </div>
                
                <div className="formField formFieldHalf">
                  <label htmlFor="requester_name">Requester Name</label>
                  <input
                    type="text"
                    id="requester_name"
                    name="requester_name"
                    value={formData.requester_name}
                    readOnly
                    className="formInput"
                  />
                  <span className="autofill-note">Auto-filled based on current user</span>
                </div>
              </div>

              <div className="formRow">
                <div className="formField formFieldHalf">
                  <label htmlFor="requester_position">Requester Position</label>
                  <input
                    type="text"
                    id="requester_position"
                    name="requester_position"
                    value={formData.requester_position}
                    readOnly
                    className="formInput"
                  />
                  <span className="autofill-note">Auto-filled based on current user</span>
                </div>
                
                <div className="formField formFieldHalf">
                  <label htmlFor="request_date">Date of Request</label>
                  <input
                    type="date"
                    id="request_date"
                    name="request_date"
                    value={formData.request_date}
                    readOnly
                    className="formInput"
                  />
                  <span className="autofill-note">Auto-filled with current date</span>
                </div>
              </div>

              {/* Purchase Details Section */}
              <div className="sectionHeader">Purchase Details</div>
              
              <div className="formRow">
                <div className="formField formFieldHalf">
                  <label htmlFor="budget_period">Request Type<span className='requiredTags'> *</span></label>
                  <select
                    id="budget_period"
                    name="budget_period"
                    value={formData.budget_period}
                    onChange={handleInputChange}
                    required
                    className="formSelect"
                  >
                    <option value="normal">Normal Request</option>
                    <option value="urgent">Urgent Request</option>
                  </select>
                  {errors.budget_period?.map((msg, i) => (
                    <div className="error-message" key={i}>{msg}</div>
                  ))}
                </div>
                
                <div className="formField formFieldHalf">
                  <label htmlFor="total_amount">Total Amount<span className='requiredTags'> *</span></label>
                  <input
                    type="number"
                    id="total_amount"
                    name="total_amount"
                    value={formData.total_amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className="formInput"
                    readOnly={items.length > 0}
                  />
                  {items.length > 0 && (
                    <span className="autofill-note">Auto-calculated from items below</span>
                  )}
                  {errors.total_amount?.map((msg, i) => (
                    <div className="error-message" key={i}>{msg}</div>
                  ))}
                </div>
              </div>

              <div className="formField">
                <label htmlFor="title">Purchase Request Title<span className='requiredTags'> *</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="formInput"
                  placeholder="Enter purchase request title"
                />
                {errors.title?.map((msg, i) => (
                  <div className="error-message" key={i}>{msg}</div>
                ))}
              </div>

              <div className="formField">
                <label htmlFor="description">Request Purpose<span className='requiredTags'> *</span></label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="formInput"
                  placeholder="Provide detailed purpose/justification for this purchase request"
                  rows={4}
                />
                {errors.description?.map((msg, i) => (
                  <div className="error-message" key={i}>{msg}</div>
                ))}
              </div>

              <div className="formRow">
                <div className="formField formFieldHalf">
                  <label htmlFor="start_date">Request Date<span className='requiredTags'> *</span></label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    readOnly
                    className="formInput"
                  />
                  <span className="autofill-note">Auto-filled with today's date</span>
                  {errors.start_date?.map((msg, i) => (
                    <div className="error-message" key={i}>{msg}</div>
                  ))}
                </div>
                
                <div className="formField formFieldHalf">
                  <label htmlFor="end_date">Needed By Date<span className='requiredTags'> *</span></label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    className="formInput"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.end_date?.map((msg, i) => (
                    <div className="error-message" key={i}>{msg}</div>
                  ))}
                </div>
              </div>

              {/* Items Section - Always visible for purchase requests */}
              <ItemsTable
                items={items}
                onItemsChange={setItems}
                showItems={true}
                onToggleItems={() => {}}
                title="Purchase Items"
              />

              {/* Supporting Documents Section */}
              <div className="sectionHeader">Supporting Documents (Optional)</div>
              
              <div 
                className={`fileUploadSection ${dragOver ? 'dragOver' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="fileUploadIcon">
                  <i className="ri-upload-cloud-line" />
                </div>
                <div className="fileUploadText">
                  Drag and drop files here, or click to select files
                  <br />
                  <small>Supported: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF (Max 10MB each)</small>
                </div>
                <input
                  type="file"
                  className="fileInput"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileSelect}
                  id="supportingDocuments"
                />
                <label htmlFor="supportingDocuments" className="fileUploadBtn">
                  <i className="ri-attachment-line" /> Choose Files
                </label>

                {supportingDocuments.length > 0 && (
                  <div className="fileList">
                    <h4>Selected Files:</h4>
                    {supportingDocuments.map((file, index) => (
                      <div key={index} className="fileItem">
                        <div>
                          <div className="fileName">{file.name}</div>
                          <div className="fileSize">{formatFileSize(file.size)}</div>
                        </div>
                        <button
                          type="button"
                          className="removeFileBtn"
                          onClick={() => removeFile(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modalButtons">
            <button
              type="button"
              className="saveAsDraftButton"
              onClick={(e) => handleSubmit(e, true)}
            >
              <i className="ri-draft-line" /> Save as Draft
            </button>
            <button type="submit" className="submitButton">
              <i className="ri-send-plane-line" /> Submit for Approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPurchaseRequest;
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import useApiCaller from '../utils/hooks/useApicaller';

const QAChecklist = ({ qaReviewId, onClose }) => {
  const [searchParams] = useSearchParams();
  const initialChecklistId = searchParams.get('checklistId');
  
  const [taskTypes, setTaskTypes] = useState([]);
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  const [checklistItems, setChecklistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
  const [checklistId, setChecklistId] = useState(initialChecklistId || null);
  const { fetchData } = useApiCaller();

  // Fetch task types on mount
  useEffect(() => {
    fetchTaskTypes();
  }, [qaReviewId]);

  const fetchTaskTypes = async () => {
    try {
      setLoading(true);
      const response = await fetchData("post", "tickets/fetchQAChecklist", {
        qaReviewId: qaReviewId,
        checklistId:checklistId
      });
      
      if (response?.success && response?.data) {
        setTaskTypes(response.data.taskTypes || []);
        setSelectedTaskType(null);
      }
    } catch (error) {
      console.error("Error fetching task types:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load QA checklist',
        background: '#1a1a1a',
        color: '#e5e5e5'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch checklist items when task type is selected
  useEffect(() => {
    if (selectedTaskType) {
      fetchChecklistItems(selectedTaskType.taskType);
    } else {
      setChecklistItems([]);
      setFormData({});
    }
  }, [selectedTaskType]);

  const fetchChecklistItems = async (taskType) => {
    try {
      setLoading(true);
      // If we have a checklistId, we might want to fetch existing checklist data
      let url = `tickets/fetchQAChecklistBytaskType?taskType=${taskType}`;
      if (checklistId) {
        url += `&checklistId=${checklistId}`;
      }
      const response = await fetchData("get", url);
      
      if (response?.success && response?.data) {
        setChecklistItems(response.data.checklistItems || []);
        const initialData = {};
        response.data.checklistItems.forEach(item => {
          if (item.value !== undefined && item.value !== null) {
            initialData[item.key] = item.value;
          } else {
            initialData[item.key] = item.fieldType === 'multi_select' ? [] : '';
          }
        });
        setFormData(initialData);
      }
    } catch (error) {
      console.error("Error fetching checklist items:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load checklist items',
        background: '#1a1a1a',
        color: '#e5e5e5'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key, value, fieldType) => {
    let newValue = value;
    
    if (fieldType === 'multi_select') {
      const currentValues = formData[key] || [];
      if (currentValues.includes(value)) {
        newValue = currentValues.filter(v => v !== value);
      } else {
        newValue = [...currentValues, value];
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [key]: newValue
    }));
  };

  const validateForm = () => {
    if (!selectedTaskType) {
      Swal.fire({
        icon: 'warning',
        title: 'No Task Type Selected',
        text: 'Please select a task type before submitting',
        background: '#1a1a1a',
        color: '#e5e5e5',
        confirmButtonColor: '#e50914'
      });
      return false;
    }

    const requiredFields = checklistItems.filter(item => item.required);
    const missingFields = [];
    
    requiredFields.forEach(item => {
      const value = formData[item.key];
      if (!value || (Array.isArray(value) && value.length === 0)) {
        missingFields.push(item.label);
      }
    });
    
    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Required Fields',
        html: `Please fill in the following required fields:<br/><strong>${missingFields.join(', ')}</strong>`,
        background: '#1a1a1a',
        color: '#e5e5e5',
        confirmButtonColor: '#e50914'
      });
      return false;
    }
    return true;
  };

  const saveChecklist = async () => {
    if (!selectedTaskType) {
      Swal.fire({
        icon: 'warning',
        title: 'No Task Type Selected',
        text: 'Please select a task type to save',
        background: '#1a1a1a',
        color: '#e5e5e5',
        confirmButtonColor: '#e50914'
      });
      return;
    }
    
    try {
      setSaving(true);
      
      const checklistItemsData = checklistItems.map(item => ({
        key: item.key,
        label: item.label,
        value: formData[item.key] || null,
        isAnswered: formData[item.key] && (Array.isArray(formData[item.key]) ? formData[item.key].length > 0 : formData[item.key] !== ''),
        ...(item.fieldType && { fieldType: item.fieldType }),
        ...(item.options && { options: item.options }),
        ...(item.required !== undefined && { required: item.required })
      }));
      
      const saveData = {
        qaReviewId: qaReviewId,
        taskType: selectedTaskType.taskType,
        checklistItems: checklistItemsData
      };
      
      // Include checklistId if it exists
      if (checklistId) {
        saveData.checklistId = checklistId;
      }
      
      const response = await fetchData("post", "tickets/saveQAChecklist", saveData);
      
      if (response?.success) {
        // Store the checklistId if it's returned from the API
        if (response.data?.checklistId) {
          setChecklistId(response.data.checklistId);
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Saved Successfully',
          text: 'Progress has been saved',
          timer: 2000,
          showConfirmButton: false,
          background: '#1a1a1a',
          color: '#e5e5e5'
        });
      }
    } catch (error) {
      console.error("Error saving checklist:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save checklist',
        background: '#1a1a1a',
        color: '#e5e5e5'
      });
    } finally {
      setSaving(false);
    }
  };

  const submitChecklist = async () => {
    if (!validateForm()) {
      return;
    }
    
    if (!checklistId) {
      Swal.fire({
        icon: 'warning',
        title: 'No Checklist Found',
        text: 'Please save the checklist first before submitting',
        background: '#1a1a1a',
        color: '#e5e5e5',
        confirmButtonColor: '#e50914'
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const submitData = {
        checklistId: checklistId
      };
      
      const response = await fetchData("post", "tickets/submitQAChecklist", submitData);
      
      if (response?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Submitted Successfully',
          text: 'QA checklist has been submitted',
          timer: 2000,
          showConfirmButton: false,
          background: '#1a1a1a',
          color: '#e5e5e5'
        });
        
        // Close the tab/window after submission
        if (onClose) {
          onClose();
        } else {
          window.close();
        }
      }
    } catch (error) {
      console.error("Error submitting checklist:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit checklist',
        background: '#1a1a1a',
        color: '#e5e5e5'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (item) => {
    const value = formData[item.key] || (item.fieldType === 'multi_select' ? [] : '');
    
    switch (item.fieldType) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(item.key, e.target.value, item.fieldType)}
            style={styles.input}
            placeholder={`Enter ${item.label.toLowerCase()}...`}
            required={item.required}
          />
        );
        
      case 'multi_select':
        return (
          <div style={styles.multiSelectContainer}>
            {item.options.map(option => (
              <label key={option} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={value.includes(option)}
                  onChange={() => handleInputChange(item.key, option, item.fieldType)}
                  style={styles.checkbox}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );
        
      case 'single_select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(item.key, e.target.value, item.fieldType)}
            style={styles.select}
            required={item.required}
          >
            <option value="">Select an option...</option>
            {item.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
        
      default:
        return null;
    }
  };

  if (loading && taskTypes.length === 0) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading checklist...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>QA Checklist</h2>
        <button onClick={onClose || (() => window.close())} style={styles.closeButton}>×</button>
      </div>
      
      <div style={styles.taskTypeSection}>
        <h3 style={styles.sectionTitle}>Select Task Type</h3>
        <div style={styles.radioGroup}>
          {taskTypes.map((taskType, index) => (
            <label key={index} style={styles.radioLabel}>
              <input
                type="radio"
                name="taskType"
                value={taskType.taskType}
                checked={selectedTaskType?.taskType === taskType.taskType}
                onChange={() => setSelectedTaskType(taskType)}
                style={styles.radioInput}
              />
              <span style={styles.radioText}>{taskType.taskTypeLabel}</span>
            </label>
          ))}
        </div>
      </div>
      
      {selectedTaskType && (
        <div style={styles.formContainer}>
          <h3 style={styles.formTitle}>
            {selectedTaskType.taskTypeLabel} Checklist
          </h3>
          
          {loading ? (
            <div style={styles.loadingSmall}>
              <div style={styles.spinnerSmall}></div>
              <p>Loading checklist items...</p>
            </div>
          ) : (
            <>
              <div style={styles.fieldsContainer}>
                {checklistItems.map((item, index) => (
                  <div key={index} style={styles.fieldGroup}>
                    <label style={styles.label}>
                      {item.label}
                      {item.required && <span style={styles.requiredStar}>*</span>}
                    </label>
                    {renderField(item)}
                  </div>
                ))}
              </div>
              
              <div style={styles.buttonContainer}>
                <button
                  onClick={saveChecklist}
                  disabled={saving || submitting}
                  style={styles.saveButton}
                >
                  {saving ? 'Saving...' : 'Save Progress'}
                </button>
                <button
                  onClick={submitChecklist}
                  disabled={saving || submitting || !checklistId}
                  style={{
                    ...styles.submitButton,
                    opacity: (!checklistId) ? 0.6 : 1,
                    cursor: (!checklistId) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Checklist'}
                </button>
              </div>
              
              {checklistId && (
                <div style={styles.checklistIdInfo}>
                  <small>Checklist ID: {checklistId}</small>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#141414',
    color: '#ffffff',
    fontFamily: "'Netflix Sans', 'Helvetica Neue', 'Segoe UI', Roboto, Arial, sans-serif",
    padding: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 32px',
    background: '#1a1a1a',
    borderBottom: '1px solid #404040',
    marginBottom: '20px',
    borderRadius: '8px'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#e50914'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    color: '#757575',
    transition: 'color 0.2s'
  },
  taskTypeSection: {
    background: '#1a1a1a',
    borderRadius: '12px',
    padding: '24px 32px',
    margin: '0 32px 24px 32px',
    border: '1px solid #404040'
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#e5e5e5'
  },
  radioGroup: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    padding: '10px 16px',
    background: '#2a2a2a',
    borderRadius: '8px',
    transition: 'all 0.2s',
    border: '1px solid #404040'
  },
  radioInput: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#e50914'
  },
  radioText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#e5e5e5'
  },
  formContainer: {
    background: '#1a1a1a',
    borderRadius: '12px',
    padding: '32px',
    margin: '0 32px',
    border: '1px solid #404040'
  },
  formTitle: {
    margin: '0 0 24px 0',
    fontSize: '20px',
    fontWeight: '600',
    paddingBottom: '12px',
    borderBottom: '2px solid #e50914',
    display: 'inline-block'
  },
  fieldsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e5e5e5'
  },
  requiredStar: {
    color: '#e50914',
    marginLeft: '4px'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #404040',
    background: '#2a2a2a',
    color: '#e5e5e5',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.2s'
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #404040',
    background: '#2a2a2a',
    color: '#e5e5e5',
    fontSize: '13px',
    cursor: 'pointer',
    outline: 'none'
  },
  multiSelectContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '12px',
    background: '#2a2a2a',
    borderRadius: '8px',
    border: '1px solid #404040'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#e5e5e5',
    padding: '6px',
    borderRadius: '6px',
    transition: 'background 0.2s'
  },
  checkbox: {
    cursor: 'pointer',
    width: '18px',
    height: '18px',
    accentColor: '#e50914'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#141414',
    color: '#ffffff'
  },
  loadingSmall: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    gap: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #404040',
    borderTopColor: '#e50914',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  },
  spinnerSmall: {
    width: '30px',
    height: '30px',
    border: '3px solid #404040',
    borderTopColor: '#e50914',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  buttonContainer: {
    display: 'flex',
    gap: '16px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid #404040'
  },
  saveButton: {
    padding: '12px 24px',
    background: '#2a2a2a',
    border: '1px solid #404040',
    borderRadius: '8px',
    color: '#e5e5e5',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  submitButton: {
    padding: '12px 24px',
    background: '#e50914',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  checklistIdInfo: {
    marginTop: '16px',
    padding: '8px',
    textAlign: 'center',
    fontSize: '11px',
    color: '#757575',
    borderTop: '1px solid #404040',
    paddingTop: '16px'
  }
};

export default QAChecklist;
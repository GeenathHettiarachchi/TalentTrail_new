import React, { useState, useEffect } from "react";
import {
  FiX,
  FiServer,
  FiLayers,
  FiChevronDown,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBook,
  FiSearch,
  FiChevronLeft,
  FiCheck
} from "react-icons/fi";
import styles from "./InternForm.module.css";

// Progress Indicator Component
const ProgressIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, label: "University" },
    { number: 2, label: "Faculty" },
    { number: 3, label: "Degree" }
  ];

  return (
    <div className={styles.progressIndicator}>
      <div className={styles.progressSteps}>
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className={styles.progressStep}>
              <div className={`${styles.stepNumber} ${
                step.number <= currentStep ? styles.active : ''
              }`}>
                {step.number}
              </div>
              <span className={`${styles.stepLabel} ${
                step.number <= currentStep ? styles.active : ''
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`${styles.progressConnector} ${
                step.number < currentStep ? styles.active : ''
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Institute Popup Component
const InstitutePopup = ({
  isOpen,
  onClose,
  onInstituteSelect,
  currentInstitute = null
}) => {
  const [step, setStep] = useState("university");
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedDegree, setSelectedDegree] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Data
  const universities = [
    { id: 1, name: "University of Moratuwa" },
    { id: 2, name: "University of Colombo" },
    { id: 3, name: "University of Peradeniya" },
    { id: 4, name: "University of Kelaniya" },
    { id: 5, name: "University of Sri Jayewardenepura" },
    { id: 6, name: "Open University of Sri Lanka" },
    { id: 7, name: "Sri Lanka Institute of Information Technology (SLIIT)" },
    { id: 8, name: "Informatics Institute of Technology (IIT)" }
  ];

  const faculties = [
    { id: 1, name: "Faculty of Information Technology" },
    { id: 2, name: "Faculty of Engineering" },
    { id: 3, name: "Faculty of Science" },
    { id: 4, name: "Faculty of Management" },
    { id: 5, name: "Faculty of Arts" },
    { id: 6, name: "Faculty of Medicine" },
    { id: 7, name: "Faculty of Law" },
    { id: 8, name: "Faculty of Architecture" },
    { id: 9, name: "Faculty of Computing" },
    { id: 10, name: "Faculty of Business" }
  ];

  const universityDegrees = {
    "University of Moratuwa": [
      "BSc in Computer Science & Engineering",
      "BSc in Electrical Engineering", 
      "BSc in Civil Engineering",
      "BSc in Mechanical Engineering",
      "BSc in Electronics & Telecommunication Engineering"
    ],
    "University of Colombo": [
      "BSc in Computer Science",
      "BSc in Information Systems",
      "BSc in Statistics & Computer Science",
      "BSc in Physical Science",
      "BSc in Biological Science"
    ],
    "University of Peradeniya": [
      "BSc in Engineering",
      "BSc in Science",
      "BSc in Medicine",
      "BSc in Dental Surgery",
      "BSc in Veterinary Science"
    ],
    "University of Kelaniya": [
      "BSc in Management & Information Technology",
      "BSc in Industrial Management",
      "BSc in Science",
      "BSc in Commerce",
      "BSc in Social Sciences"
    ],
    "University of Sri Jayewardenepura": [
      "BSc in Computer Science",
      "BSc in Information Technology",
      "BSc in Business Management",
      "BSc in Finance",
      "BSc in Marketing"
    ],
    "Open University of Sri Lanka": [
      "BSc in Computer Science",
      "BSc in Information Technology",
      "BSc in Engineering",
      "BSc in Business Management",
      "BSc in Social Sciences"
    ],
    "Sri Lanka Institute of Information Technology (SLIIT)": [
      "BSc in Computer Science",
      "BSc in Information Technology",
      "BSc in Software Engineering",
      "BSc in Cyber Security",
      "BSc in Data Science"
    ],
    "Informatics Institute of Technology (IIT)": [
      "BSc in Computer Science",
      "BSc in Software Engineering",
      "BSc in Cyber Security",
      "BSc in Business Information Systems",
      "BSc in Data Science"
    ]
  };

  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [filteredFaculties, setFilteredFaculties] = useState([]);
  const [filteredDegrees, setFilteredDegrees] = useState([]);

   // Initialize with current values
  useEffect(() => {
    if (currentInstitute && isOpen) {
      setSelectedUniversity(currentInstitute.university || null);
      setSelectedFaculty(currentInstitute.faculty || null);
      setSelectedDegree(currentInstitute.degree || null);
    } else {
      setSelectedUniversity(null);
      setSelectedFaculty(null);
      setSelectedDegree(null);
    }
    setStep("university");
    setSearchTerm("");
  }, [currentInstitute, isOpen]);

  // Filter universities based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = universities.filter(uni =>
        uni.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUniversities(filtered);
    } else {
      setFilteredUniversities(universities);
    }
  }, [searchTerm, universities]);

  // Filter faculties when university is selected
  useEffect(() => {
    if (selectedUniversity) {
      setFilteredFaculties(faculties);
    } else {
      setFilteredFaculties([]);
    }
  }, [selectedUniversity, faculties]);

  // Get degrees for selected university
  useEffect(() => {
    if (selectedUniversity && selectedFaculty) {
      const universityName = selectedUniversity.name;
      const availableDegrees = universityDegrees[universityName] || [
        "BSc in Computer Science",
        "BSc in Information Technology", 
        "BSc in Software Engineering",
        "BSc in Information Systems",
        "Bachelor of Business Administration"
      ];
      setFilteredDegrees(availableDegrees);
    } else {
      setFilteredDegrees([]);
    }
  }, [selectedUniversity, selectedFaculty]);

  const handleUniversitySelect = (university) => {
    setSelectedUniversity(university);
    setStep("faculty");
    setSearchTerm("");
  };

  const handleFacultySelect = (faculty) => {
    setSelectedFaculty(faculty);
    setStep("degree");
    setSearchTerm("");
  };

  const handleDegreeSelect = (degree) => {
    setSelectedDegree(degree);
  };

  const handleBack = () => {
    if (step === "degree") {
      setStep("faculty");
      setSelectedDegree(null);
    } else if (step === "faculty") {
      setStep("university");
      setSelectedFaculty(null);
    }
  };

  const handleSubmit = () => {
    if (selectedUniversity && selectedFaculty && selectedDegree) {
      onInstituteSelect({
        university: selectedUniversity.name,
        faculty: selectedFaculty.name,
        degree: selectedDegree,
        universityId: selectedUniversity.id,
        facultyId: selectedFaculty.id
      });
      onClose();
    }
  };

  const handleClose = () => {
    setStep("university");
    setSelectedUniversity(null);
    setSelectedFaculty(null);
    setSelectedDegree(null);
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  const getStepTitle = () => {
    switch (step) {
      case "university":
        return "Select University";
      case "faculty":
        return "Select Faculty";
      case "degree":
        return "Select Degree";
      default:
        return "Select Institute";
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case "faculty":
        return `University: ${selectedUniversity?.name}`;
      case "degree":
        return `University: ${selectedUniversity?.name} • Faculty: ${selectedFaculty?.name}`;
      default:
        return "Choose your educational institution";
    }
  };

  const getCurrentStepNumber = () => {
    switch (step) {
      case "university": return 1;
      case "faculty": return 2;
      case "degree": return 3;
      default: return 1;
    }
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.institutePopup} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.popupHeader}>
          {step !== "university" && (
            <button 
              className={styles.backButton} 
              onClick={handleBack}
            >
              <FiChevronLeft />
            </button>
          )}
          <div className={styles.popupTitleSection}>
            <h2 className={styles.popupTitle}>{getStepTitle()}</h2>
            <p className={styles.popupSubtitle}>{getStepSubtitle()}</p>
          </div>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
          >
            <FiX />
          </button>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator currentStep={getCurrentStepNumber()} />

        {/* Search Bar - Only show for university and faculty selection */}
        {(step === "university" || step === "faculty") && (
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <FiSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder={
                  step === "university" 
                    ? "Search universities..." 
                    : "Search faculties..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        )}

        
        {/* Content */}
        <div className={styles.popupContent}>
          {step === "university" ? (
            <div className={styles.listContainer}>
              <h3 className={styles.sectionTitle}>Universities in Sri Lanka</h3>
              <div className={styles.list}>
                {filteredUniversities.length > 0 ? (
                  filteredUniversities.map((university) => (
                    <button
                      key={university.id}
                      className={`${styles.listItem} ${
                        selectedUniversity?.id === university.id ? styles.selected : ""
                      }`}
                      onClick={() => handleUniversitySelect(university)}
                    >
                      <div className={styles.universityInfo}>
                        <span className={styles.itemText}>{university.name}</span>
                        <span className={styles.itemDescription}>
                          {universityDegrees[university.name]?.length || 5} degrees available
                        </span>
                      </div>
                      {selectedUniversity?.id === university.id && (
                        <FiCheck className={styles.checkIcon} />
                      )}
                    </button>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>No universities found</p>
                  </div>
                )}
              </div>
            </div>
          ) : step === "faculty" ? (
            <div className={styles.listContainer}>
              <div className={styles.selectedSection}>
                <span className={styles.selectedLabel}>Selected University:</span>
                <span className={styles.selectedValue}>{selectedUniversity?.name}</span>
              </div>
              
              <h3 className={styles.sectionTitle}>Faculties & Departments</h3>
              <div className={styles.list}>
                {filteredFaculties.length > 0 ? (
                  filteredFaculties.map((faculty) => (
                    <button
                      key={faculty.id}
                      className={`${styles.listItem} ${
                        selectedFaculty?.id === faculty.id ? styles.selected : ""
                      }`}
                      onClick={() => handleFacultySelect(faculty)}
                    >
                      <div className={styles.facultyInfo}>
                        <span className={styles.itemText}>{faculty.name}</span>
                        <span className={styles.itemDescription}>
                          Multiple degree programs available
                        </span>
                      </div>
                      {selectedFaculty?.id === faculty.id && (
                        <FiCheck className={styles.checkIcon} />
                      )}
                    </button>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>No faculties available for {selectedUniversity?.name}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Degree Selection Step
            <div className={styles.listContainer}>
              <div className={styles.selectedSection}>
                <div className={styles.selectedRow}>
                  <span className={styles.selectedLabel}>University:</span>
                  <span className={styles.selectedValue}>{selectedUniversity?.name}</span>
                </div>
                <div className={styles.selectedRow}>
                  <span className={styles.selectedLabel}>Faculty:</span>
                  <span className={styles.selectedValue}>{selectedFaculty?.name}</span>
                </div>
              </div>
              
              <h3 className={styles.sectionTitle}>
                <FiBook className={styles.sectionTitleIcon} />
                Available Degrees
              </h3>
              <p className={styles.sectionDescription}>
                Select your degree program from the available options
              </p>
              
              <div className={styles.degreeList}>
                {filteredDegrees.length > 0 ? (
                  filteredDegrees.map((degree, index) => (
                    <button
                      key={index}
                      className={`${styles.degreeItem} ${
                        selectedDegree === degree ? styles.selected : ""
                      }`}
                      onClick={() => handleDegreeSelect(degree)}
                    >
                      <div className={styles.degreeInfo}>
                        <span className={styles.degreeName}>{degree}</span>
                        <span className={styles.degreeType}>Undergraduate Degree</span>
                      </div>
                      {selectedDegree === degree && (
                        <FiCheck className={styles.checkIcon} />
                      )}
                    </button>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <p>No degrees available for this faculty</p>
                    <button 
                      className={styles.customDegreeButton}
                      onClick={() => {
                        const customDegree = prompt("Please enter your degree name:");
                        if (customDegree) {
                          setSelectedDegree(customDegree);
                        }
                      }}
                    >
                      Add Custom Degree
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
{/* Footer Actions */}
        <div className={styles.popupFooter}>
          <button 
            className={styles.cancelButton} 
            onClick={handleClose}
          >
            Close
          </button>
          
          {step === "degree" && (
            <button 
              className={`${styles.submitButton} ${
                !selectedDegree ? styles.disabled : ""
              }`}
              onClick={handleSubmit}
              disabled={!selectedDegree}
            >
              {currentInstitute ? "Update Institute" : "Select Institute"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


// Academic Details Form Component
const AcademicDetailsForm = ({
  isOpen,
  onClose,
  onSubmit,
  academicDetails = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    university: "",
    faculty: "",
    degree: "",
    yearOfCompletion: "",
    isCurrent: false
  });

  const [errors, setErrors] = useState({});

  const universities = [
    { id: 1, name: "University of Moratuwa" },
    { id: 2, name: "University of Colombo" },
    { id: 3, name: "University of Peradeniya" },
    { id: 4, name: "University of Kelaniya" },
    { id: 5, name: "University of Sri Jayewardenepura" }
  ];

  const faculties = [
    { id: 1, name: "Faculty of Information Technology" },
    { id: 2, name: "Faculty of Engineering" },
    { id: 3, name: "Faculty of Science" },
    { id: 4, name: "Faculty of Management" }
  ];

  useEffect(() => {
    if (academicDetails) {
      setFormData({
        university: academicDetails.university || "",
        faculty: academicDetails.faculty || "",
        degree: academicDetails.degree || "",
        yearOfCompletion: academicDetails.yearOfCompletion || "",
        isCurrent: academicDetails.isCurrent || false
      });
    } else {
      setFormData({
        university: "",
        faculty: "",
        degree: "",
        yearOfCompletion: "",
        isCurrent: false
      });
    }
    setErrors({});
  }, [academicDetails, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.university.trim()) {
      newErrors.university = "University is required";
    }
    if (!formData.faculty.trim()) {
      newErrors.faculty = "Faculty is required";
    }
    if (!formData.degree.trim()) {
      newErrors.degree = "Degree is required";
    }
    if (!formData.isCurrent && !formData.yearOfCompletion) {
      newErrors.yearOfCompletion = "Year of completion is required";
    }

    if (formData.yearOfCompletion) {
      const currentYear = new Date().getFullYear();
      const year = parseInt(formData.yearOfCompletion);
      if (year < 1900 || year > currentYear + 5) {
        newErrors.yearOfCompletion = "Please enter a valid year";
      }
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {academicDetails ? "Edit Academic Details" : "Add Academic Details"}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isLoading}
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="university" className={styles.label}>
                University *
              </label>
              <select
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className={`${styles.input} ${errors.university ? styles.inputError : ""}`}
                disabled={isLoading}
              >
                <option value="">Select University</option>
                {universities.map((uni) => (
                  <option key={uni.id} value={uni.name}>
                    {uni.name}
                  </option>
                ))}
              </select>
              {errors.university && (
                <span className={styles.errorText}>{errors.university}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="faculty" className={styles.label}>
                Faculty *
              </label>
              <select
                id="faculty"
                name="faculty"
                value={formData.faculty}
                onChange={handleChange}
                className={`${styles.input} ${errors.faculty ? styles.inputError : ""}`}
                disabled={isLoading}
              >
                <option value="">Select Faculty</option>
                {faculties.map((faculty) => (
                  <option key={faculty.id} value={faculty.name}>
                    {faculty.name}
                  </option>
                ))}
              </select>
              {errors.faculty && (
                <span className={styles.errorText}>{errors.faculty}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="degree" className={styles.label}>
                Degree *
              </label>
              <input
                type="text"
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className={`${styles.input} ${errors.degree ? styles.inputError : ""}`}
                placeholder="e.g., BSc in Computer Science"
                disabled={isLoading}
              />
              {errors.degree && (
                <span className={styles.errorText}>{errors.degree}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="yearOfCompletion" className={styles.label}>
                Year of Completion *
              </label>
              <input
                type="number"
                id="yearOfCompletion"
                name="yearOfCompletion"
                value={formData.yearOfCompletion}
                onChange={handleChange}
                min="1900"
                max="2030"
                disabled={formData.isCurrent || isLoading}
                className={`${styles.input} ${errors.yearOfCompletion ? styles.inputError : ""}`}
                placeholder="e.g., 2024"
              />
              {errors.yearOfCompletion && (
                <span className={styles.errorText}>{errors.yearOfCompletion}</span>
              )}
            </div>

            <div className={`${styles.inputGroup} ${styles.academicCheckboxContainer}`}>
              <label className={styles.academicCheckboxLabel}>
                <input
                  type="checkbox"
                  name="isCurrent"
                  checked={formData.isCurrent}
                  onChange={handleChange}
                  className={styles.academicCheckbox}
                  disabled={isLoading}
                />
                <span className={styles.academicCheckboxText}>Currently studying</span>
              </label>
              <p className={styles.academicCheckboxHelp}>
                Check this if you are currently studying. Year of completion will be disabled.
              </p>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner} />
                  {academicDetails ? "Updating..." : "Adding..."}
                </>
              ) : academicDetails ? (
                "Update Details"
              ) : (
                "Add Details"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Academic Details List Component
const AcademicDetailsList = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState(null);
  const [academicDetails, setAcademicDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedDetails = localStorage.getItem('academicDetails');
    if (savedDetails) {
      setAcademicDetails(JSON.parse(savedDetails));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('academicDetails', JSON.stringify(academicDetails));
  }, [academicDetails]);

  const handleAddNew = () => {
    setEditingDetail(null);
    setIsFormOpen(true);
  };

  const handleEdit = (detail) => {
    setEditingDetail(detail);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this academic detail?")) {
      setAcademicDetails(prev => prev.filter(detail => detail.id !== id));
    }
  };

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (editingDetail) {
      setAcademicDetails(prev =>
        prev.map(detail =>
          detail.id === editingDetail.id
            ? { ...formData, id: editingDetail.id }
            : detail
        )
      );
    } else {
      const newDetail = {
        ...formData,
        id: Date.now()
      };
      setAcademicDetails(prev => [...prev, newDetail]);
    }
    
    setIsLoading(false);
    setIsFormOpen(false);
    setEditingDetail(null);
  };

  const getStatusBadge = (isCurrent) => {
    return isCurrent ? (
      <span className={styles.academicCurrentBadge}>Current</span>
    ) : (
      <span className={styles.academicCompletedBadge}>Completed</span>
    );
  };

  return (
    <div className={styles.academicContainer}>
      <div className={styles.academicHeader}>
        <div className={styles.academicTitleSection}>
          <FiBook className={styles.academicTitleIcon} />
          <h2 className={styles.academicTitle}>Academic Details (Sri Lanka · Undergraduate)</h2>
        </div>
        <button
          type="button"
          className={styles.academicAddButton}
          onClick={handleAddNew}
        >
          <FiPlus className={styles.academicAddIcon} />
          Add Academic Details
        </button>
      </div>

      <div className={styles.academicDetailsList}>
        {academicDetails.length === 0 ? (
          <div className={styles.academicEmptyState}>
            <FiBook className={styles.academicEmptyIcon} />
            <h3>No Academic Details Added</h3>
            <p>Click "Add Academic Details" to add your educational background.</p>
          </div>
        ) : (
          academicDetails.map((detail) => (
            <div key={detail.id} className={styles.academicDetailCard}>
              <div className={styles.academicDetailInfo}>
                <div className={styles.academicDetailHeader}>
                  <h3 className={styles.academicDegree}>{detail.degree}</h3>
                  {getStatusBadge(detail.isCurrent)}
                </div>
                <div className={styles.academicDetailMeta}>
                  <p className={styles.academicUniversity}>
                    <strong>University:</strong> {detail.university}
                  </p>
                  <p className={styles.academicFaculty}>
                    <strong>Faculty:</strong> {detail.faculty}
                  </p>
                  <p className={styles.academicYear}>
                    <strong>Status:</strong>{" "}
                    {detail.isCurrent 
                      ? "Currently studying" 
                      : `Completed in ${detail.yearOfCompletion}`
                    }
                  </p>
                </div>
              </div>
              <div className={styles.academicActions}>
                <button
                  type="button"
                  className={styles.academicEditButton}
                  onClick={() => handleEdit(detail)}
                  title="Edit details"
                >
                  <FiEdit2 />
                </button>
                <button
                  type="button"
                  className={styles.academicDeleteButton}
                  onClick={() => handleDelete(detail.id)}
                  title="Delete details"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <AcademicDetailsForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDetail(null);
        }}
        onSubmit={handleSubmit}
        academicDetails={editingDetail}
        isLoading={isLoading}
      />
    </div>
  );
};

const InternForm = ({
  isOpen,
  onClose,
  onSubmit,
  intern = null,
  isLoading = false,
  internOnly = false,
}) => {
  // Helpers to coerce incoming values
  const toList = (v) =>
    Array.isArray(v)
      ? v
      : typeof v === "string" && v.trim()
      ? v.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

  const [formData, setFormData] = useState({
    internCode: "",
    name: "",
    email: "",
    institute: "",
    trainingStartDate: "",
    trainingEndDate: "",
    role: "",
    // New dev sections
    languagesAndFrameworks: [],
    projects: [],
  });

  const [errors, setErrors] = useState({});
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProjOpen, setIsProjOpen] = useState(false);

  // Options (adjust to your needs)
  const languagesList = [
    "Java",
    "Python",
    "C#",
    "MERN",
    "Laravel",
    "Spring Boot",
    ".NET",
    "PHP",
    "React",
    "Angular",
    "Vue.js",
  ];

  const projectsList = [
    "Portfolio Website",
    "Task Tracker",
    "E-Commerce Platform",
    "Admin Dashboard",
    "Inventory Manager",
    "CRM Application",
    "HR Portal",
  ];

  useEffect(() => {
    if (intern) {
      setFormData({
        internCode: intern.internCode || "",
        name: intern.name || "",
        email: intern.email || "",
        institute: intern.institute || "",
        trainingStartDate: intern.trainingStartDate || "",
        trainingEndDate: intern.trainingEndDate || "",
        role: intern.role || "",
        languagesAndFrameworks: toList(intern.languagesAndFrameworks),
        projects: toList(intern.projects),
      });
    } else {
      setFormData({
        internCode: "",
        name: "",
        email: "",
        institute: "",
        trainingStartDate: "",
        trainingEndDate: "",
        role: "",
        languagesAndFrameworks: [],
        projects: [],
      });
    }
    setErrors({});
    setIsLangOpen(false);
    setIsProjOpen(false);
  }, [intern, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const toggleMulti = (field, value) => {
    setFormData((prev) => {
      const next = new Set(prev[field] || []);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [field]: Array.from(next) };
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // In internOnly mode:End Date validation
    if (internOnly) {
      if (!formData.trainingEndDate) {
        newErrors.trainingEndDate = "Training end date is required";
      }
      return newErrors;
    }

    // Admin/full edit validations
    if (!formData.internCode.trim()) newErrors.internCode = "Intern code is required";
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.institute.trim()) newErrors.institute = "Institute is required";
    if (!formData.trainingStartDate) newErrors.trainingStartDate = "Start date is required";
    if (!formData.trainingEndDate) newErrors.trainingEndDate = "End date is required";
    if (formData.trainingStartDate && formData.trainingEndDate) {
      if (new Date(formData.trainingStartDate) >= new Date(formData.trainingEndDate)) {
        newErrors.trainingEndDate = "End date must be after start date";
      }
    }

    

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Prepare payload
    const submitData = {
      ...formData,
      languagesAndFrameworks: formData.languagesAndFrameworks || [],
      projects: formData.projects || [],
    };

    if (intern && intern.internId) {
      submitData.internId = intern.internId;
    }

    onSubmit(submitData);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {internOnly ? "Request End Date Update" : (intern ? "Edit Intern" : "Add New Intern")}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={isLoading}
          >
            <FiX />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Intern-only: End Date only */}
          {internOnly ? (
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label htmlFor="trainingEndDate" className={styles.label}>
                  New Training End Date *
                </label>
                <input
                  type="date"
                  id="trainingEndDate"
                  name="trainingEndDate"
                  value={formData.trainingEndDate}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.trainingEndDate ? styles.inputError : ""
                  }`}
                />
                {errors.trainingEndDate && (
                  <span className={styles.errorText}>{errors.trainingEndDate}</span>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Admin/full edit grid */}
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label htmlFor="internCode" className={styles.label}>Intern Code </label>
                  <input
                    type="text"
                    id="internCode"
                    name="internCode"
                    value={formData.internCode}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.internCode ? styles.inputError : ""}`}
                    placeholder="e.g., INT001"
                    disabled
                  />
                  {errors.internCode && <span className={styles.errorText}>{errors.internCode}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="name" className={styles.label}>Full Name </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                    placeholder="Enter full name"
                    disabled
                  />
                  {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>Email </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                    placeholder="Enter email address"
                    disabled
                  />
                  {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="institute" className={styles.label}>Institute </label>
                  <input
                    type="text"
                    id="institute"
                    name="institute"
                    value={formData.institute}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.institute ? styles.inputError : ""}`}
                    placeholder="Enter institute name"
                    disabled
                  />
                  {errors.institute && <span className={styles.errorText}>{errors.institute}</span>}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="trainingStartDate" className={styles.label}>Training Start Date </label>
                  <input
                    type="date"
                    id="trainingStartDate"
                    name="trainingStartDate"
                    value={formData.trainingStartDate}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.trainingStartDate ? styles.inputError : ""}`}
                    disabled
                  />
                  {errors.trainingStartDate && (
                    <span className={styles.errorText}>{errors.trainingStartDate}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="trainingEndDate" className={styles.label}>Training End Date *</label>
                  <input
                    type="date"
                    id="trainingEndDate"
                    name="trainingEndDate"
                    value={formData.trainingEndDate}
                    onChange={handleChange}
                    className={`${styles.input} ${errors.trainingEndDate ? styles.inputError : ""}`}
                  />
                  {errors.trainingEndDate && (
                    <span className={styles.errorText}>{errors.trainingEndDate}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="role" className={styles.label}>Role</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., Full Stack Developer"
                  />
                </div>
              </div>

              {/* Developer sections */}
              <div className={styles.formGrid}>
                {/* Languages & Frameworks */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <FiServer className={styles.labelIcon} />
                    Languages & Frameworks
                  </label>

                  <div
                    className={`${styles.multiSelect} ${
                      errors.languagesAndFrameworks ? styles.inputError : ""
                    }`}
                    onClick={() => !isLoading && setIsLangOpen((v) => !v)}
                    role="button"
                    aria-expanded={isLangOpen}
                  >
                    <div className={styles.multiControl}>
                      <div className={styles.multiValue}>
                        {formData.languagesAndFrameworks?.length
                          ? formData.languagesAndFrameworks.join(", ")
                          : "Select one or more…"}
                      </div>
                      <FiChevronDown className={styles.caret} />
                    </div>

                    {isLangOpen && (
                      <div
                        className={styles.multiMenu}
                        onClick={(e) => e.stopPropagation()}
                        role="listbox"
                      >
                        {languagesList.map((opt) => (
                          <label key={opt} className={styles.optionRow}>
                            <input
                              type="checkbox"
                              checked={formData.languagesAndFrameworks.includes(opt)}
                              onChange={() => toggleMulti("languagesAndFrameworks", opt)}
                              disabled={isLoading}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {errors.languagesAndFrameworks && (
                    <span className={styles.errorText}>
                      {errors.languagesAndFrameworks}
                    </span>
                  )}
                </div>

                {/* Projects */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>
                    <FiLayers className={styles.labelIcon} />
                    Projects
                  </label>

                  <div
                    className={`${styles.multiSelect} ${
                      errors.projects ? styles.inputError : ""
                    }`}
                    onClick={() => !isLoading && setIsProjOpen((v) => !v)}
                    role="button"
                    aria-expanded={isProjOpen}
                  >
                    <div className={styles.multiControl}>
                      <div className={styles.multiValue}>
                        {formData.projects?.length
                          ? formData.projects.join(", ")
                          : "Select one or more…"}
                      </div>
                      <FiChevronDown className={styles.caret} />
                    </div>

                    {isProjOpen && (
                      <div
                        className={styles.multiMenu}
                        onClick={(e) => e.stopPropagation()}
                        role="listbox"
                      >
                        {projectsList.map((opt) => (
                          <label key={opt} className={styles.optionRow}>
                            <input
                              type="checkbox"
                              checked={formData.projects.includes(opt)}
                              onChange={() => toggleMulti("projects", opt)}
                              disabled={isLoading}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {errors.projects && (
                    <span className={styles.errorText}>{errors.projects}</span>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner} />
                  {internOnly ? "Submitting..." : "Saving..."}
                </>
              ) : internOnly ? (
                "Submit Request"
              ) : intern ? (
                "Update Intern"
              ) : (
                "Add Intern"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InternForm;

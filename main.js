document.addEventListener("DOMContentLoaded", () => {
  const dateOfRegistration = document.getElementById("date-of-registration");
  const registrationNumber = document.getElementById("registration-number");
  const insuranceStatus = document.getElementById("insurance-status");
  const insuranceFields = document.getElementById("insurance-fields");
  const dobInput = document.getElementById("dob");
  const ageInput = document.getElementById("age");
  const patientForm = document.getElementById("patient-form");
  const exportCsvButton = document.getElementById("export-csv");

  // Open or create an IndexedDB database
  const dbPromise = indexedDB.open('patient-register-db', 1);

  dbPromise.onsuccess = (event) => {
    const db = event.target.result;
    console.log('Database opened successfully!');
    // Fetch existing patients from IndexedDB and populate
    fetchPatientsFromIndexedDB(db);
  };

  dbPromise.onerror = (event) => {
    console.error('Error opening database:', event.target.error);
  };

  dbPromise.onupgradeneeded = (event) => {
    const db = event.target.result;

    // Create an object store to hold patient data
    const objectStore = db.createObjectStore('patients', {
      keyPath: 'registrationNumber', // Use the registration number as the unique identifier
    });

    // Create an index on the registration number (optional, but helpful for querying)
    objectStore.createIndex('registrationNumber', 'registrationNumber', { unique: true });

    console.log('Database and object store created successfully!');
  };

  // Save patient data to the IndexedDB database
  function savePatientData(db, patient) {
    const transaction = db.transaction(['patients'], 'readwrite');
    const objectStore = transaction.objectStore('patients');
    const request = objectStore.add(patient);  // This saves the patient data to IndexedDB

    request.onsuccess = () => {
      console.log('Patient data saved to IndexedDB');
    };

    request.onerror = (event) => {
      console.error('Error saving patient data:', event.target.error);
    };
  }

  // Fetch patients from IndexedDB and populate the form if necessary
  function fetchPatientsFromIndexedDB(db) {
    const transaction = db.transaction(['patients'], 'readonly');
    const objectStore = transaction.objectStore('patients');
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
      const patients = event.target.result;
      console.log('Fetched patients:', patients);
      // Optional: You could populate a table or display the list of patients
    };

    request.onerror = (event) => {
      console.error('Error fetching patients:', event.target.error);
    };
  }

  // Generate Registration Number dynamically
  const updateRegistrationNumber = () => {
    const serialNumber = prompt("Enter Serial Number (max 6 digits):");
    if (!serialNumber || !/^\d{1,6}$/.test(serialNumber)) {
      alert("Invalid Serial Number. Please enter up to 6 digits.");
      return;
    }
    const yearPart = new Date(dateOfRegistration.value).getFullYear().toString().slice(-2);
    registrationNumber.value = `${serialNumber}-${yearPart}`;
  };

  dateOfRegistration.addEventListener("change", updateRegistrationNumber);

  // Auto-calculate Age
  dobInput.addEventListener("change", () => {
    if (dobInput.value) {
      const dob = new Date(dobInput.value);
      const today = new Date();
      ageInput.value = today.getFullYear() - dob.getFullYear();
    } else {
      ageInput.value = "";
    }
  });

  // Show/Hide Insurance Fields based on initial value of Insurance Status
  const toggleInsuranceFields = () => {
    if (insuranceStatus.value === "insured") {
      insuranceFields.classList.remove("hidden");
      document.getElementById("insurance-name").required = true;
      document.getElementById("sub-district").required = true;
      document.getElementById("insurance-no").required = true;
      document.getElementById("insurance-id").required = true;
    } else {
      // Hide the insurance fields completely if non-insured
      insuranceFields.classList.add("hidden");
      document.getElementById("insurance-name").required = false;
      document.getElementById("sub-district").required = false;
      document.getElementById("insurance-no").required = false;
      document.getElementById("insurance-id").required = false;
    }
  };

  // Call the function to set visibility on page load based on stored value
  toggleInsuranceFields();

  // Show/Hide Insurance Fields when changing Insurance Status
  insuranceStatus.addEventListener("change", () => {
    toggleInsuranceFields();
  });

  // Save Patient Data
  patientForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!registrationNumber.value) {
      alert("Please generate a valid registration number before saving.");
      return;
    }

    const patient = {
      registrationNumber: registrationNumber.value,
      surname: document.getElementById("surname").value,
      otherNames: document.getElementById("other-names").value,
      sex: document.getElementById("sex").value,
      dateOfBirth: dobInput.value,
      age: ageInput.value,
      maritalStatus: document.getElementById("marital-status").value,
      occupation: document.getElementById("occupation").value,
      religion: document.getElementById("religion").value,
      telephone: document.getElementById("telephone").value,
      relativeAddress: document.getElementById("relative-address").value,
      insuranceStatus: insuranceStatus.value,
      insuranceName: document.getElementById("insurance-name").value,
      subDistrict: document.getElementById("sub-district").value,
      insuranceNo: document.getElementById("insurance-no").value,
      insuranceId: document.getElementById("insurance-id").value,
    };

    // If non-insured, remove insurance-related details and ensure the block is hidden
    if (insuranceStatus.value === "non-insured") {
      delete patient.insuranceName;
      delete patient.subDistrict;
      delete patient.insuranceNo;
      delete patient.insuranceId;
    }

    // Check for duplicate registration numbers in IndexedDB
    dbPromise.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['patients'], 'readonly');
      const objectStore = transaction.objectStore('patients');
      const request = objectStore.get(patient.registrationNumber);

      request.onsuccess = () => {
        if (request.result) {
          alert("Duplicate Registration Number! Please use a unique serial number.");
        } else {
          // Save the patient data if no duplicate
          savePatientData(db, patient);
          alert("Patient saved successfully!");
          patientForm.reset();
          insuranceFields.classList.add("hidden");
          registrationNumber.value = "";
        }
      };
    };
  });

  // Export Patients to CSV
  exportCsvButton.addEventListener("click", () => {
    const facilityName = prompt("Enter Facility Name:");
    if (!facilityName) {
      alert("Facility name is required for export.");
      return;
    }

    dbPromise.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['patients'], 'readonly');
      const objectStore = transaction.objectStore('patients');
      const request = objectStore.getAll();

      request.onsuccess = (event) => {
        const patients = event.target.result;
        if (patients.length === 0) {
          alert("No patient data available for export.");
          return;
        }

        const headers = Object.keys(patients[0]);
        const csvContent = [
          headers.join(","), // Header row
          ...patients.map((row) =>
            headers.map((field) => JSON.stringify(row[field] || "")).join(",")
          ),
        ].join("\n");

        // Get the current date and time for the file name
        const datetime = new Date().toISOString().split("T")[0] + "_" + new Date().toISOString().split("T")[1].split(".")[0];

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${facilityName}_patients_${datetime}.csv`;
        a.click();
      };

      request.onerror = (event) => {
        console.error('Error fetching patients for export:', event.target.error);
      };
    };
  });

  // Update footer year
  document.getElementById("current-year").textContent = new Date().getFullYear();
});
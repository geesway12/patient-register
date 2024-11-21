document.addEventListener("DOMContentLoaded", () => {
  const dbPromise = indexedDB.open('patient-register-db', 1);

  // DOM Elements
  const dateOfRegistration = document.getElementById("date-of-registration");
  const registrationNumber = document.getElementById("registration-number");
  const insuranceStatus = document.getElementById("insurance-status");
  const insuranceFields = document.getElementById("insurance-fields");
  const dobInput = document.getElementById("dob");
  const ageInput = document.getElementById("age");
  const patientForm = document.getElementById("patient-form");
  const exportCsvButton = document.getElementById("export-csv");

<<<<<<< HEAD
  // Summary Elements
  const totalRegisteredEl = document.getElementById("total-registered");
  const totalMaleEl = document.getElementById("total-male");
  const totalFemaleEl = document.getElementById("total-female");
  const totalInsuredEl = document.getElementById("total-insured");
  const totalNonInsuredEl = document.getElementById("total-non-insured");

  // IndexedDB Setup
  const dbPromise = indexedDB.open("patient-register-db", 1);

  dbPromise.onupgradeneeded = (event) => {
    const db = event.target.result;
    db.createObjectStore("patients", { keyPath: "registrationNumber" });
    console.log("Database and object store created successfully!");
  };

  dbPromise.onsuccess = (event) => {
    const db = event.target.result;
    console.log("Database opened successfully!");
    fetchPatientsFromIndexedDB(db); // Populate summary on load
  };

  dbPromise.onerror = (event) => {
    console.error("Error opening database:", event.target.error);
  };

  // Restrict future dates
  const today = new Date().toISOString().split("T")[0];
  dateOfRegistration.setAttribute("max", today);
  dobInput.setAttribute("max", today);

  // Update Patient Summary
  function updateSummary(patients) {
    const totalRegistered = patients.length;
    const totalMale = patients.filter((p) => p.sex === "male").length;
    const totalFemale = patients.filter((p) => p.sex === "female").length;
    const totalInsured = patients.filter((p) => p.insuranceStatus === "insured").length;
    const totalNonInsured = patients.filter((p) => p.insuranceStatus === "non-insured").length;

    totalRegisteredEl.textContent = totalRegistered;
    totalMaleEl.textContent = totalMale;
    totalFemaleEl.textContent = totalFemale;
    totalInsuredEl.textContent = totalInsured;
    totalNonInsuredEl.textContent = totalNonInsured;
  }

  // Fetch Patients from IndexedDB
  function fetchPatientsFromIndexedDB(db) {
    const transaction = db.transaction(["patients"], "readonly");
    const objectStore = transaction.objectStore("patients");
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
      const patients = event.target.result;
      updateSummary(patients);
    };

    request.onerror = (event) => {
      console.error("Error fetching patients:", event.target.error);
    };
  }

  // Save Patient Data to IndexedDB
  function savePatientData(db, patient) {
    const transaction = db.transaction(["patients"], "readwrite");
    const objectStore = transaction.objectStore("patients");
    const request = objectStore.add(patient);

    request.onsuccess = () => {
      console.log("Patient data saved to IndexedDB");
      fetchPatientsFromIndexedDB(db); // Update the summary after saving
    };

    request.onerror = (event) => {
      console.error("Error saving patient data:", event.target.error);
    };
  }

  // Generate Registration Number
  function updateRegistrationNumber() {
=======
  // IndexedDB Initialization
  dbPromise.onsuccess = (event) => {
    console.log("IndexedDB opened successfully");
  };

  dbPromise.onerror = (event) => {
    console.error("IndexedDB error:", event.target.error);
  };

  dbPromise.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('patients')) {
      const objectStore = db.createObjectStore('patients', { keyPath: 'registrationNumber' });
      objectStore.createIndex('registrationNumber', 'registrationNumber', { unique: true });
    }
    console.log("Database initialized");
  };

  // Update Registration Number
  const updateRegistrationNumber = () => {
>>>>>>> 16b3584b302187424bde3bcc924da682780b0220
    const serialNumber = prompt("Enter Serial Number (max 6 digits):");
    if (!serialNumber || !/^\d{1,6}$/.test(serialNumber)) {
      alert("Invalid Serial Number. Enter up to 6 digits.");
      return;
    }
    const yearPart = new Date(dateOfRegistration.value).getFullYear().toString().slice(-2);
    registrationNumber.value = `${serialNumber}-${yearPart}`;
  }

  dateOfRegistration.addEventListener("change", updateRegistrationNumber);

  // Auto-calculate Age
  dobInput.addEventListener("change", () => {
    if (dobInput.value) {
      const dob = new Date(dobInput.value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      ageInput.value = age;
    } else {
      ageInput.value = "";
    }
  });

<<<<<<< HEAD
  // Show/Hide Insurance Fields
  function toggleInsuranceFields() {
    if (insuranceStatus.value === "insured") {
      insuranceFields.classList.remove("hidden");
      document.getElementById("insurance-name").required = true;
      document.getElementById("sub-district").required = true;
      document.getElementById("insurance-no").required = true;
      document.getElementById("insurance-id").required = true;
    } else {
      insuranceFields.classList.add("hidden");
      document.getElementById("insurance-name").required = false;
      document.getElementById("sub-district").required = false;
      document.getElementById("insurance-no").required = false;
      document.getElementById("insurance-id").required = false;
    }
  }

  toggleInsuranceFields(); // Set visibility on page load
  insuranceStatus.addEventListener("change", toggleInsuranceFields);
=======
  // Toggle Insurance Fields
  const toggleInsuranceFields = () => {
    const isInsured = insuranceStatus.value === "insured";
    insuranceFields.classList.toggle("hidden", !isInsured);
    Array.from(insuranceFields.querySelectorAll("input")).forEach((input) => {
      input.required = isInsured;
    });
  };

  insuranceStatus.addEventListener("change", toggleInsuranceFields);
  toggleInsuranceFields();
>>>>>>> 16b3584b302187424bde3bcc924da682780b0220

  // Save Patient Data
  const savePatientData = (db, patient) => {
    const transaction = db.transaction(['patients'], 'readwrite');
    const objectStore = transaction.objectStore('patients');

    const request = objectStore.add(patient);
    request.onsuccess = () => {
      alert("Patient data saved successfully!");
      resetForm();
    };
    request.onerror = (event) => {
      alert("Error saving patient data: " + event.target.error);
    };
  };

  // Submit Form Data
  patientForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const db = dbPromise.result;
    const patient = {
      registrationNumber: registrationNumber.value,
      dateOfRegistration: dateOfRegistration.value,
      surname: document.getElementById("surname").value,
      otherNames: document.getElementById("other-names").value,
      sex: document.getElementById("sex").value,
      dateOfBirth: dobInput.value,
      age: ageInput.value,
      contactNumber: document.getElementById("contact-number").value,
      address: document.getElementById("address").value,
      relativeContact: document.getElementById("relative-contact").value,
      relativeAddress: document.getElementById("relative-address").value,
      insuranceStatus: insuranceStatus.value,
<<<<<<< HEAD
      insuranceName: document.getElementById("insurance-name").value || "",
      subDistrict: document.getElementById("sub-district").value || "",
      insuranceNo: document.getElementById("insurance-no").value || "",
      insuranceId: document.getElementById("insurance-id").value || "",
    };

    dbPromise.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["patients"], "readonly");
      const objectStore = transaction.objectStore("patients");
      const request = objectStore.get(patient.registrationNumber);

      request.onsuccess = () => {
        if (request.result) {
          alert("Duplicate Registration Number! Please use a unique serial number.");
        } else {
          savePatientData(db, patient);
          alert("Patient saved successfully!");
          patientForm.reset();
          toggleInsuranceFields(); // Reset insurance block visibility
          registrationNumber.value = "";
        }
      };
=======
      insuranceDetails: insuranceStatus.value === "insured" ? {
        insuranceName: document.getElementById("insurance-name").value,
        subDistrict: document.getElementById("sub-district").value,
        insuranceNo: document.getElementById("insurance-no").value,
        insuranceId: document.getElementById("insurance-id").value,
      } : null,
    };

    if (!registrationNumber.value) {
      alert("Please generate a valid registration number.");
      return;
    }

    // Check for duplicate records
    const transaction = db.transaction(['patients'], 'readonly');
    const store = transaction.objectStore('patients');
    const request = store.get(patient.registrationNumber);

    request.onsuccess = () => {
      if (request.result) {
        alert("Duplicate Registration Number. Please use a unique serial number.");
      } else {
        savePatientData(db, patient);
      }
>>>>>>> 16b3584b302187424bde3bcc924da682780b0220
    };
  });

  // Export Patients to CSV
  exportCsvButton.addEventListener("click", () => {
    const db = dbPromise.result;
    const transaction = db.transaction(['patients'], 'readonly');
    const store = transaction.objectStore('patients');

<<<<<<< HEAD
    dbPromise.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["patients"], "readonly");
      const objectStore = transaction.objectStore("patients");
      const request = objectStore.getAll();
=======
    store.getAll().onsuccess = (event) => {
      const patients = event.target.result;
>>>>>>> 16b3584b302187424bde3bcc924da682780b0220

      if (!patients.length) {
        alert("No patient data available for export.");
        return;
      }

      const csvHeaders = Object.keys(patients[0]);
      const csvRows = patients.map((p) =>
        csvHeaders.map((key) => JSON.stringify(p[key] || "")).join(",")
      );
      const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

<<<<<<< HEAD
        const datetime = new Date().toISOString().replace(/T/, "_").replace(/:/g, "-").split(".")[0];
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${facilityName}_patients_${datetime}.csv`;
        a.click();
      };
    };
  });

  // Register Service Worker
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("Service Worker Registered"))
      .catch((error) => console.error("Service Worker Registration Failed:", error));
  }

  // Update Footer Year
=======
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `patients_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    };
  });

  // Reset Form
  const resetForm = () => {
    patientForm.reset();
    toggleInsuranceFields();
    registrationNumber.value = "";
  };

  // Footer Year Update
>>>>>>> 16b3584b302187424bde3bcc924da682780b0220
  document.getElementById("current-year").textContent = new Date().getFullYear();
});
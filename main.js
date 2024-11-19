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

  // Open or Create IndexedDB
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

  // Update Registration Number
  const updateRegistrationNumber = () => {
    const serialNumber = prompt("Enter Serial Number (max 6 digits):");
    if (!serialNumber || !/^\d{1,6}$/.test(serialNumber)) {
      alert("Invalid Serial Number. Enter up to 6 digits.");
      return;
    }
    const yearPart = new Date(dateOfRegistration.value).getFullYear().toString().slice(-2);
    registrationNumber.value = `${serialNumber}-${yearPart}`;
  };

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
      maritalStatus: document.getElementById("marital-status").value,
      occupation: document.getElementById("occupation").value,
      religion: document.getElementById("religion").value,
      telephone: document.getElementById("telephone").value,
      relativeAddress: document.getElementById("relative-address").value,
      insuranceStatus: insuranceStatus.value,
    };

    if (insuranceStatus.value === "insured") {
      patient.insuranceDetails = {
        insuranceName: document.getElementById("insurance-name").value,
        subDistrict: document.getElementById("sub-district").value,
        insuranceNo: document.getElementById("insurance-no").value,
        insuranceId: document.getElementById("insurance-id").value,
      };
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
    };
  });

  // Export to CSV
  exportCsvButton.addEventListener("click", () => {
    const db = dbPromise.result;
    const transaction = db.transaction(['patients'], 'readonly');
    const store = transaction.objectStore('patients');

    store.getAll().onsuccess = (event) => {
      const patients = event.target.result;

      if (!patients.length) {
        alert("No patient data available for export.");
        return;
      }

      const csvHeaders = Object.keys(patients[0]);
      const csvRows = patients.map((p) => csvHeaders.map((key) => JSON.stringify(p[key] || "")).join(","));
      const csvContent = [csvHeaders.join(","), ...csvRows].join("\n");

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
  document.getElementById("current-year").textContent = new Date().getFullYear();
});
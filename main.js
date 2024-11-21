document.addEventListener("DOMContentLoaded", () => {
  const dateOfRegistration = document.getElementById("date-of-registration");
  const registrationNumber = document.getElementById("registration-number");
  const insuranceStatus = document.getElementById("insurance-status");
  const insuranceFields = document.getElementById("insurance-fields");
  const dobInput = document.getElementById("dob");
  const ageInput = document.getElementById("age");
  const patientForm = document.getElementById("patient-form");
  const exportCsvButton = document.getElementById("export-csv");

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
    const serialNumber = prompt("Enter Serial Number (max 6 digits):");
    if (!serialNumber || !/^\d{1,6}$/.test(serialNumber)) {
      alert("Invalid Serial Number. Please enter up to 6 digits.");
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

  // Save Patient Data
  patientForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!registrationNumber.value) {
      alert("Please generate a valid registration number before saving.");
      return;
    }

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
      const transaction = db.transaction(["patients"], "readonly");
      const objectStore = transaction.objectStore("patients");
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
  document.getElementById("current-year").textContent = new Date().getFullYear();
});

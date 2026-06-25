document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("quoteForm");
  const submitButton = document.getElementById("submit_button");
  const recaptchaSiteKey = "6Lc0jmYrAAAAAPKcdsVWXM_Xa6DbZaKBLvoU7zZN";

  // Load reCAPTCHA script dynamically
  const script = document.createElement("script");
  script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  // jQuery validation
  $(form).validate({
    rules: {
      first_name: {
        required: true,
        minlength: 2,
      },
      last_name: {
        required: true,
        minlength: 2,
      },
      email: {
        required: true,
        email: true,
      },
      mobile: {
        required: true,
        digits: true,
        minlength: 10,
        maxlength: 15,
      },
    },
    messages: {
      first_name: {
        required: "Please enter your first name",
        minlength: "First name must be at least 2 characters",
      },
      last_name: {
        required: "Please enter your last name",
        minlength: "Last name must be at least 2 characters",
      },
      email: {
        required: "Please enter your email address",
        email: "Please enter a valid email address",
      },
      mobile: {
        required: "Please enter your mobile number",
        digits: "Please enter only numbers",
        minlength: "Mobile number must be at least 10 digits",
        maxlength: "Mobile number cannot exceed 15 digits",
      },
    },
    errorElement: "span",
    errorClass: "text-danger small",
    errorPlacement: function (error, element) {
      error.addClass("d-block mt-1");
      error.insertAfter(element);
    },
    highlight: function (element) {
      $(element).addClass("is-invalid");
    },
    unhighlight: function (element) {
      $(element).removeClass("is-invalid");
    },
    submitHandler: function (form) {
      submitFormWithRecaptcha(form);
    },
  });

  async function submitFormWithRecaptcha(form) {
    try {
      // Disable submit button
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...';
      submitButton.style.cursor = "not-allowed";

      // Verify reCAPTCHA is loaded
      if (typeof grecaptcha === "undefined") {
        throw new Error("reCAPTCHA is not loaded. Please refresh the page.");
      }

      // Get reCAPTCHA token
      const token = await grecaptcha.execute(recaptchaSiteKey, {
        action: "submit",
      });
      
      if (!token) {
        throw new Error("reCAPTCHA token is empty");
      }

      // Create FormData object
      const formData = new FormData(form);
      formData.append("g-recaptcha-response", token);

      // Submit form data
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        showToast(
          result.message ||
            "Your quote request has been submitted successfully!",
          "success"
        );
        form.reset();
        // Remove validation classes
        $(form).find(".is-invalid").removeClass("is-invalid");
        $(form).find(".text-danger").remove();
      } else {
        throw new Error(
          result.message || "An error occurred while submitting the form"
        );
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showToast(
        error.message || "An error occurred. Please try again.",
        "error"
      );
    } finally {
      // Reset submit button
      submitButton.disabled = false;
      submitButton.innerHTML = "Submit Quote Request";
      submitButton.style.cursor = "pointer";
    }
  }

  function showToast(message, type = "info") {
    const background = {
      success: "linear-gradient(to right, #00b09b, #96c93d)",
      error: "linear-gradient(to right, #ff5f6d, #ffc371)",
      info: "linear-gradient(to right, #667eea, #764ba2)",
    }[type];

    Toastify({
      text: message,
      duration: 5000,
      close: true,
      gravity: "top",
      position: "right",
      stopOnFocus: true,
      style: {
        background: background,
        borderRadius: "4px",
        fontFamily: "'Open Sans', sans-serif",
        boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
      },
    }).showToast();
  }
});
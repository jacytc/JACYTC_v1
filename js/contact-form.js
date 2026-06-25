document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contactpage");
  const submitButton = document.getElementById("submit_button");
  const recaptchaSiteKey = "6LfvInMrAAAAAN-aFJCmtg50YM8q2hvrObwYJKMy";

  // Load reCAPTCHA v3 script dynamically
  const script = document.createElement("script");
  script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);

  // Load Toastify CSS dynamically
  const toastifyCSS = document.createElement("link");
  toastifyCSS.rel = "stylesheet";
  toastifyCSS.href =
    "https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css";
  document.head.appendChild(toastifyCSS);

  // Load Toastify JS dynamically
  const toastifyJS = document.createElement("script");
  toastifyJS.src = "https://cdn.jsdelivr.net/npm/toastify-js";
  toastifyJS.async = true;
  toastifyJS.defer = true;
  document.head.appendChild(toastifyJS);

  // Initialize jQuery validation
  $(form).validate({
    rules: {
      fname: {
        required: true,
        minlength: 2,
        maxlength: 50,
      },
      email: {
        required: true,
        email: true,
        maxlength: 100,
      },
      subject: {
        required: true,
        minlength: 2,
        maxlength: 100,
      },
      message: {
        required: true,
        minlength: 10,
        maxlength: 1000,
      },
    },
    messages: {
      fname: {
        required: "Please enter your name",
        minlength: "Name must be at least 2 characters",
        maxlength: "Name cannot exceed 50 characters",
      },
      email: {
        required: "Please enter your email address",
        email: "Please enter a valid email address",
        maxlength: "Email cannot exceed 100 characters",
      },
      subject: {
        required: "Please enter a subject",
        minlength: "Subject must be at least 2 characters",
        maxlength: "Subject cannot exceed 100 characters",
      },
      message: {
        required: "Please enter your message",
        minlength: "Message must be at least 10 characters",
        maxlength: "Message cannot exceed 1000 characters",
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
      // Disable submit button and show spinner
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
      submitButton.style.cursor = "not-allowed";

      // Ensure reCAPTCHA is loaded
      if (typeof grecaptcha === "undefined") {
        throw new Error("reCAPTCHA is not loaded. Please refresh the page.");
      }

      const token = await grecaptcha.execute(recaptchaSiteKey, {
        action: "contact_submit",
      });

      if (!token) throw new Error("reCAPTCHA token is empty");

      // Prepare and submit the form data
      const formData = new FormData(form);
      formData.append("g-recaptcha-response", token);

      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const contentType = response.headers.get("content-type");
      let result;

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const textResponse = await response.text();
        console.error("Non-JSON response:", textResponse);
        throw new Error("Server returned an invalid response format");
      }

      if (result.status === "success") {
        showToast(
          result.message || "Your message has been sent successfully!",
          "success"
        );
        form.reset();
        $(form).find(".is-invalid").removeClass("is-invalid");
        $(form).find(".text-danger").remove();
      } else {
        throw new Error(
          result.message || "An error occurred while sending your message"
        );
      }
    } catch (error) {
      console.error("Form submission error:", error);
      showToast(
        error.message || "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      // Reset submit button
      submitButton.disabled = false;
      submitButton.innerHTML = "Send Message";
      submitButton.style.cursor = "pointer";
    }
  }

  function showToast(message, type = "info") {
    const checkToastify = setInterval(() => {
      if (typeof Toastify !== "undefined") {
        clearInterval(checkToastify);
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
    }, 100);

    // Fallback to alert
    setTimeout(() => {
      if (typeof Toastify === "undefined") {
        clearInterval(checkToastify);
        alert(message);
      }
    }, 3000);
  }

  // Character counter for message textarea
  const messageField = document.getElementById("message");
  if (messageField) {
    const charCounter = document.createElement("small");
    charCounter.className = "text-muted float-end mt-1";
    charCounter.textContent = "0/1000 characters";
    messageField.parentNode.insertBefore(charCounter, messageField.nextSibling);

    messageField.addEventListener("input", function () {
      const length = this.value.length;
      charCounter.textContent = `${length}/1000 characters`;

      if (length > 950) {
        charCounter.className = "text-danger float-end mt-1";
      } else if (length > 900) {
        charCounter.className = "text-warning float-end mt-1";
      } else {
        charCounter.className = "text-muted float-end mt-1";
      }
    });
  }
});

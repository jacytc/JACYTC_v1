document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("quoteForm");
  const submitButton = document.getElementById("submit_button");
  const recaptchaSiteKey = "6LdagRsrAAAAAEa7k6jPFK_YlIrm2mMztWT6FHll";

  // jQuery validation
  $(form).validate({
    rules: {
      fname: {
        required: true,
      },
      lname: {
        required: true,
      },
      email: {
        required: true,
        email: true,
      },
      subject: {
        required: true,
      },
      phone: {
        required: true,
        number: true,
      },
    },
    messages: {
      subject: "Please select a package.",
    },
    errorElement: "span",
    errorPlacement: function (error, element) {
      error.appendTo(element.parent());
    },
    submitHandler: function () {
      // Disable the submit button immediately
      submitButton.disabled = true;
      submitButton.classList.add("loading");
      submitButton.style.cursor = "not-allowed";
      if (typeof grecaptcha !== "undefined" && grecaptcha) {
        grecaptcha.ready(function () {
          grecaptcha
            .execute(recaptchaSiteKey, { action: "submit" })
            .then(function (token) {
              if (!token) {
                console.error("reCAPTCHA token is empty!");
                Toastify({
                  text: "reCAPTCHA verification failed. Please try again.",
                  duration: 3000,
                  close: true,
                  gravity: "top",
                  position: "right",
                  stopOnFocus: true,
                  style: {
                    background: "linear-gradient(to right, #dc3545, #f44336)",
                    borderRadius: "10px",
                  },
                }).showToast();

                submitButton.disabled = false;
                submitButton.classList.remove("loading");
                submitButton.style.cursor = "pointer";

                return;
              }

              const formData = new FormData(form);
              formData.append("g-recaptcha-response", token);

              fetch(form.action, {
                method: "POST",
                body: formData,
              })
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  return response.text();
                })
                .then((data) => {
                  Toastify({
                    text: data,
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    stopOnFocus: true,
                    style: {
                      background:
                        "linear-gradient(to right, #009597 , #009597)",
                      borderRadius: "10px",
                    },
                  }).showToast();
                  form.reset();
                })
                .catch((error) => {
                  console.error("Error submitting form:", error);
                  Toastify({
                    text: "An error occurred while submitting the form.",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    stopOnFocus: true,
                    style: {
                      background: "linear-gradient(to right, #dc3545, #f44336)",
                      borderRadius: "10px",
                    },
                  }).showToast();
                })
                .finally(() => {
                  submitButton.disabled = false;
                  submitButton.classList.remove("loading");
                  submitButton.style.cursor = "pointer";
                });
            });
        });
      } else {
        console.error("reCAPTCHA is not loaded correctly.");
        Toastify({
          text: "reCAPTCHA is not loaded correctly. Please try again later.",
          duration: 3000,
          close: true,
          gravity: "top",
          position: "right",
          stopOnFocus: true,
          style: {
            background: "linear-gradient(to right, #dc3545, #f44336)",
            borderRadius: "10px",
          },
        }).showToast();

        // Re-enable the submit button if reCAPTCHA is not loaded
        submitButton.disabled = false;
        submitButton.classList.remove("loading");
        submitButton.style.cursor = "pointer";
      }
    },
  });
});

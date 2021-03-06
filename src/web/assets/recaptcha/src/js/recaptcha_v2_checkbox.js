/**
 * Prepare reCAPTCHA for ALL Sprout Forms on page
 */
class SproutFormsGoogleRecaptchaCheckbox {

  constructor(settings) {
    this.siteKey = settings.siteKey;
    this.theme = settings.theme ?? null;
    this.size = settings.size ?? null;
    this.customValidityText = settings.customValidityText;
    this.grecaptcha = settings.grecaptcha;

    this.initRecaptchas();
    this.makeRecaptchasRequired();
  }

  initRecaptchas() {
    let self = this;
    let sproutFormsRecaptchaContainers = document.querySelectorAll('.google-recaptcha-container');

    for (let recaptchaContainer of sproutFormsRecaptchaContainers) {
      let formId = recaptchaContainer.getAttribute('data-google-recaptcha-form-id');
      let form = document.getElementById(formId);
      this.addFormEventListener(form);

      let widgetId = this.grecaptcha.render(recaptchaContainer.id, {
        'sitekey': self.siteKey,
        'theme': self.theme,
        'size': self.size,
        'callback': function(token) {
          self.onSproutFormsRecaptchaSuccess(token, form)
        },
        'expired-callback': function() {
          self.onSproutFormsRecaptchaExpired(form)
        }
      });

      form.setAttribute('data-google-recaptcha-widget-id', widgetId);
    }
  }

  /**
   * Adds Event Listener to Form submit button to ensure reCAPTCHA gets processed
   *
   * @param form
   */
  addFormEventListener(form) {
    let self = this;

    form.addEventListener('submit', function(event) {
      let targetForm = event.target;
      let widgetId = targetForm.getAttribute('data-google-recaptcha-widget-id');

      // Make sure to run reCAPTCHA before submitting form
      if (!self.grecaptcha.getResponse(widgetId)) {
        event.preventDefault();
        self.grecaptcha.execute(widgetId);
      }
    }, false);
  }

  /**
   * Make reCAPTCHA not required any longer if successful callback
   *
   * @param token
   * @param form
   */
  onSproutFormsRecaptchaSuccess(token, form) {
    let recaptchaResponseTextarea = form.querySelector('.g-recaptcha-response');
    recaptchaResponseTextarea.required = false;
    recaptchaResponseTextarea.setCustomValidity('');
  }

  /**
   * Make reCAPTCHA required again after expiration resets things
   *
   * @param form
   */
  onSproutFormsRecaptchaExpired(form) {
    let self = this;
    // Google swaps in new recaptcha textarea after this triggers
    // Add delay to target the new textarea over the old
    setTimeout(function() {
      let recaptchaResponseTextarea = form.querySelector('.g-recaptcha-response');
      self.makeRecaptchaRequired(recaptchaResponseTextarea);
    }, 500);
  }

  /**
   * Make all reCAPTCHAs required after initial page load
   */
  makeRecaptchasRequired() {
    let self = this;
    window.onload = function() {
      let recaptchaResponseTextareas = document.querySelectorAll('.g-recaptcha-response');
      for (const recaptchaResponseTextarea of recaptchaResponseTextareas) {
        self.makeRecaptchaRequired(recaptchaResponseTextarea);
      }
    }
  }

  /**
   * Make a single reCAPTCHA textarea required
   *
   * @param recaptchaResponseTextarea
   */
  makeRecaptchaRequired(recaptchaResponseTextarea) {
    if (recaptchaResponseTextarea) {
      recaptchaResponseTextarea.required = true;
      recaptchaResponseTextarea.setCustomValidity(this.customValidityText);
    }
  }
}

window.SproutFormsGoogleRecaptchaCheckbox = SproutFormsGoogleRecaptchaCheckbox;
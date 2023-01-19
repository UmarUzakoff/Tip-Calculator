const tipCalcForm = document.forms['calculator'];
const billAmount = tipCalcForm.elements.bill;
const radioBtnTips = tipCalcForm.elements.tip;
const customTip = tipCalcForm.elements.customTip;
const numberOfPeople = tipCalcForm.elements.people;
const tipAmount = tipCalcForm.elements.tipAmount;
const totalAmount = tipCalcForm.elements.total;
const resetBtn = tipCalcForm.elements.resetButton;
let billTotal = 0;
let tipPercentage = 0;
let peopleTotal = 0;

function activateResetBtn() {
  resetBtn.removeAttribute('disabled');
}

function showCustomTipInput() {
  customTip.classList.remove('not-visible');
  customTip.classList.add('visible');
  customTip.focus();
}

function resetCustomTipInput() {
  customTip.classList.remove('visible');
  customTip.classList.add('not-visible');
  customTip.value = '';
}

function numberToCurrency(amount) {
  const valueAsDollars = {style: 'currency', currency: 'USD', maximumFractionDigits: 2}
  const numberFormat = new Intl.NumberFormat('en-US', valueAsDollars);
  return numberFormat.format(amount);
}

function validateInputs() {
  const inputFields = [billAmount, numberOfPeople, customTip];

  inputFields.forEach(input => {
    input.addEventListener('invalid', () => {
      const message = getErrorMessage(input);
      showInputError(input);
    });

    input.addEventListener('blur', () => {
      input.checkValidity();
    });

    input.addEventListener('input', () => {
      const valid = input.checkValidity();

      if (valid) {
        removeInputError(input);
      }
    });
  });
}

function calculateTotals(bill, tip, people) {
  const initialAmount = Math.round(bill * 100);
  const totalTip = Math.round(initialAmount * tip);
  const totalSplitTip = Math.floor(totalTip / people) / 100;
  const totalBill = initialAmount + totalTip;
  const totalSplitBill = Math.round(totalBill / people) / 100;

  tipAmount.value = numberToCurrency(totalSplitTip);
  totalAmount.value = numberToCurrency(totalSplitBill);
}

resetBtn.addEventListener('click', () => {
  tipCalcForm.reset();
  resetCustomTipInput();
  clearErrorsOnReset();
  billTotal = 0;
  tipPercentage = 0;
  peopleTotal = 0;
  resetBtn.setAttribute('disabled', '');
});

[billAmount, numberOfPeople].forEach(inputField => {
  inputField.addEventListener('click', activateResetBtn);
  inputField.addEventListener('keyup', activateResetBtn);
}); 

radioBtnTips.forEach(radioBtn => {
  radioBtn.addEventListener('change', () => {
    const radioBtnTipInput = radioBtn.value;

    activateResetBtn();
    if ( radioBtnTipInput === '' ) { 
      showCustomTipInput();
      tipPercentage = 0;
    } else {
      resetCustomTipInput();
      tipPercentage = Number(radioBtnTipInput) / 100;
    }
  });
});

customTip.addEventListener('change', () => {
  const customTipInput = Number(customTip.value) / 100;
  tipPercentage = customTipInput;
});

tipCalcForm.querySelectorAll('input').forEach(input => {
  input.addEventListener('change', () => {
    const billAmountInput = Number(billAmount.value);
    const numberOfPeopleInput = Number(numberOfPeople.value);
    const currentTipInput = tipPercentage;

    billTotal = billAmountInput;
    peopleTotal = numberOfPeopleInput;

    if ( billTotal >= 1 && peopleTotal >= 2 ) {
      calculateTotals(billTotal, currentTipInput, peopleTotal);
    }
  });
});

validateInputs();

const errorMessages = {
    badInputError: `Enter a number`,
    decimalError: `Two decimal spaces only`,
    maxValueError: `Max value = `,
    minValueError: `Min value = `,
    zeroValueError: `Can't be zero`,
  }
  
  function getErrorMessage(input) {
    const validity = input.validity;
  
    if ( validity.badInput || validity.valueMissing ) {
      return `${errorMessages.badInputError}`;
    }
    if ( Number(input.value) === 0 ) {
      return `${errorMessages.zeroValueError}`;
    }
    if ( validity.rangeUnderflow ) {
      return `${errorMessages.minValueError}${input.getAttribute('min')}`;
    }
    if ( validity.rangeOverflow ) {
       return `${errorMessages.maxValueError}${input.getAttribute('max')}`;
    }
    if ( validity.stepMismatch && input.id === 'bill') {
      return `${errorMessages.decimalError}`;
    } 
  }
  
  function clearErrorsOnReset() {
    const activeErrorMessages = document.querySelectorAll('.active');
    const invalidInputs = document.querySelectorAll('.invalid');
  
    activeErrorMessages.forEach((error) => {
      error.classList.remove('active', 'visible');
      error.classList.add('not-visible');
      error.textContent = '';
    });
    invalidInputs.forEach((input) => {
      input.classList.remove('invalid');
      input.setAttribute('aria-invalid', false);
      input.removeAttribute('aria-live', 'polite');
    });
  }
  
  function showInputError(input) {
    const error = document.getElementById(input.id);
    const errorMessageSpan = document.getElementById(`${input.id}-input-error`);
  
    if ( error.validity.valid === false ) {
      const message = getErrorMessage(input);
      error.classList.add('invalid');
      error.setAttribute('aria-invalid', true);
      error.setAttribute('aria-live', 'polite');
      errorMessageSpan.classList.add('active', 'visible');
      errorMessageSpan.classList.remove('not-visible');
      errorMessageSpan.textContent = message || input.validationMessage;
    }  
  }
  
  function removeInputError(input) {
    const error = document.getElementById(input.id);
    const errorMessageSpan = document.getElementById(`${input.id}-input-error`);
  
    if ( error.validity.valid && error.classList.contains('invalid') ) {
      error.classList.remove('invalid');
      error.setAttribute('aria-invalid', false);
      error.removeAttribute('aria-live', 'polite');
      errorMessageSpan.classList.remove('active', 'visible');
      errorMessageSpan.classList.add('not-visible');
      errorMessageSpan.textContent = '';
    }
  }
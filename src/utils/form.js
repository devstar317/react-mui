import { useState, useEffect, useCallback } from 'react';
import validate from 'validate.js';

/**
 * Basic "schema" object to use as formState state
 * Usage: const [formState, setFormState] = useState(DEFAULT_FORM_STATE);
 */
export const DEFAULT_FORM_STATE = {
  isValid: false, // True when all Input Values are entered correctly
  values: {}, // List of Input Values as string|boolean
  touched: {}, // List of Inputs have been touched as boolean
  errors: {}, // List of Errors for every field as array[] of strings
};

/**
 * Reusable event to cancel the default behaviour
 */
export const eventPreventDefault = (event) => {
  event.preventDefault();
};

/**
 * Verifies does the From field with given Name has the Error
 */
export const formHasError = (formState, fieldName) => {
  return Boolean(formState?.touched?.[fieldName] && formState?.errors?.[fieldName]);
};

/**
 * Returns text of "top most" Error for the Form field by given Name.
 * Returns null if there is no Error.
 */
export const formGetError = (formState, fieldName) => {
  return formHasError(formState, fieldName) ? formState?.errors?.[fieldName]?.[0] : null;
};

/**
 * Application "standard" From as Hook
 * Note: the "name" prop of all Form controls must be set! We use event.target?.name for binding data.
 * Usage: const [formState, setFormState, onFieldChange, fieldGetError, fieldHasError] = useAppForm({
    validationSchema: XXX_FORM_SCHEMA,
    initialValues: {name: 'John Doe'},
  });
 * @param {object} options.validationSchema - validation schema in 'validate.js' format
 * @param {object} [options.initialValues] - optional initialization data for formState.values
 */
export function useAppForm({ validationSchema, initialValues = {} }) {
  // Validate params
  if (!validationSchema) {
    throw new Error('useAppForm() - the option `validationSchema` is required');
  }
  if (typeof validationSchema !== 'object') {
    throw new Error('useAppForm() - the option `validationSchema` should be an object');
  }
  if (typeof initialValues !== 'object') {
    throw new Error('useAppForm() - the option `initialValues` should be an object');
  }

  // Create Form state and apply initialValues if set
  const [formState, setFormState] = useState({ ...DEFAULT_FORM_STATE, values: initialValues });

  // Validation by 'validate.js' on every formState.values change
  useEffect(() => {
    const errors = validate(formState.values, validationSchema);
    setFormState((formState) => ({
      ...formState,
      isValid: errors ? false : true,
      errors: errors || {},
    }));
  }, [validationSchema, formState.values]);

  // Event to call on every Input change. Note: the "name" props of the Input control must be set!
  const onFieldChange = useCallback((event) => {
    event.persist(); // Todo: Do we need this in React 17 ?

    const name = event.target?.name;
    const value =
      event.target?.type === 'checkbox'
        ? event.target?.checked // Checkbox Input
        : event.target?.value; // Any other Input

    setFormState((formState) => ({
      ...formState,
      values: {
        ...formState.values,
        [name]: value,
      },
      touched: {
        ...formState.touched,
        [name]: true,
      },
    }));
  }, []);

  // Returns text of "top most" Error for the Field by given Name or null
  const fieldGetError = (fieldName) => formGetError(formState, fieldName);

  // Verifies does the Field with given Name has the Error
  const fieldHasError = (fieldName) => formHasError(formState, fieldName);

  // Return state and methods
  return [formState, setFormState, onFieldChange, fieldGetError, fieldHasError];
}

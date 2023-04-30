import { ENV, ENVIRONMENT } from "configs/index";

/**
 * @author Tran Ba Phuc
 * @param errorData
 * @returns
 */
const getErrorMessage = (errorData) => {
  let message = errorData.message;
  if (errorData.fieldErrors) {
    errorData.fieldErrors.forEach((fErr) => {
      message += `\nfield: ${fErr.field},  Object: ${fErr.objectName}, message: ${fErr.message}\n`;
    });
  }
  return message;
};
// @ts-ignore
export default () => (next) => (action) => {
  /**
   *
   * The error middleware serves to log error messages from dispatch
   * It need not run in production
   */
  // console.info("===>" + JSON.stringify(action, null, 6) );
  if (ENVIRONMENT === ENV.DEVELOPMENT) {
    try {
    } catch (e) {}
    const { error } = action;
    if (error) {
      console.log(`${action.type} caught at middleware with reason: ${JSON.stringify(error.message)}.`);
      try {
        action.error.message = JSON.parse(error.message)[0].message;
      } catch (e) {
        action.error.message = error.message;
      }

      action.error.message = action.error.message;

      if (error && typeof error.response !== "undefined")
        if (typeof error.response.data !== "undefined") {
          const message = getErrorMessage(error.response.data);
          action.error.message = message || "";
        }
    }
  }
  // Dispatch initial action
  return next(action);
};

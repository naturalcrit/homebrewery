import error00 from './00-an-unknown-error-occurred';
import error01 from './01-an-error-occurred-while-retrieving-this-brew-from-google-drive';
import error02 from './02-we-cant-find-this-brew-in-google-drive';
import error03 from './03-current-signed-in-user-does-not-have-editor-access-to-this-brew';
import error04 from './04-sign-in-required-to-edit-this-brew';
import error05 from './05-no-homebrewery-document-could-be-found';
import error06 from './06-unable-to-save-homebrewery-document';
import error07 from './07-unable-to-delete-homebrewery-document';
import error08 from './08-unable-to-remove-user-from-homebrewery-document';
import error09 from './09-no-homebrewery-theme-document-could-be-found';
import error10 from './10-the-selected-theme-is-not-tagged-as-a-theme';
import error11 from './11-no-homebrewery-document-could-be-found';
import error12 from './12-no-google-document-could-be-found';
import error50 from './50-you-are-not-signed-in';
import error51 from './51-this-brew-has-been-locked';
import error52 from './52-access-denied';
import error60 from './60-lock-error-general';
import error61 from './61-lock-get-error-unable-to-get-lock-count';
import error62 from './62-lock-set-error-cannot-lock';
import error63 from './63-lock-set-error-brew-not-found';
import error64 from './64-lock-set-error-already-locked';
import error65 from './65-lock-remove-error-cannot-unlock';
import error66 from './66-lock-remove-error-brew-not-found';
import error67 from './67-lock-remove-error-not-locked';
import error68 from './68-lock-get-review-error-cannot-get-review-requests';
import error69 from './69-lock-set-review-error-cannot-set';
import error70 from './70-lock-set-review-error-brew-not-found';
import error71 from './71-lock-set-review-error-review-already-requested';
import error72 from './72-lock-remove-review-error-cannot-clear';
import error73 from './73-lock-remove-review-error-brew-not-found';
import error90 from './90-an-unexpected-error-occurred-while-looking-for-these-brews';
import error91 from './91-an-unexpected-error-occurred-while-getting-total-brews';

// Map error codes to their modules
const errorMap = {
    '00': error00,
    '01': error01,
    '02': error02,
    '03': error03,
    '04': error04,
    '05': error05,
    '06': error06,
    '07': error07,
    '08': error08,
    '09': error09,
    '10': error10,
    '11': error11,
    '12': error12,
    '50': error50,
    '51': error51,
    '52': error52,
    '60': error60,
    '61': error61,
    '62': error62,
    '63': error63,
    '64': error64,
    '65': error65,
    '66': error66,
    '67': error67,
    '68': error68,
    '69': error69,
    '70': error70,
    '71': error71,
    '72': error72,
    '73': error73,
    '90': error90,
    '91': error91
};

// Usage: getError('04', props)
export default function getError(code, props) {
    const fn = errorMap[code];
    return fn ? fn(props) : errorMap['00'](props); // fallback to '00' if not found
}
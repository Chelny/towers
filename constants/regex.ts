/**
 * Name Pattern
 * - Name must have letters and hyphen, space or an apostrophe
 * - Name must start with a capital letter
 * - No lowercase and uppercase-only name
 * - First letter must be uppercase
 * - The letter following a hyphen, space or an apostrophe must be uppercase
 * - Accented characters are allowed
 * - No -- or <space><space> or '' inside
 */
export const NAME_PATTERN =
  /^(?:[A-ZÀ-ÖØ-Þ][a-zà-öø-þ]*)(?:[-\s]?[A-ZÀ-ÖØ-Þ][a-zà-öø-þ]*)*(?:\.[\s]?[A-ZÀ-ÖØ-Þ][a-zà-öø-þ]*)*$/;

export const BIRTH_DATE_PATTERN = /^[1-9][0-9]{3}-(0[1-9]|1[0-2])-(0[0-9]|[1-2][0-9]|3[0-1])$/;

export const EMAIL_PATTERN =
  /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

/**
 * Username Pattern
 * - Username must be between 4 and 32 characters long
 * - Allowed characters: letters, digits, periods and underscores
 * - No _ or . at the beginning or at the end
 * - No __ or _. or ._ or ..
 */
export const USERNAME_PATTERN = /^(?=[a-zA-Z0-9._-]{4,32}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

/**
 * Password Pattern
 * - Password must be between 8 and 32 characters long
 * - Must contain at least one digit
 * - Must contain at least one uppercase letter
 * - Must contain at least one special character (excluding whitespace, tab, newline and carriage return)
 */
export const PASSWORD_PATTERN =
  /^(?=.*[0-9])(?=.*[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~])(?=.*[A-Z])[a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]{8,32}$/;

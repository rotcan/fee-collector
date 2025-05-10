
/**
 * Helper function to convert string to boolean value
 * @param value String | number | boolean | undefined value which can be converted to boolean
 * @returns boolean representation of the value passed
 */
export function convertToBoolean(value: any): boolean | undefined {
  if (!value) return undefined;
  if (typeof value === "string") {
    const lowerCaseValue = value.toLowerCase();
    return (
      lowerCaseValue === "true" ||
      lowerCaseValue === "1" ||
      lowerCaseValue === "yes" ||
      lowerCaseValue === "on"
    );
  }
  return Boolean(value);
}

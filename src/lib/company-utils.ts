/**
 * Utility functions for company and mobilized people management
 */

interface PersonWithId {
  id: string;
}

/**
 * Validates that a representative ID corresponds to an actual mobilized person
 * @param representativeId The ID to validate
 * @param mobilizedPeople Array of mobilized people to check against
 * @returns The validated representative ID or undefined if invalid
 */
export const validateRepresentativeId = (
  representativeId: string | undefined,
  mobilizedPeople: PersonWithId[],
): string | undefined => {
  if (!representativeId) return undefined;

  // Prevent orphaned representative references
  const isValid = mobilizedPeople.some(
    (person) => person.id === representativeId,
  );

  return isValid ? representativeId : undefined;
};

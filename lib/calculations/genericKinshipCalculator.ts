import { BaseAnimal, KinshipRelation, KinshipSummary } from "@/types/animal";

export interface KinshipTerminology {
  maleChild: string; // e.g. "Son"
  femaleChild: string; // e.g. "Daughter"
  neutralChild: string; // e.g. "Child", "Squab", "Kid"
  maleSibling: string; // e.g. "Brother"
  femaleSibling: string; // e.g. "Sister"
  neutralSibling: string; // e.g. "Sibling"
  twinPrefix?: string; // e.g. "Twin" or "Littermate"
  paternalGrandfather?: string; // "Paternal Grandfather" or "Paternal Grandsire"
  paternalGrandmother?: string; // "Paternal Grandmother" or "Paternal Granddam"
  maternalGrandfather?: string; // "Maternal Grandfather" or "Maternal Grandsire"
  maternalGrandmother?: string; // "Maternal Grandmother" or "Maternal Granddam"
}

export const DEFAULT_KINSHIP_TERMINOLOGY: KinshipTerminology = {
  maleChild: "Son",
  femaleChild: "Daughter",
  neutralChild: "Child",
  maleSibling: "Brother",
  femaleSibling: "Sister",
  neutralSibling: "Sibling",
  twinPrefix: "Twin",
  paternalGrandfather: "Paternal Grandfather",
  paternalGrandmother: "Paternal Grandmother",
  maternalGrandfather: "Maternal Grandfather",
  maternalGrandmother: "Maternal Grandmother",
};

function getNormalizedBirthDate(animal: BaseAnimal): string {
  return animal.birthDate || animal.hatchDate || "";
}

function getSiblingLabel(
  animal: BaseAnimal,
  baseType: string,
  terms: KinshipTerminology
): string {
  const isMale = String(animal.sex || "").toUpperCase() === "MALE";
  const isFemale = String(animal.sex || "").toUpperCase() === "FEMALE";
  const genderWord = isMale
    ? terms.maleSibling
    : isFemale
    ? terms.femaleSibling
    : terms.neutralSibling;

  if (baseType.endsWith("-")) {
    return `${baseType}${genderWord}`;
  }
  return `${baseType} ${genderWord}`.trim();
}

function getChildLabel(animal: BaseAnimal, terms: KinshipTerminology): string {
  const isMale = String(animal.sex || "").toUpperCase() === "MALE";
  const isFemale = String(animal.sex || "").toUpperCase() === "FEMALE";
  return isMale ? terms.maleChild : isFemale ? terms.femaleChild : terms.neutralChild;
}

function getGrandchildLabel(animal: BaseAnimal, terms: KinshipTerminology): string {
  const isMale = String(animal.sex || "").toUpperCase() === "MALE";
  const isFemale = String(animal.sex || "").toUpperCase() === "FEMALE";
  return isMale
    ? `Grand${terms.maleChild.toLowerCase()}`
    : isFemale
    ? `Grand${terms.femaleChild.toLowerCase()}`
    : `Grand${terms.neutralChild.toLowerCase()}`;
}

/**
 * Deterministically calculates all biological family relationships for any animal against its flock/herd.
 * Guaranteed zero circular recursion loops.
 */
export function calculateGenericKinship<T extends BaseAnimal>(
  selectedAnimal: T,
  allAnimals: T[],
  customTerms?: Partial<KinshipTerminology>
): KinshipSummary<T> {
  const terms: KinshipTerminology = {
    ...DEFAULT_KINSHIP_TERMINOLOGY,
    ...(customTerms || {}),
  };

  const animalMap = new Map<string, T>();
  for (const a of allAnimals) {
    if (a.id) animalMap.set(a.id, a);
  }

  const subjectId = selectedAnimal.id;
  const father = selectedAnimal.fatherId
    ? animalMap.get(selectedAnimal.fatherId) || null
    : null;
  const mother = selectedAnimal.motherId
    ? animalMap.get(selectedAnimal.motherId) || null
    : null;

  const subjectBirthDate = getNormalizedBirthDate(selectedAnimal);
  const subjectBatchId = (selectedAnimal.clutchId || selectedAnimal.litterId || "").trim();

  const twinSiblings: KinshipRelation<T>[] = [];
  const fullSiblings: KinshipRelation<T>[] = [];
  const maternalHalfSiblings: KinshipRelation<T>[] = [];
  const paternalHalfSiblings: KinshipRelation<T>[] = [];

  // Determine Sibling Relationships
  for (const other of allAnimals) {
    if (other.id === subjectId) continue;

    const hasSameFather =
      Boolean(selectedAnimal.fatherId) &&
      Boolean(other.fatherId) &&
      selectedAnimal.fatherId === other.fatherId;
    const hasSameMother =
      Boolean(selectedAnimal.motherId) &&
      Boolean(other.motherId) &&
      selectedAnimal.motherId === other.motherId;

    if (hasSameFather && hasSameMother) {
      // Both parents identical: Full Sibling or Twin/Littermate
      const otherBirthDate = getNormalizedBirthDate(other);
      const otherBatchId = (other.clutchId || other.litterId || "").trim();

      const isSameDate =
        Boolean(subjectBirthDate) &&
        Boolean(otherBirthDate) &&
        subjectBirthDate === otherBirthDate;
      const isSameBatch =
        Boolean(subjectBatchId) &&
        Boolean(otherBatchId) &&
        subjectBatchId.toLowerCase() === otherBatchId.toLowerCase();

      if (isSameDate || isSameBatch) {
        twinSiblings.push({
          animal: other,
          relationship: getSiblingLabel(other, terms.twinPrefix || "Twin", terms),
          relationshipCategory: "TWIN_SIBLING",
          details: isSameBatch
            ? `Same batch (${subjectBatchId})`
            : `Identical birth date (${subjectBirthDate})`,
        });
      } else {
        fullSiblings.push({
          animal: other,
          relationship: getSiblingLabel(other, "Full", terms),
          relationshipCategory: "FULL_SIBLING",
          details: "Shares both Sire and Dam",
        });
      }
    } else if (hasSameMother && !hasSameFather) {
      maternalHalfSiblings.push({
        animal: other,
        relationship: getSiblingLabel(other, "Maternal Half-", terms),
        relationshipCategory: "MATERNAL_HALF_SIBLING",
        details: "Shares same Dam (Mother)",
      });
    } else if (hasSameFather && !hasSameMother) {
      paternalHalfSiblings.push({
        animal: other,
        relationship: getSiblingLabel(other, "Paternal Half-", terms),
        relationshipCategory: "PATERNAL_HALF_SIBLING",
        details: "Shares same Sire (Father)",
      });
    }
  }

  // Children: any animal whose fatherId or motherId is subjectId
  const children: KinshipRelation<T>[] = [];
  for (const other of allAnimals) {
    if (other.fatherId === subjectId || other.motherId === subjectId) {
      const role =
        other.fatherId === subjectId
          ? "Subject is Sire (Father)"
          : "Subject is Dam (Mother)";
      children.push({
        animal: other,
        relationship: getChildLabel(other, terms),
        relationshipCategory: "CHILD",
        details: role,
      });
    }
  }

  // Grandchildren: children of subject's children
  const grandchildren: KinshipRelation<T>[] = [];
  const childIds = new Set(children.map((c) => c.animal.id));
  for (const other of allAnimals) {
    if (
      (other.fatherId && childIds.has(other.fatherId)) ||
      (other.motherId && childIds.has(other.motherId))
    ) {
      grandchildren.push({
        animal: other,
        relationship: getGrandchildLabel(other, terms),
        relationshipCategory: "GRANDCHILD",
        details: "Offspring of direct child",
      });
    }
  }

  // Grandparents: parents of father and mother
  const grandparents: KinshipRelation<T>[] = [];
  if (father) {
    if (father.fatherId && animalMap.has(father.fatherId)) {
      grandparents.push({
        animal: animalMap.get(father.fatherId)!,
        relationship: terms.paternalGrandfather || "Paternal Grandfather",
        relationshipCategory: "GRANDPARENT",
        details: "Father of Sire",
      });
    }
    if (father.motherId && animalMap.has(father.motherId)) {
      grandparents.push({
        animal: animalMap.get(father.motherId)!,
        relationship: terms.paternalGrandmother || "Paternal Grandmother",
        relationshipCategory: "GRANDPARENT",
        details: "Mother of Sire",
      });
    }
  }
  if (mother) {
    if (mother.fatherId && animalMap.has(mother.fatherId)) {
      grandparents.push({
        animal: animalMap.get(mother.fatherId)!,
        relationship: terms.maternalGrandfather || "Maternal Grandfather",
        relationshipCategory: "GRANDPARENT",
        details: "Father of Dam",
      });
    }
    if (mother.motherId && animalMap.has(mother.motherId)) {
      grandparents.push({
        animal: animalMap.get(mother.motherId)!,
        relationship: terms.maternalGrandmother || "Maternal Grandmother",
        relationshipCategory: "GRANDPARENT",
        details: "Mother of Dam",
      });
    }
  }

  // Uncles & Aunts: siblings of parents
  const unclesAndAunts: KinshipRelation<T>[] = [];
  const parentSiblingIds = new Set<string>();

  const findParentSiblings = (parent: T | null, side: "Paternal" | "Maternal") => {
    if (!parent) return;
    for (const other of allAnimals) {
      if (other.id === parent.id || other.id === subjectId) continue;
      const sharesFather =
        Boolean(parent.fatherId) &&
        Boolean(other.fatherId) &&
        parent.fatherId === other.fatherId;
      const sharesMother =
        Boolean(parent.motherId) &&
        Boolean(other.motherId) &&
        parent.motherId === other.motherId;

      if ((sharesFather || sharesMother) && !parentSiblingIds.has(other.id)) {
        parentSiblingIds.add(other.id);
        const isMale = String(other.sex || "").toUpperCase() === "MALE";
        const role = isMale ? "Uncle" : "Aunt";
        unclesAndAunts.push({
          animal: other,
          relationship: `${side} ${role}`,
          relationshipCategory: "UNCLE_AUNT",
          details: `Sibling of ${side === "Paternal" ? "Sire" : "Dam"}`,
        });
      }
    }
  };

  findParentSiblings(father, "Paternal");
  findParentSiblings(mother, "Maternal");

  // Nephews & Nieces: children of full or half siblings
  const nephewsAndNieces: KinshipRelation<T>[] = [];
  const allSiblingIds = new Set([
    ...twinSiblings.map((s) => s.animal.id),
    ...fullSiblings.map((s) => s.animal.id),
    ...maternalHalfSiblings.map((s) => s.animal.id),
    ...paternalHalfSiblings.map((s) => s.animal.id),
  ]);

  for (const other of allAnimals) {
    if (
      (other.fatherId && allSiblingIds.has(other.fatherId)) ||
      (other.motherId && allSiblingIds.has(other.motherId))
    ) {
      const isMale = String(other.sex || "").toUpperCase() === "MALE";
      const role = isMale ? "Nephew" : "Niece";
      nephewsAndNieces.push({
        animal: other,
        relationship: role,
        relationshipCategory: "NEPHEW_NIECE",
        details: "Offspring of brother or sister",
      });
    }
  }

  // Cousins: children of uncles and aunts
  const cousins: KinshipRelation<T>[] = [];
  for (const other of allAnimals) {
    if (
      (other.fatherId && parentSiblingIds.has(other.fatherId)) ||
      (other.motherId && parentSiblingIds.has(other.motherId))
    ) {
      cousins.push({
        animal: other,
        relationship: "First Cousin",
        relationshipCategory: "COUSIN",
        details: "Child of an Uncle or Aunt",
      });
    }
  }

  const totalRelationsCount =
    (father ? 1 : 0) +
    (mother ? 1 : 0) +
    twinSiblings.length +
    fullSiblings.length +
    maternalHalfSiblings.length +
    paternalHalfSiblings.length +
    children.length +
    grandchildren.length +
    grandparents.length +
    unclesAndAunts.length +
    nephewsAndNieces.length +
    cousins.length;

  return {
    subject: selectedAnimal,
    father,
    mother,
    twinSiblings,
    fullSiblings,
    maternalHalfSiblings,
    paternalHalfSiblings,
    children,
    grandchildren,
    grandparents,
    unclesAndAunts,
    nephewsAndNieces,
    cousins,
    totalRelationsCount,
  };
}

export const calculateKinship = calculateGenericKinship;


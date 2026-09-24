import { Pigeon } from "@/types/pigeon";

export type SiblingType =
  | "TWIN_SIBLING"
  | "FULL_SIBLING"
  | "MATERNAL_HALF_SIBLING"
  | "PATERNAL_HALF_SIBLING";

export interface RelatedPigeon {
  pigeon: Pigeon;
  relationship: string; // e.g. "Twin Brother", "Full Sister", "Maternal Half-Brother", "Son", "Paternal Grandfather", etc.
  relationshipCategory:
    | "PARENT"
    | "TWIN_SIBLING"
    | "FULL_SIBLING"
    | "MATERNAL_HALF_SIBLING"
    | "PATERNAL_HALF_SIBLING"
    | "CHILD"
    | "GRANDCHILD"
    | "GRANDPARENT"
    | "UNCLE_AUNT"
    | "NEPHEW_NIECE"
    | "COUSIN";
  details?: string;
}

export interface FamilyTreeSummary {
  subject: Pigeon;
  father: Pigeon | null;
  mother: Pigeon | null;
  twinSiblings: RelatedPigeon[];
  fullSiblings: RelatedPigeon[];
  maternalHalfSiblings: RelatedPigeon[];
  paternalHalfSiblings: RelatedPigeon[];
  children: RelatedPigeon[];
  grandchildren: RelatedPigeon[];
  grandparents: RelatedPigeon[];
  unclesAndAunts: RelatedPigeon[];
  nephewsAndNieces: RelatedPigeon[];
  cousins: RelatedPigeon[];
  totalRelationsCount: number;
}

/**
 * Normalizes birth / hatch date string (YYYY-MM-DD or partial) for comparison
 */
function getBirthDate(pigeon: Pigeon): string {
  return pigeon.birthDate || pigeon.hatchDate || "";
}

/**
 * Helper to determine sibling gender label
 */
function getSiblingGenderLabel(pigeon: Pigeon, baseType: string): string {
  const gender = pigeon.sex === "MALE" ? "Brother" : pigeon.sex === "FEMALE" ? "Sister" : "Sibling";
  if (baseType.endsWith("-")) {
    return `${baseType}${gender}`;
  }
  return `${baseType} ${gender}`;
}

/**
 * Helper to determine child gender label
 */
function getChildGenderLabel(pigeon: Pigeon): string {
  return pigeon.sex === "MALE" ? "Son" : pigeon.sex === "FEMALE" ? "Daughter" : "Child (Baby)";
}

/**
 * Helper to determine grandchild gender label
 */
function getGrandchildGenderLabel(pigeon: Pigeon): string {
  return pigeon.sex === "MALE" ? "Grandson" : pigeon.sex === "FEMALE" ? "Granddaughter" : "Grandchild";
}

/**
 * Calculates all biological family relationships for a given pigeon against the entire flock
 */
export function calculateFamilyRelationships(
  selectedPigeon: Pigeon,
  allPigeons: Pigeon[]
): FamilyTreeSummary {
  const pigeonMap = new Map<string, Pigeon>();
  for (const p of allPigeons) {
    if (p.id) pigeonMap.set(p.id, p);
  }

  const subjectId = selectedPigeon.id;
  const father = selectedPigeon.fatherId ? pigeonMap.get(selectedPigeon.fatherId) || null : null;
  const mother = selectedPigeon.motherId ? pigeonMap.get(selectedPigeon.motherId) || null : null;

  const subjectBirthDate = getBirthDate(selectedPigeon);
  const subjectClutchId = selectedPigeon.clutchId?.trim();

  const twinSiblings: RelatedPigeon[] = [];
  const fullSiblings: RelatedPigeon[] = [];
  const maternalHalfSiblings: RelatedPigeon[] = [];
  const paternalHalfSiblings: RelatedPigeon[] = [];

  // Determine Sibling Relationships
  for (const other of allPigeons) {
    if (other.id === subjectId) continue;

    const hasSameFather = Boolean(
      selectedPigeon.fatherId &&
      other.fatherId &&
      other.fatherId === selectedPigeon.fatherId
    );

    const hasSameMother = Boolean(
      selectedPigeon.motherId &&
      other.motherId &&
      other.motherId === selectedPigeon.motherId
    );

    // Both father and mother match
    if (hasSameFather && hasSameMother) {
      const otherBirthDate = getBirthDate(other);
      const otherClutchId = other.clutchId?.trim();

      // Check if same birth date or same clutch
      const isSameClutch = Boolean(subjectClutchId && otherClutchId && subjectClutchId === otherClutchId);
      const isSameBirthDate = Boolean(subjectBirthDate && otherBirthDate && subjectBirthDate === otherBirthDate);

      if (isSameClutch || isSameBirthDate) {
        twinSiblings.push({
          pigeon: other,
          relationship: getSiblingGenderLabel(other, "Twin"),
          relationshipCategory: "TWIN_SIBLING",
          details: `Same Sire (${selectedPigeon.fatherId}) & Dam (${selectedPigeon.motherId}), Same Birth Date / Clutch (${otherBirthDate || "Clutch Match"})`,
        });
      } else {
        fullSiblings.push({
          pigeon: other,
          relationship: getSiblingGenderLabel(other, "Full"),
          relationshipCategory: "FULL_SIBLING",
          details: `Same Sire (${selectedPigeon.fatherId}) & Dam (${selectedPigeon.motherId}), Different Birth Date / Clutch (${otherBirthDate || "Different Clutch"})`,
        });
      }
    } else if (hasSameMother && (!selectedPigeon.fatherId || !other.fatherId || other.fatherId !== selectedPigeon.fatherId)) {
      // Maternal half-sibling: same mother, different father
      maternalHalfSiblings.push({
        pigeon: other,
        relationship: getSiblingGenderLabel(other, "Maternal Half-"),
        relationshipCategory: "MATERNAL_HALF_SIBLING",
        details: `Same Dam (${selectedPigeon.motherId}), Different / Unmatched Sire`,
      });
    } else if (hasSameFather && (!selectedPigeon.motherId || !other.motherId || other.motherId !== selectedPigeon.motherId)) {
      // Paternal half-sibling: same father, different mother
      paternalHalfSiblings.push({
        pigeon: other,
        relationship: getSiblingGenderLabel(other, "Paternal Half-"),
        relationshipCategory: "PATERNAL_HALF_SIBLING",
        details: `Same Sire (${selectedPigeon.fatherId}), Different / Unmatched Dam`,
      });
    }
  }

  // Children: pigeons where fatherId or motherId is selectedPigeon.id
  const children: RelatedPigeon[] = [];
  const childrenSet = new Set<string>();
  for (const other of allPigeons) {
    if (other.id === subjectId) continue;
    if (other.fatherId === subjectId || other.motherId === subjectId) {
      childrenSet.add(other.id);
      children.push({
        pigeon: other,
        relationship: getChildGenderLabel(other),
        relationshipCategory: "CHILD",
        details: other.fatherId === subjectId ? "Direct Sire Line" : "Direct Dam Line",
      });
    }
  }

  // Grandchildren: children of children
  const grandchildren: RelatedPigeon[] = [];
  for (const other of allPigeons) {
    if (other.id === subjectId) continue;
    if (
      (other.fatherId && childrenSet.has(other.fatherId)) ||
      (other.motherId && childrenSet.has(other.motherId))
    ) {
      const parentPigeon = other.fatherId && childrenSet.has(other.fatherId)
        ? pigeonMap.get(other.fatherId)
        : other.motherId
        ? pigeonMap.get(other.motherId)
        : null;

      grandchildren.push({
        pigeon: other,
        relationship: getGrandchildGenderLabel(other),
        relationshipCategory: "GRANDCHILD",
        details: parentPigeon ? `Offspring of ${parentPigeon.id}` : "Second Generation",
      });
    }
  }

  // Grandparents
  const grandparents: RelatedPigeon[] = [];
  if (father?.fatherId && pigeonMap.has(father.fatherId)) {
    grandparents.push({
      pigeon: pigeonMap.get(father.fatherId)!,
      relationship: "Paternal Grandfather (Sire's Sire)",
      relationshipCategory: "GRANDPARENT",
      details: `Sire of ${father.id}`,
    });
  }
  if (father?.motherId && pigeonMap.has(father.motherId)) {
    grandparents.push({
      pigeon: pigeonMap.get(father.motherId)!,
      relationship: "Paternal Grandmother (Sire's Dam)",
      relationshipCategory: "GRANDPARENT",
      details: `Dam of ${father.id}`,
    });
  }
  if (mother?.fatherId && pigeonMap.has(mother.fatherId)) {
    grandparents.push({
      pigeon: pigeonMap.get(mother.fatherId)!,
      relationship: "Maternal Grandfather (Dam's Sire)",
      relationshipCategory: "GRANDPARENT",
      details: `Sire of ${mother.id}`,
    });
  }
  if (mother?.motherId && pigeonMap.has(mother.motherId)) {
    grandparents.push({
      pigeon: pigeonMap.get(mother.motherId)!,
      relationship: "Maternal Grandmother (Dam's Dam)",
      relationshipCategory: "GRANDPARENT",
      details: `Dam of ${mother.id}`,
    });
  }

  // Uncles & Aunts (siblings of father and mother)
  const unclesAndAunts: RelatedPigeon[] = [];
  const uncleAuntIds = new Set<string>();

  const findParentSiblings = (parent: Pigeon | null, side: "Paternal" | "Maternal") => {
    if (!parent) return;
    for (const other of allPigeons) {
      if (other.id === parent.id || other.id === subjectId || uncleAuntIds.has(other.id)) continue;
      const shareF = Boolean(parent.fatherId && other.fatherId && other.fatherId === parent.fatherId);
      const shareM = Boolean(parent.motherId && other.motherId && other.motherId === parent.motherId);
      if (shareF || shareM) {
        uncleAuntIds.add(other.id);
        const title = other.sex === "MALE" ? "Uncle" : other.sex === "FEMALE" ? "Aunt" : "Uncle/Aunt";
        const isFull = shareF && shareM;
        unclesAndAunts.push({
          pigeon: other,
          relationship: `${side} ${title} (${isFull ? "Full" : "Half"})`,
          relationshipCategory: "UNCLE_AUNT",
          details: `${side} bloodline sibling of ${parent.id}`,
        });
      }
    }
  };

  findParentSiblings(father, "Paternal");
  findParentSiblings(mother, "Maternal");

  // Nephews & Nieces: children of all siblings (twin, full, half)
  const allSiblingIds = new Set<string>([
    ...twinSiblings.map((s) => s.pigeon.id),
    ...fullSiblings.map((s) => s.pigeon.id),
    ...maternalHalfSiblings.map((s) => s.pigeon.id),
    ...paternalHalfSiblings.map((s) => s.pigeon.id),
  ]);

  const nephewsAndNieces: RelatedPigeon[] = [];
  const nephewNieceIds = new Set<string>();
  for (const other of allPigeons) {
    if (other.id === subjectId || nephewNieceIds.has(other.id)) continue;
    if (
      (other.fatherId && allSiblingIds.has(other.fatherId)) ||
      (other.motherId && allSiblingIds.has(other.motherId))
    ) {
      nephewNieceIds.add(other.id);
      const title = other.sex === "MALE" ? "Nephew" : other.sex === "FEMALE" ? "Niece" : "Nephew/Niece";
      const siblingParentId = (other.fatherId && allSiblingIds.has(other.fatherId)) ? other.fatherId : other.motherId;
      nephewsAndNieces.push({
        pigeon: other,
        relationship: title,
        relationshipCategory: "NEPHEW_NIECE",
        details: `Child of sibling ${siblingParentId}`,
      });
    }
  }

  // Cousins: children of uncles and aunts
  const cousins: RelatedPigeon[] = [];
  const cousinIds = new Set<string>();
  for (const other of allPigeons) {
    if (
      other.id === subjectId ||
      allSiblingIds.has(other.id) ||
      childrenSet.has(other.id) ||
      cousinIds.has(other.id)
    ) {
      continue;
    }

    if (
      (other.fatherId && uncleAuntIds.has(other.fatherId)) ||
      (other.motherId && uncleAuntIds.has(other.motherId))
    ) {
      cousinIds.add(other.id);
      const uaParentId = (other.fatherId && uncleAuntIds.has(other.fatherId)) ? other.fatherId : other.motherId;
      cousins.push({
        pigeon: other,
        relationship: "First Cousin",
        relationshipCategory: "COUSIN",
        details: `Child of uncle/aunt ${uaParentId}`,
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
    subject: selectedPigeon,
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

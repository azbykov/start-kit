/**
 * Utility functions for player-related operations
 */

import { Position } from "@prisma/client";

/**
 * Map position enum to short abbreviation (shorts)
 */
export const positionShorts: Record<Position, string> = {
  GK: "ВР",
  CB: "ЦЗ",
  LB: "ЛЗ",
  RB: "ПЗ",
  CM: "ЦП",
  CDM: "ОП",
  CAM: "АП",
  LM: "ЛП",
  RM: "ПП",
  CF: "ЦФ",
  SS: "ОФ",
  LW: "ЛВ",
  RW: "ПВ",
};

/**
 * Map position enum to full Russian display name
 */
export const positionLabels: Record<Position, string> = {
  GK: "Вратарь",
  CB: "Центральный защитник",
  LB: "Левый защитник",
  RB: "Правый защитник",
  CM: "Центральный полузащитник",
  CDM: "Опорный полузащитник",
  CAM: "Атакующий полузащитник",
  LM: "Левый полузащитник",
  RM: "Правый полузащитник",
  CF: "Центрфорвард",
  SS: "Оттянутый форвард",
  LW: "Левый вингер",
  RW: "Правый вингер",
};

/**
 * Map position enum to badge className for colors
 * Colors match the tactical diagram:
 * - GK: black
 * - Defenders (CB, LB, RB): blue
 * - Midfielders (CM, CDM, CAM, LM, RM): yellow
 * - Forwards (CF, SS, LW, RW): red
 */
export const positionBadgeClasses: Record<Position, string> = {
  GK: "border-black bg-black text-white font-mono",
  CB: "border-blue-600 bg-blue-500 text-white font-mono",
  LB: "border-blue-600 bg-blue-500 text-white font-mono",
  RB: "border-blue-600 bg-blue-500 text-white font-mono",
  CM: "border-yellow-600 bg-yellow-500 text-black font-mono",
  CDM: "border-yellow-600 bg-yellow-500 text-black font-mono",
  CAM: "border-yellow-600 bg-yellow-500 text-black font-mono",
  LM: "border-yellow-600 bg-yellow-500 text-black font-mono",
  RM: "border-yellow-600 bg-yellow-500 text-black font-mono",
  CF: "border-red-600 bg-red-500 text-white font-mono",
  SS: "border-red-600 bg-red-500 text-white font-mono",
  LW: "border-red-600 bg-red-500 text-white font-mono",
  RW: "border-red-600 bg-red-500 text-white font-mono",
};

/**
 * Get short abbreviation for position
 */
export function getPositionShort(position: Position): string {
  return positionShorts[position] || position;
}

/**
 * Get Russian display name for position
 */
export function getPositionLabel(position: Position): string {
  return positionLabels[position] || position;
}

/**
 * Get Russian display names for array of positions
 * Handles both array and single position for backward compatibility
 */
export function getPositionLabels(positions: Position | Position[]): string[] {
  if (Array.isArray(positions)) {
    return positions.map((pos) => getPositionLabel(pos));
  }
  // Handle single position (for backward compatibility during migration)
  return [getPositionLabel(positions)];
}

/**
 * Format array of positions as comma-separated string (short abbreviations)
 * Handles both array and single position for backward compatibility
 */
export function formatPositions(positions: Position | Position[]): string {
  const positionsArray = Array.isArray(positions) ? positions : [positions];
  return positionsArray.map((pos) => getPositionShort(pos)).join(", ");
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dateOfBirth: Date | string): number {
  const birthDate = typeof dateOfBirth === "string" 
    ? new Date(dateOfBirth) 
    : dateOfBirth;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format age with proper Russian pluralization
 */
export function formatAge(dateOfBirth: Date | string): string {
  const age = calculateAge(dateOfBirth);
  const lastDigit = age % 10;
  const lastTwoDigits = age % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return `${age} лет`;
  }
  
  if (lastDigit === 1) {
    return `${age} год`;
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${age} года`;
  }
  
  return `${age} лет`;
}

/**
 * Format date of birth as short year with age: '03(18)
 * @param dateOfBirth - Date or ISO date string
 * @returns Formatted string like "'03(18)"
 */
export function formatDateOfBirthShort(dateOfBirth: Date | string): string {
  const birthDate = typeof dateOfBirth === "string" 
    ? new Date(dateOfBirth) 
    : dateOfBirth;
  const year = birthDate.getFullYear();
  const shortYear = year.toString().slice(-2); // Last 2 digits
  const age = calculateAge(dateOfBirth);
  
  return `'${shortYear}(${age})`;
}

/**
 * Position category for sorting
 * 1 = Goalkeeper (GK)
 * 2 = Defender (CB, LB, RB)
 * 3 = Midfielder (CM, CDM, CAM, LM, RM)
 * 4 = Forward (CF, SS, LW, RW)
 */
export const positionCategory: Record<Position, number> = {
  GK: 1,
  CB: 2,
  LB: 2,
  RB: 2,
  CM: 3,
  CDM: 3,
  CAM: 3,
  LM: 3,
  RM: 3,
  CF: 4,
  SS: 4,
  LW: 4,
  RW: 4,
};

/**
 * Position order within category for sorting
 * Lower number = appears first in category
 */
export const positionOrder: Record<Position, number> = {
  GK: 1,
  CB: 1,
  LB: 2,
  RB: 3,
  CDM: 1,
  CM: 2,
  CAM: 3,
  LM: 4,
  RM: 5,
  CF: 1,
  SS: 2,
  LW: 3,
  RW: 4,
};

/**
 * Get position category for sorting (1=GK, 2=Defender, 3=Midfielder, 4=Forward)
 * For players with multiple positions, returns the minimum category (most defensive)
 */
export function getPositionCategory(positions: Position | Position[]): number {
  const positionsArray = Array.isArray(positions) ? positions : [positions];
  if (positionsArray.length === 0) return 99; // No position = last
  return Math.min(...positionsArray.map((pos) => positionCategory[pos] || 99));
}

/**
 * Get position order for sorting within category
 * For players with multiple positions, returns the minimum order
 */
export function getPositionOrder(positions: Position | Position[]): number {
  const positionsArray = Array.isArray(positions) ? positions : [positions];
  if (positionsArray.length === 0) return 99;
  const category = getPositionCategory(positionsArray);
  const positionsInCategory = positionsArray.filter(
    (pos) => positionCategory[pos] === category
  );
  if (positionsInCategory.length === 0) return 99;
  return Math.min(...positionsInCategory.map((pos) => positionOrder[pos] || 99));
}

/**
 * Sort players by position category and order
 * Order: Goalkeepers → Defenders → Midfielders → Forwards
 * Within each category, sorted by position order
 */
export function sortPlayersByPosition<T extends { position: Position | Position[] }>(
  players: T[]
): T[] {
  return [...players].sort((a, b) => {
    const categoryA = getPositionCategory(a.position);
    const categoryB = getPositionCategory(b.position);
    
    if (categoryA !== categoryB) {
      return categoryA - categoryB;
    }
    
    const orderA = getPositionOrder(a.position);
    const orderB = getPositionOrder(b.position);
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // If same position, sort by last name, then first name
    return 0;
  });
}
/**
 * Enhanced Intelligent Column Mapper with Fuzzy Matching
 *
 * Purpose: Advanced CSV column detection using fuzzy string matching and
 * confidence scoring to handle various header formats and typos.
 *
 * SRS Reference:
 * - FR-1.4: Column Mapping Interface (intelligent detection with fuzzy matching)
 * - Performance Requirements: Must handle 10k+ rows efficiently, <200 lines
 */

import { ColumnMapper, ColumnDetectionResult } from './types';
import { findBestMatch } from './fuzzy-matcher';

// Extensive pattern lists for comprehensive header detection
const FIRST_NAME_PATTERNS = [
  // Standard variations
  'first name', 'firstname', 'fname', 'first_name', 'first-name',
  'given name', 'givenname', 'given_name', 'given-name',
  'first', 'forename', 'christian name', 'christianname',
  
  // Common variations and typos
  'first nm', 'fname', 'f name', 'f_name', 'fst name',
  'given', 'prenom', 'vorname', 'nome', 'nom',
  
  // International variations
  'prénom', 'nombre', 'nome proprio', 'имя', 'نام',
  
  // Specific contexts
  'participant first name', 'customer first name', 'entrant first name',
  'buyer first name', 'user first name', 'person first name'
];

const LAST_NAME_PATTERNS = [
  // Standard variations
  'last name', 'lastname', 'lname', 'last_name', 'last-name',
  'surname', 'family name', 'familyname', 'family_name', 'family-name',
  'last', 'sur name', 'sir name', 'second name',
  
  // Common variations and typos
  'last nm', 'lname', 'l name', 'l_name', 'lst name',
  'apellido', 'cognome', 'nachname', 'sobrenome',
  
  // International variations
  'nom de famille', 'apellidos', 'cognome', 'фамилия', 'نام خانوادگی',
  
  // Specific contexts
  'participant last name', 'customer last name', 'entrant last name',
  'buyer last name', 'user last name', 'person last name'
];

const FULL_NAME_PATTERNS = [
  // Standard variations
  'name', 'full name', 'fullname', 'full_name', 'full-name',
  'participant name', 'participantname', 'participant_name', 'participant-name',
  'customer name', 'customername', 'customer_name', 'customer-name',
  'entrant name', 'entrantname', 'entrant_name', 'entrant-name',
  
  // Extended variations
  'complete name', 'completename', 'complete_name', 'person name',
  'buyer name', 'user name', 'username', 'player name', 'playername',
  'contestant name', 'winner name', 'winnername',
  
  // Common shortenings
  'nm', 'nome', 'nom', 'nombre', 'nome completo',
  'full nm', 'complete nm', 'person nm',
  
  // International variations
  'nom complet', 'nombre completo', 'nome completo', 'полное имя'
];

const TICKET_PATTERNS = [
  // Standard ticket variations (highest priority)
  'ticket', 'ticket number', 'ticketnumber', 'ticket_number', 'ticket-number',
  'ticket no', 'ticket#', 'ticket #', 'tkt', 'tkt number', 'tkt#',
  'tiket', 'tiket number', // Common typos
  
  // Entry variations (high priority)
  'entry', 'entry number', 'entrynumber', 'entry_number', 'entry-number',
  'entry no', 'entry#', 'entry #', 'entry id', 'entryid',
  
  // Confirmation and reference (medium-high priority)
  'confirmation', 'confirmation number', 'confirmation_number', 'confirmation-number',
  'ref', 'reference', 'ref number', 'reference number', 'booking ref',
  
  // Order-related IDs (medium priority)
  'order id', 'order #', 'order#', 'orderid', 'order number',
  
  // Raffle specific (medium priority)
  'raffle', 'raffle number', 'rafflenumber', 'raffle_number', 'raffle-number',
  'raffle ticket', 'raffle entry', 'raffle ticket id', 'draw number', 'drawnumber',
  
  // Generic ID variations (lower priority)
  'id', 'number', 'no', 'num', '#', 'identifier', 'unique id',
  'participant id', 'customer id', 'user id', 'player id',
  
  // Other variations
  'serial', 'serial number', 'code',
  
  // International
  'número', 'numero', 'número de entrada', 'billete', 'billet', 'biglietto', 'номер'
];

export class EnhancedColumnMapper implements ColumnMapper {
  private minConfidenceThreshold = 50; // Minimum 50% confidence for auto-mapping

  private processNameFields(
    firstNameMatch: { header: string; confidence: number } | null,
    lastNameMatch: { header: string; confidence: number } | null,
    fullNameMatch: { header: string; confidence: number } | null,
    results: ColumnDetectionResult,
    usedHeaders: Set<string>
  ): void {
    const sameNameHeader = firstNameMatch && lastNameMatch && 
                          firstNameMatch.header === lastNameMatch.header;
    
    if (sameNameHeader && fullNameMatch && fullNameMatch.header === firstNameMatch.header) {
      // Same header matches all name patterns - it's a full name
      results.fullName = fullNameMatch.header;
      results.confidence.fullName = fullNameMatch.confidence;
      usedHeaders.add(fullNameMatch.header);
    } else if (firstNameMatch && lastNameMatch && !sameNameHeader &&
               firstNameMatch.confidence >= this.minConfidenceThreshold &&
               lastNameMatch.confidence >= this.minConfidenceThreshold) {
      // Distinct first and last name columns
      results.firstName = firstNameMatch.header;
      results.confidence.firstName = firstNameMatch.confidence;
      results.lastName = lastNameMatch.header;
      results.confidence.lastName = lastNameMatch.confidence;
      usedHeaders.add(firstNameMatch.header);
      usedHeaders.add(lastNameMatch.header);
    } else if (fullNameMatch && fullNameMatch.confidence >= this.minConfidenceThreshold) {
      // Use full name if available
      results.fullName = fullNameMatch.header;
      results.confidence.fullName = fullNameMatch.confidence;
      usedHeaders.add(fullNameMatch.header);
    }
  }

  detectHeaders(headers: string[]): ColumnDetectionResult {
    const results: ColumnDetectionResult = {
      firstName: null,
      lastName: null,
      fullName: null,
      ticketNumber: null,
      confidence: {
        firstName: 0,
        lastName: 0,
        fullName: 0,
        ticketNumber: 0,
      },
      overallConfidence: 0,
    };

    // Find best matches for each field type
    const firstNameMatch = this.findBestHeaderMatch(headers, FIRST_NAME_PATTERNS);
    const lastNameMatch = this.findBestHeaderMatch(headers, LAST_NAME_PATTERNS);
    const fullNameMatch = this.findBestHeaderMatch(headers, FULL_NAME_PATTERNS);
    const ticketMatch = this.findBestHeaderMatch(headers, TICKET_PATTERNS);

    const usedHeaders = new Set<string>();

    // Process name fields
    this.processNameFields(firstNameMatch, lastNameMatch, fullNameMatch, results, usedHeaders);

    // Find ticket number that hasn't been used for names
    if (ticketMatch && 
        ticketMatch.confidence >= this.minConfidenceThreshold &&
        !usedHeaders.has(ticketMatch.header)) {
      results.ticketNumber = ticketMatch.header;
      results.confidence.ticketNumber = ticketMatch.confidence;
    }

    // Calculate overall confidence
    results.overallConfidence = this.calculateOverallConfidence(results);

    return results;
  }

  private findBestHeaderMatch(
    headers: string[],
    patterns: string[]
  ): { header: string; confidence: number } | null {
    let bestMatch: { header: string; confidence: number } | null = null;

    for (const header of headers) {
      // Skip non-string values or empty strings
      if (typeof header !== 'string' || !header || !header.trim()) {
        continue;
      }
      
      // Skip headers that are clearly not names or tickets
      const normalizedHeader = header.toLowerCase();
      if (normalizedHeader === 'email' || normalizedHeader === 'phone' || normalizedHeader === 'address') {
        continue;
      }
      
      const match = findBestMatch(header, patterns, this.minConfidenceThreshold);
      
      if (match && (!bestMatch || match.confidence > bestMatch.confidence)) {
        bestMatch = {
          header,
          confidence: match.confidence,
        };
      }
    }

    return bestMatch;
  }

  private calculateOverallConfidence(results: ColumnDetectionResult): number {
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    // Ticket number is critical (weight: 2.0)
    const ticketWeight = 2.0;
    if (results.ticketNumber) {
      totalScore += results.confidence.ticketNumber * ticketWeight;
    }
    maxPossibleScore += 100 * ticketWeight;

    // Names (weight: 1.0 each)
    const nameWeight = 1.0;
    if (results.fullName) {
      totalScore += results.confidence.fullName * nameWeight;
      maxPossibleScore += 100 * nameWeight;
    } else {
      if (results.firstName) {
        totalScore += results.confidence.firstName * nameWeight;
      }
      if (results.lastName) {
        totalScore += results.confidence.lastName * nameWeight;
      }
      maxPossibleScore += 200 * nameWeight; // Both first and last name
    }

    if (maxPossibleScore === 0) return 0;
    
    return Math.round((totalScore / maxPossibleScore) * 100);
  }

  /**
   * Get confidence level description for UI display
   */
  public getConfidenceDescription(confidence: number): string {
    if (confidence >= 90) return 'Excellent';
    if (confidence >= 75) return 'Very Good';
    if (confidence >= 60) return 'Good';
    if (confidence >= 40) return 'Fair';
    return 'Poor';
  }

  /**
   * Check if mapping should be automatically applied based on confidence
   */
  public shouldAutoApply(result: ColumnDetectionResult): boolean {
    return (
      result.overallConfidence >= 75 &&
      result.ticketNumber !== null &&
      (result.fullName !== null || (result.firstName !== null && result.lastName !== null))
    );
  }
}
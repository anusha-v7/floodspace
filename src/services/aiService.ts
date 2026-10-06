/**
 * FLOODTRACE AI - AI Copilot & Situation Intelligence Service
 *
 * CRITICAL GROUNDING RULE:
 * Responses must be generated strictly from verified system facts.
 * Hallucinating unverified figures or measurements is prohibited.
 */

import { MOCK_COPILOT_KNOWLEDGE, VERIFIED_SYSTEM_FACTS } from '../data/mockData';
import { CopilotMessage, VerifiedSystemFacts } from '../types';
import { ApiResponse, simulateNetworkDelay } from './api';

export interface CopilotQueryRequest {
  query: string;
  language: 'en' | 'ne';
  systemContext?: Partial<VerifiedSystemFacts>;
}

export interface CopilotQueryResponse {
  answer: string;
  groundedFacts: string[];
  suggestedFollowUps: string[];
  systemFactsSnapshot: VerifiedSystemFacts;
}

export async function askSituationCopilot(
  request: CopilotQueryRequest
): Promise<ApiResponse<CopilotQueryResponse>> {
  const queryLower = request.query.toLowerCase().trim();

  // Match against our knowledge bank or generate a grounded synthesis
  let matchedItem = MOCK_COPILOT_KNOWLEDGE.find((item) =>
    item.triggers.some((trig) => queryLower.includes(trig.toLowerCase()))
  );

  let answerText = '';
  let factsUsed: string[] = [];

  if (matchedItem) {
    answerText = request.language === 'ne' ? matchedItem.nepali : matchedItem.english;
    factsUsed = matchedItem.facts;
  } else {
    // Fallback strictly grounded on VERIFIED_SYSTEM_FACTS
    if (request.language === 'ne') {
      answerText = `प्रणालीको पछिल्लो प्रमाणीकरण अनुसार: त्रिशुली करिडोरमा कुल ${VERIFIED_SYSTEM_FACTS.totalAffectedAreaKm2} वर्ग कि.मी. क्षेत्र प्रभावित छ, ${VERIFIED_SYSTEM_FACTS.cutOffSettlementsCount} बस्तीहरू सम्पर्कविहीन छन् (अनुमानित ६,७१० बासिन्दा), र ${VERIFIED_SYSTEM_FACTS.affectedBridgesCount} पुलहरू क्षतिग्रस्त छन्।`;
    } else {
      answerText = `According to verified system telemetry: Monitored affected area is ${VERIFIED_SYSTEM_FACTS.totalAffectedAreaKm2} km², with ${VERIFIED_SYSTEM_FACTS.cutOffSettlementsCount} settlements isolated from road connections (${VERIFIED_SYSTEM_FACTS.cutOffPopulationEstimate} residents affected). ${VERIFIED_SYSTEM_FACTS.affectedBridgesCount} bridges and ${VERIFIED_SYSTEM_FACTS.affectedRoadsKm} km of roads are compromised. High priority response recommended for: ${VERIFIED_SYSTEM_FACTS.topPrioritySettlements.join(', ')}.`;
    }
    factsUsed = [
      `${VERIFIED_SYSTEM_FACTS.totalAffectedAreaKm2} km² affected area`,
      `${VERIFIED_SYSTEM_FACTS.cutOffSettlementsCount} cut-off settlements`,
      `${VERIFIED_SYSTEM_FACTS.affectedBridgesCount} damaged bridges`,
    ];
  }

  const responsePayload: CopilotQueryResponse = {
    answer: answerText,
    groundedFacts: factsUsed,
    suggestedFollowUps: [
      request.language === 'ne' ? 'कुन बस्तीहरू अलपत्र परेका छन्?' : 'Which settlements are currently cut off?',
      request.language === 'ne' ? 'कुन पुलको प्राथमिकता सबैभन्दा उच्च छ?' : 'Which bridge has the highest priority?',
      request.language === 'ne' ? 'सबैभन्दा बढी प्रभावित क्षेत्र कुन हो?' : 'Summarize the most affected zones.',
      request.language === 'ne' ? 'अस्पतालहरूको अवस्था कस्तो छ?' : 'Are referral hospitals accessible?',
    ],
    systemFactsSnapshot: VERIFIED_SYSTEM_FACTS,
  };

  return simulateNetworkDelay(responsePayload);
}

export function getInitialCopilotMessages(language: 'en' | 'ne'): CopilotMessage[] {
  return [
    {
      id: 'init-1',
      sender: 'assistant',
      timestamp: 'Just now',
      text:
        language === 'ne'
          ? 'नमस्ते! म FLOODTRACE आपत्कालीन प्रतिवेदन कोपाइलट हुँ। म केवल प्रणालीमा प्रमाणित भएका उपग्रह तथा सडक सञ्जाल तथ्याङ्कका आधारमा जवाफ दिन्छु। तपाईं कुन क्षेत्र वा बस्तीबारे जानकारी लिन चाहनुहुन्छ?'
          : 'Welcome to the FLOODTRACE AI Situation Copilot. I am strictly grounded on verified satellite change polygons and road graph analysis from the Trishuli flood event. Ask any question regarding isolated settlements, damaged bridges, or response priorities.',
      groundedFactsUsed: ['Corridor graph telemetry active', 'Grounding invariants enforced'],
      suggestedQuestions: [
        language === 'ne' ? 'कुन बस्तीहरू हाल सडकविहीन छन्?' : 'Which settlements are currently cut off?',
        language === 'ne' ? 'कुन पुल सबैभन्दा बढी क्षतिग्रस्त छ?' : 'Which bridge has the highest priority?',
        language === 'ne' ? 'उद्धार प्रतिवेदन तयार पार्नुहोस्' : 'Prepare a rescue situation report',
      ],
    },
  ];
}


import { GoogleGenAI, Type } from "@google/genai";
import { Synthesis } from "../../types/models";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Simulates semantic chunking of a large document.
 * In a real app, this would happen on the backend (Python Worker in the doc).
 */
export const chunkText = (text: string, chunkSize: number = 2000, overlap: number = 200): string[] => {
  const chunks: string[] = [];
  let currentPos = 0;

  while (currentPos < text.length) {
    const end = Math.min(currentPos + chunkSize, text.length);
    chunks.push(text.substring(currentPos, end));
    currentPos += chunkSize - overlap;
  }

  return chunks;
};

/**
 * Generates a synthesis of the Tender Offer (AO).
 */
export const generateAOSynthesis = async (tenderName: string, context: string): Promise<Synthesis> => {
  const ai = getAI();
  
  // For Gemini 3, we can often send a large context, but we respect the "chunking" intent
  // by selecting the most relevant parts or summarizing chunks first if needed.
  // Here we use a large window but cap it for safety.
  const optimizedContext = context.length > 50000 ? context.substring(0, 50000) + "... [tronqué]" : context;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tu es un expert en marchés publics BTP. Analyse ce DCE (Dossier de Consultation des Entreprises) et extrais une synthèse stratégique.
    PROJET: ${tenderName}
    CONTENU EXTRAIT: ${optimizedContext}
    
    Instructions: 
    1. Résume le projet en 3-4 phrases percutantes.
    2. Liste les dates clés (visites, questions, remise).
    3. Identifie les exigences techniques majeures.
    4. Souligne les risques financiers ou juridiques (pénalités, assurances).
    5. Liste les critères de jugement du mémoire technique.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          keyDates: { type: Type.ARRAY, items: { type: Type.STRING } },
          requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          risks: { type: Type.ARRAY, items: { type: Type.STRING } },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                weight: { type: Type.STRING }
              },
              required: ["label", "weight"]
            }
          }
        },
        required: ["summary", "keyDates", "requirements", "risks", "criteria"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as Synthesis;
  } catch (e) {
    console.error("Failed to parse synthesis JSON", e);
    throw new Error("Erreur de parsing de la synthèse IA");
  }
};

/**
 * Chat with the DCE content using RAG-like context injection.
 */
export const chatWithDCE = async (query: string, history: {role: string, content: string}[], dceContext: string) => {
  const ai = getAI();
  
  // Simulate RAG: in a real app, we would use embeddings to find the top K chunks.
  // Here we send the most relevant part of the context (simplified).
  const relevantContext = dceContext.length > 30000 ? dceContext.substring(0, 30000) : dceContext;

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `Tu es Copilote AO BTP, un assistant expert en analyse de dossiers d'appels d'offres.
      Tu as accès au contenu suivant extrait du DCE: 
      ---
      ${relevantContext}
      ---
      Réponds aux questions de l'utilisateur de manière précise, factuelle et professionnelle. 
      Cite les articles ou sections si possible. 
      Si l'information n'est pas présente dans le texte fourni, indique-le clairement au lieu d'inventer.`
    }
  });

  const response = await chat.sendMessage({ message: query });
  return response.text;
};

/**
 * Chat with all tenders context.
 */
export const chatWithAllTenders = async (query: string, tenders: any[]) => {
  const ai = getAI();
  
  const tendersContext = tenders.map(t => ({
    nom: t.name,
    client: t.moa,
    echeance: t.deadline,
    statut: t.status,
    lieu: t.location,
    description: t.description
  }));

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `Tu es Copilote AO BTP, un assistant stratégique. 
      Tu as une vue d'ensemble sur TOUS les appels d'offres de l'entreprise.
      Voici la liste des dossiers actuels:
      ${JSON.stringify(tendersContext, null, 2)}
      
      Réponds aux questions de l'utilisateur en analysant l'ensemble du pipeline.
      Tu peux comparer les dossiers, identifier des tendances, ou aider à prioriser selon les échéances.
      Sois concis, stratégique et professionnel.`
    }
  });

  const response = await chat.sendMessage({ message: query });
  return response.text;
};

/**
 * Generates a technical memory draft based on AO data and company profile.
 */
export const generateMemoryTechnical = async (tenderData: any, companyProfile: any, selectedTemplates?: any[]) => {
    const ai = getAI();
    
    const templatesContext = selectedTemplates && selectedTemplates.length > 0 
      ? `MODÈLES DE RÉFÉRENCE À UTILISER:\n${JSON.stringify(selectedTemplates)}`
      : `Utilise le style habituel de l'entreprise basé sur ses références.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Rédige un brouillon de mémoire technique convaincant pour l'appel d'offres "${tenderData.name}".
        
        ${templatesContext}
        
        DONNÉES DE L'ENTREPRISE:
        ${JSON.stringify(companyProfile)}
        
        DÉTAILS DU PROJET (DCE):
        ${JSON.stringify(tenderData)}
        
        Structure du mémoire à respecter:
        1. Compréhension des enjeux du projet
        2. Méthodologie d'exécution détaillée (phasage, techniques BTP)
        3. Moyens humains (équipes, expertises) et matériels (engins, outils)
        4. Management de la qualité, de la sécurité et de l'hygiène sur le chantier
        5. Démarche environnementale et RSE (gestion des déchets, bilan carbone)
        
        Utilise un ton professionnel, expert et rassurant pour le Maître d'Ouvrage.`,
    });
    return response.text;
}

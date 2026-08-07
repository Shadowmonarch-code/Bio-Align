import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// POST /api/ai/chat - AI Bioinformatics Assistant
export async function POST(request: NextRequest) {
  let message = '';
  
  try {
    const body = await request.json();
    message = body.message || '';
    const { history = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Initialize ZAI SDK
    const zai = await ZAI.create();

    // System prompt for bioinformatics assistant
    const systemPrompt = `You are BioAssist, an expert AI bioinformatics assistant for the BioAlign platform. You help researchers, students, and scientists with:

## Your Capabilities:
1. **Sequence Analysis** - Explain BLAST results, alignment scores, ORF findings
2. **Genomics** - Guide variant calling, SNP analysis, genome annotation
3. **Protein Analysis** - Help with structure prediction, domain analysis
4. **Transcriptomics** - Assist with RNA-seq analysis, differential expression
5. **Phylogenetics** - Guide tree building methods, bootstrap analysis
6. **Molecular Docking** - Explain binding energies, docking protocols
7. **CRISPR** - Help design guide RNAs, predict off-targets
8. **Primer Design** - Assist with PCR primer selection and validation
9. **Workflow Recommendations** - Suggest appropriate tools and pipelines
10. **Literature Guidance** - Point to relevant databases and resources

## Guidelines:
- Be concise but thorough in your explanations
- Use technical terms but explain them when needed
- Provide practical examples when possible
- Recommend specific BioAlign tools when relevant
- Include code snippets (Python/R) when helpful
- Format responses with clear headings and bullet points
- If you're unsure, say so and suggest consulting literature

## Available Databases to Reference:
NCBI (GenBank, PubMed, SRA), UniProt, PDB, AlphaFold DB, Ensembl, KEGG, Reactome, InterPro, Pfam, STRING, GEO, ClinVar, dbSNP

## Response Style:
- Professional yet approachable
- Use markdown formatting for readability
- Include visual indicators (🧬 for sequences, 📊 for data, 🔬 for experiments)
- End with suggested follow-up questions when appropriate`;

    // Build conversation history
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message },
    ];

    // Call AI API
    const completion = await zai.chat.completions.create({
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.9,
    });

    const response = completion.choices[0]?.message?.content || 
      'I apologize, but I was unable to generate a response. Please try again.';

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    
    // Return a fallback response if AI service is unavailable
    return NextResponse.json({
      success: true,
      response: `I understand you're asking about: "${message}"\n\nAs BioAssist, I'd be happy to help with your bioinformatics question! Here are some suggestions:\n\n1. 🧬 **For sequence analysis**: Try our BLAST or alignment tools\n2. 📊 **For data visualization**: Check out our charts and graphs features\n3. 🔬 **For experimental design**: Use our workflow builder\n\nCould you provide more details about what you'd like to accomplish? I'm here to help guide you through the analysis process.`,
      timestamp: new Date().toISOString(),
      fallback: true,
    });
  }
}
